import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Replicate from 'replicate';
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const faceImage = formData.get('faceImage') as File;
    const audioFile = formData.get('audioFile') as File;
    if (!userId || !faceImage || !audioFile) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (user.plan !== 'UNLIMITED') return NextResponse.json({ error: 'upgrade_required', message: 'Lip Sync requires Unlimited plan', upgrade_url: '/pricing' }, { status: 402 });
    const faceB = Buffer.from(await faceImage.arrayBuffer());
    const audioB = Buffer.from(await audioFile.arrayBuffer());
    const faceUri = `data:${faceImage.type};base64,${faceB.toString('base64')}`;
    const audioUri = `data:${audioFile.type};base64,${audioB.toString('base64')}`;
    const output = await replicate.run('cjwbw/sadtalker:3aa3dac9353cc4d6bd62a8f95957bd844003b401ca4e4a9b33baa574c549d376', {
      input: { source_image: faceUri, driven_audio: audioUri, enhancer: 'gfpgan', preprocess: 'crop', still_mode: false }
    });
    const outputUrl = typeof output === 'string' ? output : (output as any)?.output || '';
    const record = await prisma.faceSwap.create({ data: { userId, inputUrl: 'lip-sync', outputUrl, watermarked: false, resolution: 'ULTRA_HD', type: 'LIP_SYNC' } });
    return NextResponse.json({ id: record.id, outputUrl, type: 'lip_sync' });
  } catch (e) { return NextResponse.json({ error: 'Lip sync failed' }, { status: 500 }); }
}
