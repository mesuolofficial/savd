"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";

export async function toggleArchivePublishAction(competitionId: string, isPublished: boolean) {
  const admin = await requireAdmin("archives", "full");
  
  try {
    await prisma.archive.update({
      where: { competitionId },
      data: { isPublished },
    });
    
    const comp = await prisma.competition.findUnique({ where: { id: competitionId }, select: { title: true, slug: true } });
    await logAction(admin, `${isPublished ? "Published" : "Unpublished"} archive for "${comp?.title}"`);
    
    revalidatePath("/admin/archives");
    revalidatePath(`/admin/archives/${competitionId}`);
    revalidatePath("/archives");
    if (comp) revalidatePath(`/archives/${comp.slug}`);
    
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update archive status." };
  }
}

export async function addArchiveRoleAction(competitionId: string, fd: FormData) {
  const admin = await requireAdmin("archives", "full");
  const personId = String(fd.get("personId") || "");
  const role = String(fd.get("role") || "") as any;
  const isPrimary = fd.get("isPrimary") === "on";

  if (!personId || !role) return { error: "Person and role are required." };

  try {
    const archive = await prisma.archive.findUnique({ where: { competitionId } });
    if (!archive) return { error: "Archive not found." };

    await prisma.archiveRole.create({
      data: { archiveId: archive.id, personId, role, isPrimary },
    });

    const person = await prisma.person.findUnique({ where: { id: personId } });
    await logAction(admin, `Added ${role} role to ${person?.name}`);
    
    revalidatePath(`/admin/archives/${competitionId}`);
    revalidatePath("/archives");
    return { ok: true };
  } catch (e) {
    return { error: "Failed to add role. Person might already have this role." };
  }
}

export async function removeArchiveRoleAction(roleId: string, competitionId: string) {
  const admin = await requireAdmin("archives", "full");
  try {
    await prisma.archiveRole.delete({ where: { id: roleId } });
    await logAction(admin, `Removed archive role ID ${roleId}`);
    revalidatePath(`/admin/archives/${competitionId}`);
    return { ok: true };
  } catch (e) {
    return { error: "Failed to remove role." };
  }
}