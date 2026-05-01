import { NextRequest, NextResponse } from "next/server";
import { getUserFeatures, hasProAccess } from "@/lib/subscription";

const dailySwaps = new Map<string, { count: number; date: string }>();
function today() { return new Date().toISOString().slice(0, 10); }
function used(uid: string) { const e = dailySwaps.get(uid); return (!e || e.date !== today()) ? 0 : e.count; }
function inc(uid: string) { const d = today(); const e = dailySwaps.get(uid); if (!e || e.date !== d) dailySwaps.set(uid, { count: 1, date: d }); else e.count++; }

export function withProGate(handler: (req: NextRequest, ctx: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const userId = req.headers.get("x-user-id") || req.cookies.get("userId")?.value || "anon";
    const features = await getUserFeatures(userId);
    const isPro = await hasProAccess(userId);
    const swapsUsed = used(userId);
    if (!isPro && swapsUsed >= features.swapsPerDay) {
      return NextResponse.json({ error: "daily_limit_reached", message: `Used all ${features.swapsPerDay} free swaps today.`, upgrade_url: "/pricing", upgrade_cta: "Upgrade to Pro - $14.99/mo" }, { status: 402 });
    }
    if (!isPro) inc(userId);
    return handler(req, { isPro, maxResolution: features.maxResolution, watermark: features.watermark, batchMode: features.batchMode, swapsRemaining: isPro ? Infinity : features.swapsPerDay - swapsUsed - 1 });
  };
}
