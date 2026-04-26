import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ratelimit } from "@/lib/ratelimit";

const FAL_KEY = process.env.FAL_KEY!;

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
    const response = await fetch("https://fal.run/fal-ai/face-swap", {
      method: "POST",
      headers: {
        "Authorization": "Key " + FAL_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base_image_url: targetUrl,
        swap_image_url: sourceUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    const resultUrl = data.image?.url || "";

    await prisma.swap.update({
      where: { id: swap.id },
      data: { resultUrl, status: "completed" }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { swapsUsed: { increment: 1 } }
    });

    return NextResponse.json({ resultUrl, swapsUsed: user.swapsUsed + 1, swapsLimit: user.swapsLimit });
  } catch (error: any) {
    await prisma.swap.update({
      where: { id: swap.id },
      data: { status: "failed" }
    });
    return NextResponse.json({ error: error.message || "Face swap failed" }, { status: 500 });
  }
}
