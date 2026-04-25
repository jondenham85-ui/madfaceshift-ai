import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      service: "MADFaceShift AI",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "degraded", service: "MADFaceShift AI", database: "disconnected", error: error.message, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
