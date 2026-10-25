import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  let searchCnic = q;
  const digitsOnly = q.replace(/\D/g, "");
  if (digitsOnly.length === 13) {
    searchCnic = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12, 13)}`;
  }

  const where = q ? {
    OR: [
      { serial: { contains: q, mode: "insensitive" as any } },
      { person: { name: { contains: q, mode: "insensitive" as any } } },
      { person: { savdId: { contains: q, mode: "insensitive" as any } } },
      { person: { studentId: { contains: q, mode: "insensitive" as any } } },
      { person: { email: { contains: q, mode: "insensitive" as any } } },
      { person: { cnic: { contains: searchCnic, mode: "insensitive" as any } } },
    ]
  } : undefined;

  const [certs, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      include: {
        person: { select: { name: true, savdId: true, studentId: true, university: true } },
        competition: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.certificate.count({ where })
  ]);

  return NextResponse.json({ 
    results: certs, 
    total,
    totalPages: Math.ceil(total / limit)
  });
}