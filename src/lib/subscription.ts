import { prisma } from "./prisma";

export type PlanType = "free" | "basic" | "pro" | "unlimited";

export const PLANS = {
    FREE: {
          name: "Free", price: 0, swapsPerDay: 3,
          features: { maxResolution: 512, watermark: true, batchMode: false, priorityQueue: false, hdExport: false }
    },
    BASIC: {
          name: "Basic", price: 9, planEnvKey: "PAYPAL_PLAN_BASIC", swapsPerDay: 30,
          features: { maxResolution: 1024, watermark: false, batchMode: false, priorityQueue: false, hdExport: true }
    },
    PRO: {
          name: "Pro", price: 29, planEnvKey: "PAYPAL_PLAN_PRO", swapsPerDay: 150,
          features: { maxResolution: 2048, watermark: false, batchMode: true, priorityQueue: true, hdExport: true }
    },
    UNLIMITED: {
          name: "Unlimited", price: 79, planEnvKey: "PAYPAL_PLAN_UNLIMITED", swapsPerDay: Infinity,
          features: { maxResolution: 4096, watermark: false, batchMode: true, priorityQueue: true, hdExport: true }
    },
} as const;

export async function updateUserSubscription(email: string, plan: PlanType, subscriptionId?: string) {
    return prisma.user.update({
          where: { email },
          data: {
                  plan,
                  subscriptionId: subscriptionId || null,
                  swapsUsed: 0,
                  swapsLimit: getPlanSwapsLimit(plan),
          },
    });
}

export function getPlanSwapsLimit(plan: PlanType): number {
    switch (plan) {
      case "basic": return 30;
      case "pro": return 150;
      case "unlimited": return 999999;
      default: return 3;
    }
}

export async function hasProAccess(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
  return user?.plan !== "free";
}

export async function getUserPlan(email: string): Promise<PlanType> {
    const user = await prisma.user.findUnique({ where: { email } });
  return (user?.plan as PlanType) || "free";
}

export async function getUserFeatures(email: string) {
    const plan = await getUserPlan(email);
    const key = plan.toUpperCase() as keyof typeof PLANS;
    return PLANS[key]?.features || PLANS.FREE.features;
}

export async function canUserSwap(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return false;
  return user.swapsUsed < user.swapsLimit;
}

export async function incrementSwapCount(email: string) {
    return prisma.user.update({
          where: { email },
          data: { swapsUsed: { increment: 1 } },
    });
}
