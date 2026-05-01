import { NextRequest, NextResponse } from "next/server";
import { createProduct, createSubscriptionPlan } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const product = await createProduct();
    const plan = await createSubscriptionPlan(product.id);
    return NextResponse.json({
      success: true,
      product_id: product.id,
      plan_id: plan.id,
      message: `Save this as PAYPAL_PLAN_ID in Railway: ${plan.id}`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
