import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(req: Request) {
    const body = await req.json();
    const { key, value, secret } = body;

  if (secret !== ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!key || !value) {
        return NextResponse.json({ error: "Key and value required" }, { status: 400 });
  }

  const setting = await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
  });

  return NextResponse.json({ success: true, setting });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

  if (secret !== ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.setting.findMany();
    return NextResponse.json({ settings });
}
