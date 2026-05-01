import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const faceImage = formData.get('faceImage') as File;
    const targetVideo = formData.get('targetVideo') as File;
    if (!userId || !faceImage || !targetVideo) {
      return NextResponse.json({ error: 'userId, faceImage, and targetVideo required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.plan === 'FREE' || user.plan === 'BASIC') {
      return NextResponse.json({ error: 'upgrade_required', message: 'Video face swap requires Pro or Unlimited', upgrade_url: '/pricing' }, { status: 402 });
    }
    const faceBuffer = Buffer.from(await faceImage.arrayBuffer());
    const videoBuffer = Buffer.from(await targetVideo.arrayBuffer());
    const faceUri = `data:${faceImage.type};base64,${faceBuffer.toString('base64')}`;
    const videoUri = `data:${targetVideo.type};base64,${videoBuffer.toString('base64')}`;
    const output = await replicate.run(
      'lucataco/facefusion:9a45832060e8c05149339bb10343aa793c13890e7568ddf613a1a897f0e849e8',
      { input: { source: faceUri, target: videoUri, face_enhancer: 'gfpgan_1.4' } }
    );
    const outputUrl = typeof output === 'string' ? output : (output as any)?.output || '';
    const record = await prisma.faceSwap.create({
      data: { userId, inputUrl: 'video-swap', outputUrl, watermarked: false, resolution: user.plan === 'UNLIMITED' ? 'ULTRA_HD' : 'HD', type: 'VIDEO' },
    });
    return NextResponse.json({ id: record.id, outputUrl, type: 'video', resolution: record.resolution });
  } catch (error) {
    console.error('[MADFaceShift] Video face swap failed:', error);
    return NextResponse.json({ error: 'Video face swap failed' }, { status: 500 });
  }
}
