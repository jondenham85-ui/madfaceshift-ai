import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export async function POST(req: NextRequest) {
  try {
    const { userId, sourceImageUrl, targetGifUrl } = await req.json();
    if (!userId || !sourceImageUrl || !targetGifUrl) {
      return NextResponse.json({ error: 'userId, sourceImageUrl, and targetGifUrl required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.plan === 'FREE' || user.plan === 'BASIC') {
      return NextResponse.json({ error: 'upgrade_required', message: 'GIF face swap requires Pro+', upgrade_url: '/pricing' }, { status: 402 });
    }
    const output = await replicate.run(
      'lucataco/facefusion:9a45832060e8c05149339bb10343aa793c13890e7568ddf613a1a897f0e849e8',
      { input: { source: sourceImageUrl, target: targetGifUrl, face_enhancer: 'gfpgan_1.4', output_video_encoder: 'libx264' } }
    );
    const outputUrl = typeof output === 'string' ? output : (output as any)?.output || '';
    const record = await prisma.faceSwap.create({
      data: { userId, inputUrl: targetGifUrl, outputUrl, watermarked: false, resolution: 'HD', type: 'GIF' },
    });
    return NextResponse.json({ id: record.id, outputUrl, type: 'gif' });
  } catch (error) {
    console.error('[MADFaceShift] GIF face swap failed:', error);
    return NextResponse.json({ error: 'GIF face swap failed' }, { status: 500 });
  }
}
