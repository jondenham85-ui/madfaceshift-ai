import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSubscription } from "@/lib/paypal";

const PLAN_MAP: Record<string, string> = {
  basic: process.env.PAYPAL_PLAN_BASIC!,
  pro: process.env.PAYPAL_PLAN_PRO!,
  unlimited: process.env.PAYPAL_PLAN_UNLIMITED!,
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  const planId = PLAN_MAP[plan];
  if (!planId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const subscription = await createSubscription(planId, session.user.email);
  const approveLink = subscription.links?.find((l: any) => l.rel === "approve")?.href;
  return NextResponse.json({ approveUrl: approveLink, subscriptionId: subscription.id });
}
