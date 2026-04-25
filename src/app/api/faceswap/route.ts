import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ratelimit } from "@/lib/ratelimit";
import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { success } = await ratelimit.limit(userId);
  if (!success) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.swapsUsed >= user.swapsLimit) {
    return NextResponse.json({ error: "Swap limit reached. Upgrade your plan!" }, { status: 403 });
  }

  const { sourceUrl, targetUrl } = await req.json();
  if (!sourceUrl || !targetUrl) {
    return NextResponse.json({ error: "sourceUrl and targetUrl required" }, { status: 400 });
  }

  const swap = await prisma.swap.create({
    data: { userId, sourceUrl, targetUrl, status: "processing" },
  });

  try {
    const output = await replicate.run("yan-ops/face_swap", {
      input: { local_source: sourceUrl, local_target: targetUrl },
    });
    const resultUrl = typeof output === "string" ? output : (output as any)?.[0] || "";
    await prisma.swap.update({ where: { id: swap.id }, data: { resultUrl, status: "completed" } });
    await prisma.user.update({ where: { id: userId }, data: { swapsUsed: { increment: 1 } } });
    return NextResponse.json({ resultUrl, swapsUsed: user.swapsUsed + 1, swapsLimit: user.swapsLimit });
  } catch (error: any) {
    await prisma.swap.update({ where: { id: swap.id }, data: { status: "failed" } });
    return NextResponse.json({ error: error.message || "Face swap failed" }, { status: 500 });
  }
}
