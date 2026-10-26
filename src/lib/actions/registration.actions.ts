"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { formatDateTime } from "@/lib/format";
import { sendEmail, adminAlertEmails, getMailContact } from "@/lib/mail/brevo";
import {
  renderRegistrationReceived,
  renderAdminNewRegistration,
  renderRegistrationStatus,
  siteUrl,
  type RosterMember,
} from "@/lib/mail/templates";
import { registrationSchema } from "@/lib/validators/registration.schema";
import { submitRegistration } from "@/lib/services/registration.service";
import { createPersonFromRegistration } from "@/lib/services/person.service";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { slugify } from "@/lib/slug";

export type RegistrationActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  teamName?: string;
  redirectTo?: string;
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

type RegistrationWithPeople = {
  leaderName: string;
  leaderEmail: string;
  leaderWhatsapp: string;
  leaderSapId: string;
  leaderDepartment: string;
  members: { name: string; email: string; phone: string; sapId: string; department: string }[];
};

/** Leader first, then members. Carries email/phone; the templates decide who may see them. */
function buildRoster(r: RegistrationWithPeople): RosterMember[] {
  return [
    { name: r.leaderName, role: "Leader", department: r.leaderDepartment, studentId: r.leaderSapId, email: r.leaderEmail, phone: r.leaderWhatsapp },
    ...r.members.map((m) => ({ name: m.name, role: "Member" as const, department: m.department, studentId: m.sapId, email: m.email, phone: m.phone })),
  ];
}

/** One mail per distinct email address, each addressed to that person by name. */
function distinctRecipients(roster: RosterMember[]) {
  const seen = new Set<string>();
  return roster.filter((m) => {
    const k = (m.email || "").trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export async function submitRegistrationAction(
  competitionSlug: string,
  _prev: RegistrationActionState,
  fd: FormData,
): Promise<RegistrationActionState> {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

    if (!rateLimit(`register:${ip}`, 5, 10 * 60 * 1000).ok) {
      return { error: "Too many registration attempts from your network. Please wait a few minutes and try again." };
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

    // Emails go out in the background so the user never waits on Brevo.
    after(async () => {
      try {
        await sendAllEmails(result.registrationId, ip);
      } catch (e) {
        console.error("[registration.actions] email dispatch crashed:", e);
      }
    });

    return {
      success: true,
      teamName: result.teamName,
      redirectTo: `/registration-success?team=${encodeURIComponent(result.teamName)}&comp=${encodeURIComponent(competitionSlug)}`,
    };
  } catch (e) {
    console.error("[registration.actions] submit crashed:", e);
    return { error: "Something went wrong on our side. Please try again in a moment." };
  }
}

async function sendAllEmails(registrationId: string, submittedIp: string) {
  // Save the IP first so it is kept even if mail dispatch fails.
  await prisma.registration.update({ where: { id: registrationId }, data: { submittedIp } }).catch(() => {});

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { competition: true, members: true },
  });
  if (!registration) return;

  const site = siteUrl();
  const contact = await getMailContact();
  const competition = registration.competition;
  const roster = buildRoster(registration);

  // 1. Every team member gets their own mail, addressed by name.
  const sends: Promise<unknown>[] = distinctRecipients(roster).map((person) =>
    sendEmail({
      to: [{ email: person.email!, name: person.name }],
      subject: `Registration received — ${registration.teamName}`,
      html: renderRegistrationReceived({
        isLeader: person.role === "Leader",
        recipientName: person.name,
        teamName: registration.teamName,
        competitionTitle: competition.title,
        competitionSlug: competition.slug,
        siteUrl: site,
        leaderName: registration.leaderName,
        members: roster,
        contact,
      }),
      tags: ["registration-received"],
    }),
  );

  // 2. Admins get one alert with the full roster.
  const admins = adminAlertEmails();
  if (admins.length) {
    sends.push(
      sendEmail({
        to: admins.map((email) => ({ email })),
        subject: `New registration: ${registration.teamName} — ${competition.title}`,
        html: renderAdminNewRegistration({
          teamName: registration.teamName,
          competitionTitle: competition.title,
          leaderName: registration.leaderName,
          leaderEmail: registration.leaderEmail,
          leaderWhatsapp: registration.leaderWhatsapp,
          leaderUniversity: registration.leaderUniversity,
          teamSize: roster.length,
          submittedAt: formatDateTime(registration.createdAt),
          adminUrl: `${site}/admin/registrations/${registration.id}`,
          members: roster,
        }),
        replyTo: { email: registration.leaderEmail, name: registration.leaderName },
        tags: ["admin-new-registration"],
      }),
    );
  }

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

  const site = siteUrl();
  const contact = await getMailContact();
  const roster = buildRoster(registration);

  // Every member gets their own mail, addressed by name, with the team roster.
  const sends = distinctRecipients(roster).map((person) =>
    sendEmail({
      to: [{ email: person.email!, name: person.name }],
      subject:
        status === "APPROVED" ? `Approved: ${registration.teamName} is in ${registration.competition.title}`
        : status === "WITHDRAWN" ? `Team withdrawn: ${registration.teamName}`
        : `Update on registration: ${registration.teamName}`,
      html: renderRegistrationStatus({
        teamName: registration.teamName,
        competitionTitle: registration.competition.title,
        status,
        recipientName: person.name,
        leaderName: registration.leaderName,
        siteUrl: site,
        competitionSlug: registration.competition.slug,
        members: roster,
        contact,
      }),
      tags: [`registration-${status.toLowerCase()}`],
    }),
  );

  await Promise.allSettled(sends);
  revalidatePath("/admin/registrations");
  revalidatePath(`/admin/registrations/${regId}`);
  return { ok: true };
}

export async function convertToTeamAction(registrationId: string) {
  const admin = await requireAdmin("registrations", "full");

  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { competition: true, members: true, team: true },
  });

  if (!reg) return { error: "Registration not found." };
  if (reg.status !== "APPROVED") return { error: "Registration must be approved first." };
  if (reg.team) return { error: "Team already created for this registration." };

  try {
    // Unique team slug
    const baseSlug = slugify(`${reg.competition.title.substring(0, 15)}-${reg.teamName}`);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.team.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const team = await prisma.team.create({
      data: {
        slug: uniqueSlug,
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

/** Admin-only hard delete. No emails are sent. Members are removed by the DB cascade. */
export async function deleteRegistrationAction(regId: string): Promise<{ ok?: true; error?: string }> {
  const admin = await requireAdmin("registrations", "full");

  try {
    const reg = await prisma.registration.findUnique({
      where: { id: regId },
      include: { competition: { select: { title: true } }, team: { select: { id: true } } },
    });
    if (!reg) return { error: "Registration not found. It may already be deleted." };
    if (reg.team) {
      return { error: "A team profile was created from this registration. Delete that team first, then delete the registration." };
    }

    await prisma.registration.delete({ where: { id: regId } });
    await logAction(admin, `Deleted registration "${reg.teamName}" (${reg.competition.title})`);

    revalidatePath("/admin/registrations");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch (e) {
    console.error("[registration.actions] delete failed:", e);
    return { error: "Could not delete the registration. Please try again." };
  }
}