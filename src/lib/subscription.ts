// MADFaceShift AI - Subscription State Manager

export type SubscriptionStatus = "free" | "active" | "cancelled" | "suspended" | "past_due";

export interface UserSubscription {
  userId?: string;
  email?: string;
  paypalSubscriptionId?: string;
  planId?: string;
  status: SubscriptionStatus;
  startTime?: string;
  nextBillingTime?: string;
  lastPaymentAmount?: string;
  lastPaymentTime?: string;
  cancelledAt?: string;
}

const subscriptions = new Map<string, UserSubscription>();

export async function updateUserSubscription(
  data: Partial<UserSubscription> & { paypalSubscriptionId?: string; email?: string }
) {
  const key = data.paypalSubscriptionId || data.email;
  if (!key) throw new Error("Need paypalSubscriptionId or email");
  const existing = subscriptions.get(key) || { status: "free" as const };
  const updated = { ...existing, ...data };
  subscriptions.set(key, updated);
  return updated;
}

export async function getUserSubscription(id: string): Promise<UserSubscription> {
  return subscriptions.get(id) || { status: "free" };
}

export async function hasProAccess(id: string): Promise<boolean> {
  const sub = await getUserSubscription(id);
  return sub.status === "active";
}

export const PLANS = {
  FREE: {
    name: "Free", price: 0,
    features: { swapsPerDay: 3, maxResolution: 512, watermark: true, batchMode: false, priorityQueue: false, hdExport: false }
  },
  PRO: {
    name: "Pro", price: 14.99, priceId: process.env.PAYPAL_PLAN_ID || "",
    features: { swapsPerDay: Infinity, maxResolution: 4096, watermark: false, batchMode: true, priorityQueue: true, hdExport: true }
  }
} as const;

export async function getUserFeatures(id: string) {
  const isPro = await hasProAccess(id);
  return isPro ? PLANS.PRO.features : PLANS.FREE.features;
}
