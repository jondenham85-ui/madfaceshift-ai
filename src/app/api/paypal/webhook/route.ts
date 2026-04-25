import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paypal";

const PLAN_LIMITS: Record<string, { plan: string; limit: number }> = {
  [process.env.PAYPAL_PLAN_BASIC!]: { plan: "basic", limit: 50 },
  [process.env.PAYPAL_PLAN_PRO!]: { plan: "pro", limit: 200 },
  [process.env.PAYPAL_PLAN_UNLIMITED!]: { plan: "unlimited", limit: 999999 },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => (headers[k] = v));

  const isValid = await verifyWebhookSignature(headers, body);
  if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(body);

  if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
    const sub = event.resource;
    const email = sub.subscriber?.email_address;
    const planId = sub.plan_id;
    const config = PLAN_LIMITS[planId];
    if (email && config) {
      await prisma.user.updateMany({
        where: { email },
        data: { plan: config.plan, swapsLimit: config.limit, swapsUsed: 0, subscriptionId: sub.id },
      });
    }
  }

  if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
    const subId = event.resource?.id;
    if (subId) {
      await prisma.user.updateMany({
        where: { subscriptionId: subId },
        data: { plan: "free", swapsLimit: 3, subscriptionId: null },
      });
    }
  }

  return NextResponse.json({ received: true });
}
