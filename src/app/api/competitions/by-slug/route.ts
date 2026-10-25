import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

  const comp = await prisma.competition.findUnique({ where: { slug }, select: { id: true } });
  return NextResponse.json(comp || {});
}