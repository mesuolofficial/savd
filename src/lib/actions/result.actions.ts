"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { sendEmail } from "@/lib/mail/brevo";
import { renderResultCongratulations } from "@/lib/mail/templates";

export async function saveResultAction(prevState: any, fd: FormData) {
  const admin = await requireAdmin("results", "full");
  
  const competitionId = String(fd.get("competitionId") || "");
  const id = String(fd.get("id") || ""); // If editing existing
  const label = String(fd.get("label") || "").trim();
  const medal = String(fd.get("medal") || "NONE") as any;
  const teamId = String(fd.get("teamId") || "") || null;
  const awardNote = String(fd.get("awardNote") || "").trim() || null;
  const sendEmailNotif = fd.get("sendEmail") === "on";

  if (!competitionId || !label) return { error: "Label and Competition are required." };

  try {
    let result;
    if (id) {
      result = await prisma.result.update({
        where: { id },
        data: { label, medal, teamId, awardNote },
      });
      await logAction(admin, `Updated result position "${label}"`);
    } else {
      result = await prisma.result.create({
        data: { competitionId, label, medal, teamId, awardNote },
      });
      await logAction(admin, `Added result position "${label}"`);
    }

    // Send Emails to Team if assigned
    if (teamId && sendEmailNotif) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { 
          members: { include: { person: true } }, 
          competition: true 
        },
      });

      if (team) {
        const siteUrl = process.env.SITE_URL || "http://localhost:3000";
        const recipients = team.members.map(m => m.person).filter(p => p.email);
        
        for (const p of recipients) {
          const html = renderResultCongratulations({
            teamName: team.name,
            competitionTitle: team.competition.title,
            position: label,
            medal,
            siteUrl,
            competitionSlug: team.competition.slug,
          });
          await sendEmail({
            to: [{ email: p.email!, name: p.name }],
            subject: `🏆 Congratulations! Your team placed in ${team.competition.title}`,
            html,
          });
        }
        await logAction(admin, `Sent congratulation emails to ${recipients.length} members of team "${team.name}"`);
      }
    }

    revalidatePath("/admin/results");
    revalidatePath(`/admin/results/${competitionId}`);
    revalidatePath(`/competitions/${competitionId}/results`);
    return { ok: true, msg: "Result saved successfully." };
  } catch (e) {
    console.error(e);
    return { error: "Failed to save result." };
  }
}

export async function deleteResultAction(id: string, competitionId: string) {
  const admin = await requireAdmin("results", "full");
  try {
    await prisma.result.delete({ where: { id } });
    await logAction(admin, `Deleted result position ID ${id}`);
    revalidatePath(`/admin/results/${competitionId}`);
    return { ok: true };
  } catch (e) {
    return { error: "Failed to delete result." };
  }
}