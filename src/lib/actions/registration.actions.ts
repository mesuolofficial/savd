"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { formatDateTime } from "@/lib/format";
import { sendEmail, adminAlertEmails } from "@/lib/mail/brevo";
import { renderRegistrationReceived, renderAdminNewRegistration, renderRegistrationStatus } from "@/lib/mail/templates";
import { registrationSchema } from "@/lib/validators/registration.schema";
import { submitRegistration } from "@/lib/services/registration.service";
import { createPersonFromRegistration } from "@/lib/services/person.service";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { slugify } from "@/lib/slug"; // 👈 YEH IMPORT ADD KAREIN

export type RegistrationActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function flattenMembers(fd: FormData) {
  const rows = new Map<number, Record<string, string>>();
  for (const [key, value] of fd.entries()) {
    if (typeof value !== "string") continue;
    const m = key.match(/^member\.(\d+)\.(\w+)$/);
    if (!m) continue;
    const [, idxStr, field] = m;
    const idx = parseInt(idxStr, 10);
    if (!rows.has(idx)) rows.set(idx, {});
    rows.get(idx)![field] = value;
  }
  return [...rows.entries()].sort(([a], [b]) => a - b).map(([, r]) => r);
}

export async function submitRegistrationAction(
  competitionSlug: string,
  _prev: RegistrationActionState,
  fd: FormData,
): Promise<RegistrationActionState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  if (!rateLimit(`register:${ip}`, 5, 10 * 60 * 1000).ok) {
    return { error: "Too many registration attempts. Please try again later." };
  }

  const raw = {
    teamName: fd.get("teamName"),
    leaderName: fd.get("leaderName"),
    leaderEmail: fd.get("leaderEmail"),
    leaderWhatsapp: fd.get("leaderWhatsapp"),
    leaderSapId: fd.get("leaderSapId"),
    leaderCnic: fd.get("leaderCnic"),
    leaderDepartment: fd.get("leaderDepartment"),
    leaderUniversityId: fd.get("leaderUniversityId"),
    leaderUniversityText: fd.get("leaderUniversityText"),
    leaderSociety: fd.get("leaderSociety") || "",
    referralCode: fd.get("referralCode") || "",
    members: flattenMembers(fd),
    consentTransactionalSms: fd.get("consentTransactionalSms"),
    consentMarketingSms: fd.get("consentMarketingSms"),
    consentTerms: fd.get("consentTerms"),
  };

  const parsed = registrationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const result = await submitRegistration(competitionSlug, parsed.data);
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors };

  try {
    await sendAllEmails(competitionSlug, result.registrationId, ip);
  } catch (e) {
    console.error("[registration.actions] email dispatch crashed:", e);
  }

  redirect(`/registration-success?team=${encodeURIComponent(result.teamName)}&comp=${encodeURIComponent(competitionSlug)}`);
}

async function sendAllEmails(competitionSlug: string, registrationId: string, submittedIp: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { competition: true, members: true },
  });
  if (!registration) return;

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const competition = registration.competition;

  const participants = [
    { email: registration.leaderEmail, name: registration.leaderName, isLeader: true },
    ...registration.members.map((m) => ({ email: m.email, name: m.name, isLeader: false })),
  ].filter((p) => p.email);

  const sends: Promise<unknown>[] = participants.map((p) => {
    const html = renderRegistrationReceived({
      isLeader: p.isLeader,
      recipientName: p.name,
      teamName: registration.teamName,
      competitionTitle: competition.title,
      competitionSlug: competition.slug,
      siteUrl,
      leaderName: registration.leaderName,
    });
    return sendEmail({
      to: [{ email: p.email, name: p.name }],
      subject: `Registration received — ${registration.teamName}`,
      html,
    });
  });

  const admins = adminAlertEmails();
  if (admins.length) {
    const html = renderAdminNewRegistration({
      teamName: registration.teamName,
      competitionTitle: competition.title,
      leaderName: registration.leaderName,
      leaderEmail: registration.leaderEmail,
      leaderWhatsapp: registration.leaderWhatsapp,
      leaderUniversity: registration.leaderUniversity,
      teamSize: 1 + registration.members.length,
      submittedAt: formatDateTime(registration.createdAt),
      adminUrl: `${siteUrl}/admin/registrations`,
    });
    sends.push(sendEmail({ to: admins.map((email) => ({ email })), subject: `New registration: ${registration.teamName}`, html }));
  }

  await prisma.registration.update({ where: { id: registrationId }, data: { submittedIp } }).catch(() => {});
  await Promise.allSettled(sends);
}

