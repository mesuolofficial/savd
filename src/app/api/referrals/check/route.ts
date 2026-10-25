import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) return NextResponse.json({ valid: false });

  const partner = await prisma.partner.findUnique({
    where: { referralCode: code },
    select: { name: true, status: true }
  });

  if (partner && partner.status === "APPROVED") {
    return NextResponse.json({ valid: true, name: partner.name });
  }

  return NextResponse.json({ valid: false });
}