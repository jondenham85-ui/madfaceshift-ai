import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export async function POST(req: NextRequest) {
  try {
    const { userId, sourceImageUrl, targetImageUrl, faceIndex } = await req.json();
    if (!userId || !sourceImageUrl || !targetImageUrl) {
      return NextResponse.json({ error: 'userId, sourceImageUrl, and targetImageUrl required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const isPro = user.plan === 'PRO' || user.plan === 'UNLIMITED';
    if (!isPro && faceIndex !== undefined && faceIndex > 0) {
      return NextResponse.json({ error: 'upgrade_required', message: 'Multi-face swap requires Pro+', upgrade_url: '/pricing' }, { status: 402 });
    }
    const output = await replicate.run(
      'lucataco/facefusion:9a45832060e8c05149339bb10343aa793c13890e7568ddf613a1a897f0e849e8',
      { input: { source: sourceImageUrl, target: targetImageUrl, face_selector_order: 'left-right', face_selector_mode: 'reference', reference_face_position: faceIndex ?? 0, face_enhancer: isPro ? 'gfpgan_1.4' : 'none' } }
    );
    const outputUrl = typeof output === 'string' ? output : (output as any)?.output || '';
    const record = await prisma.faceSwap.create({
      data: { userId, inputUrl: targetImageUrl, outputUrl, watermarked: !isPro, resolution: isPro ? 'HD' : 'LOW', type: 'MULTI_FACE' },
    });
    return NextResponse.json({ id: record.id, outputUrl, watermarked: !isPro, faceIndex: faceIndex ?? 0, isPro });
  } catch (error) {
    console.error('[MADFaceShift] Multi-face swap failed:', error);
    return NextResponse.json({ error: 'Multi-face swap failed' }, { status: 500 });
  }
}