export async function updateRegistrationStatusAction(regId: string, status: "APPROVED" | "REJECTED" | "WITHDRAWN") {
  const admin = await requireAdmin("registrations", "full");
  
  const registration = await prisma.registration.findUnique({
    where: { id: regId },
    include: { competition: true, members: true },
  });
  
  if (!registration) return { error: "Registration not found." };

  await prisma.registration.update({ where: { id: regId }, data: { status } });
  await logAction(admin, `Marked registration for "${registration.teamName}" as ${status}`);

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const recipients = [
    { email: registration.leaderEmail, name: registration.leaderName },
    ...registration.members.map(m => ({ email: m.email, name: m.name }))
  ].filter(r => r.email);

  const sends = recipients.map(r => {
    const html = renderRegistrationStatus({
      teamName: registration.teamName,
      competitionTitle: registration.competition.title,
      status,
      leaderName: registration.leaderName,
      siteUrl,
      competitionSlug: registration.competition.slug,
    });
    return sendEmail({ to: [{ email: r.email, name: r.name }], subject: `Update on registration: ${registration.teamName}`, html });
  });

  await Promise.allSettled(sends);
  revalidatePath("/admin/registrations");
  revalidatePath(`/admin/registrations/${regId}`);
}

export async function convertToTeamAction(registrationId: string) {
  const admin = await requireAdmin("registrations", "full");
  
  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { competition: true, members: true, team: true }, // 👈 YAHAN team: true ADD KAREIN
  });
  
  if (!reg) return { error: "Registration not found." };
  if (reg.status !== "APPROVED") return { error: "Registration must be approved first." };
  if (reg.team) return { error: "Team already created for this registration." };

  try {
    // 👈 SLUG GENERATE KARNE KA LOGIC
    const baseSlug = slugify(`${reg.competition.title.substring(0, 15)}-${reg.teamName}`);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.team.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const team = await prisma.team.create({
      data: {
        slug: uniqueSlug, // 👈 YEH LINE ADD KAREIN
        competitionId: reg.competitionId,
        registrationId: reg.id,
        name: reg.teamName,
        universityId: reg.leaderUniversityId,
        universityText: reg.leaderUniversity,
      },
    });

    // Leader
    const leaderPerson = await createPersonFromRegistration({
      name: reg.leaderName,
      email: reg.leaderEmail,
      phone: reg.leaderWhatsapp,
      sapId: reg.leaderSapId,
      cnic: reg.leaderCnic || "",
      department: reg.leaderDepartment,
      university: reg.leaderUniversity,
      society: reg.leaderSociety,
    });

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        competitionId: reg.competitionId,
        personId: leaderPerson.id,
        role: "LEADER",
      },
    });

    // Members
    for (const m of reg.members) {
      const memberPerson = await createPersonFromRegistration({
        name: m.name,
        email: m.email,
        phone: m.phone,
        sapId: m.sapId,
        cnic: m.cnic || "",
        department: m.department,
        university: reg.leaderUniversity, 
      });

      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          competitionId: reg.competitionId,
          personId: memberPerson.id,
          role: "MEMBER",
        },
      });
    }

    await logAction(admin, `Created Team "${team.name}" and generated SAVD IDs for all members`);
    revalidatePath("/admin/registrations");
    revalidatePath(`/admin/registrations/${registrationId}`);
    revalidatePath("/admin/teams");
    revalidatePath("/admin/people");

    return { ok: true };
  } catch (e) {
    console.error("Team creation failed:", e);
    return { error: "Failed to create team. Check logs." };
  }
}