import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, purpose, code, competitionId } = await req.json();
  
  if (!email || !purpose || !code) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const res = await verifyOtp(email, purpose, code);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });

  if (purpose === "POST_REVIEW" && competitionId) {
    const person = await prisma.person.findFirst({ 
      where: { email: { equals: email, mode: "insensitive" } },
      include: { 
        teamMemberships: { where: { competitionId }, select: { role: true } },
        archiveRoles: { where: { archive: { competitionId } }, select: { role: true } }
      }
    });

    if (person) {
      let role = "GUEST";
      if (person.teamMemberships.length > 0) role = "PARTICIPANT";
      else if (person.archiveRoles.some(r => r.role === "ORGANIZER")) role = "ORGANIZER";
      else if (person.archiveRoles.some(r => r.role === "JUDGE")) role = "JUDGE";

      // Only allow if they have a role
      if (role === "GUEST" && person.archiveRoles.length === 0) {
          return NextResponse.json({ error: "You do not have a registered role in this competition." }, { status: 403 });
      }

      return NextResponse.json({ 
        ok: true, 
        person: { name: person.name, photo: person.photo, savdId: person.savdId, role } 
      });
    }
  }

  return NextResponse.json({ ok: true });
}