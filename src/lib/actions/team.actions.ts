"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { saveUploadedFile } from "@/lib/upload";
import { slugify } from "@/lib/slug"; // 👈 Slugify import kiya
import { z } from "zod";

const teamSchema = z.object({
  name: z.string().trim().min(2, "Team name is required").max(120),
  universityId: z.string().trim().optional().or(z.literal("")),
  prototypeDescription: z.string().max(5000).optional().or(z.literal("")),
});

export async function updateTeamAction(id: string, fd: FormData) {
  const admin = await requireAdmin("teams", "full");
  
  const raw = Object.fromEntries([...fd.entries()].filter(([k]) => !["logo", "reportFile", "posterFile", "mediaFiles"].includes(k)).map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  
  const parsed = teamSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid fields." };
  }
  
  const v = parsed.data;

  // Fetch current team to generate slug if name changed
  const currentTeam = await prisma.team.findUnique({
    where: { id },
    include: { competition: true }
  });
  if (!currentTeam) return { error: "Team not found." };

  let newSlug = currentTeam.slug;

  // 👈 AGAR TEAM KA NAAM BADLA HAI TOH NAYA SLUG GENERATE KARO
  if (v.name !== currentTeam.name) {
    const compPrefix = currentTeam.competition.title.substring(0, 20);
    const baseSlug = slugify(`${compPrefix}-${v.name}`);
    
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    while (await prisma.team.findUnique({ where: { slug: uniqueSlug, NOT: { id } } })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }
    newSlug = uniqueSlug;
  }
  
  // Handle University Text Sync
  let uniText = null;
  if (v.universityId) {
    const uni = await prisma.university.findUnique({ where: { id: v.universityId } });
    if (uni) uniText = uni.name;
  }

  // Handle Uploads
  let logo = undefined;
  const logoFile = fd.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) {
    logo = await saveUploadedFile(logoFile, "teams/logos");
  }

  let reportFile = undefined;
  const reportUpload = fd.get("reportFile") as File | null;
  if (reportUpload && reportUpload.size > 0) {
    reportFile = await saveUploadedFile(reportUpload, "teams/reports", ["application/pdf"]);
  }

  let posterFile = undefined;
  const posterUpload = fd.get("posterFile") as File | null;
  if (posterUpload && posterUpload.size > 0) {
    posterFile = await saveUploadedFile(posterUpload, "teams/posters", ["application/pdf", "image/jpeg", "image/png"]);
  }

  try {
    await prisma.team.update({
      where: { id },
      data: {
        name: v.name,
        slug: newSlug, // 👈 Updated slug save kiya
        universityId: v.universityId || null,
        universityText: uniText,
        prototypeDescription: v.prototypeDescription || null,
        ...(logo ? { logo } : {}),
        ...(reportFile ? { reportFile } : {}),
        ...(posterFile ? { posterFile } : {}),
      },
    });

    await logAction(admin, `Updated team details for "${v.name}"`);
    revalidatePath("/admin/teams");
    revalidatePath(`/admin/teams/${id}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Database update failed." };
  }
}

export async function addTeamMediaAction(id: string, fd: FormData) {
  const admin = await requireAdmin("teams", "full");
  const type = fd.get("type") as "PHOTO" | "VIDEO";
  const files = fd.getAll("mediaFiles") as File[];

  if (!files || files.length === 0) return { error: "No files selected." };

  try {
    for (const file of files) {
      if (file.size === 0) continue;
      const filePath = await saveUploadedFile(file, "teams/media", type === "PHOTO" ? ["image/jpeg", "image/png", "image/webp"] : ["video/mp4", "video/webm"]);
      await prisma.teamMedia.create({
        data: { teamId: id, type, file: filePath }
      });
    }
    await logAction(admin, `Uploaded ${files.length} media files for team ID ${id}`);
    revalidatePath(`/admin/teams/${id}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to upload media." };
  }
}

export async function deleteTeamMediaAction(mediaId: string, teamId: string) {
  const admin = await requireAdmin("teams", "full");
  await prisma.teamMedia.delete({ where: { id: mediaId } });
  await logAction(admin, `Deleted a media file from team ID ${teamId}`);
  revalidatePath(`/admin/teams/${teamId}`);
}