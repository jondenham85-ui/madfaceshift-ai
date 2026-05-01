import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Replicate from 'replicate';
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const STYLES: Record<string, string> = {
  cartoon: 'cartoon style, pixar, 3d render, colorful',
  anime: 'anime style, manga art, studio ghibli, cel shading',
  oil_painting: 'oil painting, renaissance portrait, brush strokes',
  cyberpunk: 'cyberpunk style, neon lights, futuristic, sci-fi',
  vintage: '1920s vintage photograph, sepia tone, film grain',
  pop_art: 'andy warhol pop art, bold colors, halftone dots',
  watercolor: 'watercolor painting, soft edges, pastel colors',
  sketch: 'pencil sketch, charcoal drawing, black and white'
};
export async function POST(req: NextRequest) {
  try {
    const { userId, imageUrl, style } = await req.json();
    if (!userId || !imageUrl || !style) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    if (!STYLES[style]) return NextResponse.json({ error: 'Invalid style', available: Object.keys(STYLES) }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const isPro = user.plan === 'PRO' || user.plan === 'UNLIMITED';
    if (!isPro) {
      const today = new Date(); today.setHours(0,0,0,0);
      const count = await prisma.faceSwap.count({ where: { userId, type: 'STYLE', createdAt: { gte: today } } });
      if (count >= 1) return NextResponse.json({ error: 'daily_limit', message: '1 free style/day. Upgrade for unlimited!', upgrade_url: '/pricing' }, { status: 402 });
    }
    const output = await replicate.run('stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc', {
      input: { image: imageUrl, prompt: STYLES[style], negative_prompt: 'blurry, distorted', prompt_strength: 0.65, width: isPro ? 1024 : 512, height: isPro ? 1024 : 512 }
    });
    const outputUrl = Array.isArray(output) ? output[0] : typeof output === 'string' ? output : '';
    const record = await prisma.faceSwap.create({ data: { userId, inputUrl: imageUrl, outputUrl, watermarked: !isPro, resolution: isPro ? 'HD' : 'LOW', type: 'STYLE' } });
    return NextResponse.json({ id: record.id, outputUrl, style, isPro });
  } catch (e) { return NextResponse.json({ error: 'Style filter failed' }, { status: 500 }); }
}
export async function GET() {
  return NextResponse.json({ styles: Object.keys(STYLES).map(k => ({ id: k, name: k.replace(/_/g,' ') })) });
}
