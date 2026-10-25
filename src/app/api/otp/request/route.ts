import { NextResponse } from "next/server";
import { createAndSendOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, purpose } = await req.json();

  if (!email || !purpose) return NextResponse.json({ error: "Email and purpose required" }, { status: 400 });

  if (purpose === "POST_REVIEW") {
    const person = await prisma.person.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
    if (person) {
      await createAndSendOtp(email, purpose);
    }
    return NextResponse.json({ ok: true, message: "If this email is registered, a code has been sent." });
  }

  const res = await createAndSendOtp(email, purpose);
  return NextResponse.json(res);
}