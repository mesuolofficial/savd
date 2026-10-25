"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";

// --- ADD REQUIREMENT ---
export async function addRequirementAction(prevState: any, fd: FormData) {
  const admin = await requireAdmin("progress", "full");
  const competitionId = String(fd.get("competitionId"));
  const name = String(fd.get("name") || "").trim();

  if (!name) return { error: "Requirement name is required." };

  try {
    await prisma.progressRequirement.create({
      data: { competitionId, name },
    });
    await logAction(admin, `Added progress requirement "${name}"`);
    revalidatePath(`/admin/progress/${competitionId}`);
    return { ok: true, msg: "Requirement added." };
  } catch (e) {
    return { error: "Requirement already exists or failed to add." };
  }
}

// --- DELETE REQUIREMENT ---
export async function deleteRequirementAction(id: string, competitionId: string) {
  const admin = await requireAdmin("progress", "full");
  try {
    await prisma.progressRequirement.delete({ where: { id } });
    await logAction(admin, `Deleted progress requirement`);
    revalidatePath(`/admin/progress/${competitionId}`);
  } catch (e) {
    console.error(e);
  }
}

// --- TOGGLE PROGRESS ---
export async function toggleProgressAction(teamId: string, requirementId: string, currentDone: boolean, competitionId: string) {
  const admin = await requireAdmin("progress", "full");
  
  try {
    await prisma.progressStatus.upsert({
      where: {
        teamId_requirementId: { teamId, requirementId },
      },
      update: { done: !currentDone },
      create: { teamId, requirementId, done: !currentDone },
    });
    revalidatePath(`/admin/progress/${competitionId}`);
  } catch (e) {
    console.error(e);
  }
}