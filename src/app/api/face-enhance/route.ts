import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export async function POST(req: NextRequest) {
  try {
    const { userId, imageUrl, enhanceLevel } = await req.json();
    if (!userId || !imageUrl) {
      return NextResponse.json({ error: 'userId and imageUrl required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const isPro = user.plan === 'PRO' || user.plan === 'UNLIMITED';
    const model = isPro
      ? 'tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c'
      : 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa';
    const scale = isPro ? (enhanceLevel === 'ultra' ? 4 : 2) : 2;
    const output = await replicate.run(model, {
      input: { img: imageUrl, scale, version: 'v1.4', face_enhance: true },
    });
    const outputUrl = typeof output === 'string' ? output : (output as any)?.output || '';
    return NextResponse.json({ outputUrl, enhanced: true, scale, isPro,
      upgradePrompt: !isPro ? 'Upgrade for 4x Ultra HD + GFPGAN. $29/mo' : undefined });
  } catch (error) {
    console.error('[MADFaceShift] Face enhance failed:', error);
    return NextResponse.json({ error: 'Face enhance failed' }, { status: 500 });
  }
}
