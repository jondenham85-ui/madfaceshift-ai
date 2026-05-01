import { NextRequest, NextResponse } from "next/server";
import { createProduct, createSubscriptionPlan } from "@/lib/paypal";

export async function POST(req: NextRequest) {
    const auth = req.headers.get("authorization");
    if (auth !== "Bearer " + (process.env.ADMIN_SECRET || "")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
          const product = await createProduct();
          const basicPlan = await createSubscriptionPlan(product.id, "Basic", "9.00");
          const proPlan = await createSubscriptionPlan(product.id, "Pro", "29.00");
          const unlimitedPlan = await createSubscriptionPlan(product.id, "Unlimited", "79.00");
          return NextResponse.json({
                  success: true,
                  product_id: product.id,
                  basic_plan_id: basicPlan.id,
                  pro_plan_id: proPlan.id,
                  unlimited_plan_id: unlimitedPlan.id,
                  message: "Save these plan IDs in your Railway environment variables"
          });
    } catch (e: any) {
          return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
