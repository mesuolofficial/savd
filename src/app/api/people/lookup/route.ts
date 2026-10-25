import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const savdId = searchParams.get("savdId")?.trim();

  if (!savdId) return NextResponse.json({ found: false });

  const person = await prisma.person.findUnique({
    where: { savdId },
    select: { id: true, name: true, email: true, university: true },
  });

  if (person) {
    return NextResponse.json({ found: true, person });
  }
  return NextResponse.json({ found: false });
}