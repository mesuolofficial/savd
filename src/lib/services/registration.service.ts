import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isRegistrationOpen } from "@/lib/competition-status";
import { getSettings } from "@/lib/settings";
import type { RegistrationInput } from "@/lib/validators/registration.schema";

export type SubmitResult =
  | { ok: true; registrationId: string; teamName: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function submitRegistration(competitionSlug: string, input: RegistrationInput): Promise<SubmitResult> {
  const competition = await prisma.competition.findUnique({ where: { slug: competitionSlug } });
  if (!competition) return { ok: false, error: "Competition not found." };
  if (!competition.isPublished) return { ok: false, error: "This competition is not open for registration." };

  const settings = await getSettings();
  if (!isRegistrationOpen(competition, new Date(), settings.globalRegistrationOpen)) {
    return { ok: false, error: "Registration for this competition is closed." };
  }

  const totalSize = 1 + input.members.length;
  if (totalSize < competition.minTeamSize) {
    return { ok: false, error: `This competition needs at least ${competition.minTeamSize} team members in total.` };
  }
  if (totalSize > competition.maxTeamSize) {
    return { ok: false, error: `This competition allows up to ${competition.maxTeamSize} team members in total.` };
  }

  // --- CNIC UNIQUENESS CHECK ---
  if (!competition.allowMultipleTeams) {
    const allCnics = [input.leaderCnic, ...input.members.map(m => m.cnic)];
    
    const uniqueCnics = new Set(allCnics);
    if (uniqueCnics.size !== allCnics.length) {
      return { ok: false, error: "Duplicate CNIC detected within your team." };
    }

    // ONLY BLOCK IF PENDING OR APPROVED <--- FIX APPLIED
    const existingLeader = await prisma.registration.findFirst({
      where: { 
        competitionId: competition.id, 
        leaderCnic: { in: allCnics },
        status: { in: ["PENDING", "APPROVED"] }
      },
      select: { leaderCnic: true, teamName: true }
    });
    if (existingLeader) {
      return { ok: false, error: `CNIC ${existingLeader.leaderCnic} is already registered as a leader in team "${existingLeader.teamName}".` };
    }

    const existingMember = await prisma.registrationMember.findFirst({
      where: { 
        registration: { 
          competitionId: competition.id,
          status: { in: ["PENDING", "APPROVED"] }
        }, 
        cnic: { in: allCnics } 
      },
      include: { registration: { select: { teamName: true } } }
    });
    if (existingMember) {
      return { ok: false, error: `CNIC ${existingMember.cnic} is already registered as a member in team "${existingMember.registration.teamName}".` };
    }
  }
  // -----------------------------

  let finalUniversityName = input.leaderUniversityText || "";
  let finalUniversityId: string | null = null;

  if (input.leaderUniversityId && input.leaderUniversityId !== "other") {
    const uni = await prisma.university.findUnique({ where: { id: input.leaderUniversityId } });
    if (!uni) return { ok: false, error: "Invalid university." };
    finalUniversityName = uni.name;
    finalUniversityId = uni.id;
  } else if (input.leaderUniversityId === "other" && !input.leaderUniversityText) {
    return { ok: false, error: "Please type your institution name.", fieldErrors: { leaderUniversityText: "Institution name required" } };
  }

  const leaderEmail = input.leaderEmail.toLowerCase();
  const existing = await prisma.registration.findUnique({
    where: { competitionId_leaderEmail: { competitionId: competition.id, leaderEmail } },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "This email has already registered a team for this competition.", fieldErrors: { leaderEmail: "Already registered" } };
  }

  try {
    const registration = await prisma.registration.create({
      data: {
        competitionId: competition.id,
        teamName: input.teamName,
        leaderName: input.leaderName,
        leaderEmail,
        leaderWhatsapp: input.leaderWhatsapp,
        leaderSapId: input.leaderSapId,
        leaderCnic: input.leaderCnic,
        leaderDepartment: input.leaderDepartment,
        leaderUniversity: finalUniversityName,
        leaderUniversityId: finalUniversityId,
        leaderSociety: input.leaderSociety || null,
        referralCode: input.referralCode || null,
        consentTransactionalSms: true,
        consentMarketingSms: true,
        consentTerms: true,
        status: "PENDING",
        members: {
          create: input.members.map((m) => ({
            name: m.name,
            email: m.email.toLowerCase(),
            phone: m.phone,
            sapId: m.sapId,
            cnic: m.cnic,
            department: m.department,
          })),
        },
      },
      select: { id: true, teamName: true },
    });
    return { ok: true, registrationId: registration.id, teamName: registration.teamName };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "This email has already registered.", fieldErrors: { leaderEmail: "Already registered" } };
    }
    console.error("[registration.service] insert failed:", e);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}