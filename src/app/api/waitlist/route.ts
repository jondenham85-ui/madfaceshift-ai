import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
          const { email, name } = await request.json();

      if (!email || !email.includes('@')) {
              return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
                      );
      }

      const existing = await prisma.waitlist.findUnique({
              where: { email },
      });

      if (existing) {
              return NextResponse.json(
                { message: 'You are already on the waitlist!' },
                { status: 200 }
                      );
      }

      await prisma.waitlist.create({
              data: {
                        email,
                        name: name || null,
              },
      });

      return NextResponse.json(
        { message: 'Successfully joined the waitlist!' },
        { status: 201 }
            );
    } catch (error) {
          console.error('Waitlist error:', error);
          return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
                );
    }
}

export async function GET() {
    try {
          const count = await prisma.waitlist.count();
          return NextResponse.json({ count });
    } catch (error) {
          return NextResponse.json({ count: 0 });
    }
}
