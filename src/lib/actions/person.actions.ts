"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { generateSavdId } from "@/lib/services/person.service";
import { saveUploadedFile } from "@/lib/upload";
import { redirect } from "next/navigation";

const personSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  studentId: z.string().trim().max(50).optional().or(z.literal("")),
  cnic: z.string().trim().max(20).optional().or(z.literal("")),
  department: z.string().trim().max(100).optional().or(z.literal("")),
  university: z.string().trim().max(150).optional().or(z.literal("")),
  society: z.string().trim().max(150).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  memberSince: z.coerce.number().int().min(2000).max(2100).default(new Date().getFullYear()),
});

export async function createPersonAction(_prev: any, fd: FormData) {
  const admin = await requireAdmin("people", "full");
  
  const raw = Object.fromEntries([...fd.entries()].filter(([k]) => k !== "photo").map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const parsed = personSchema.safeParse(raw);
  
  if (!parsed.success) {
    return { error: "Please check the fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const v = parsed.data;
  const savdId = await generateSavdId();

  let photo = null;
  const photoFile = fd.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    photo = await saveUploadedFile(photoFile, "people");
  }

  try {
    const person = await prisma.person.create({
      data: {
        savdId,
        name: v.name,
        email: v.email ? v.email.toLowerCase() : null,
        phone: v.phone || null,
        studentId: v.studentId || null,
        cnic: v.cnic || null,
        department: v.department || null,
        university: v.university || null,
        society: v.society || null,
        bio: v.bio || null,
        memberSince: v.memberSince,
        photo,
      },
    });

    await logAction(admin, `Manually added Person "${person.name}" (${person.savdId})`);
    revalidatePath("/admin/people");
    redirect("/admin/people?msg=created");
  } catch (e) {
    console.error(e);
    return { error: "Failed to create person. Email or CNIC might already exist." };
  }
}

export async function updatePersonAction(id: string, _prev: any, fd: FormData) {
  const admin = await requireAdmin("people", "full");
  
  const raw = Object.fromEntries([...fd.entries()].filter(([k]) => k !== "photo").map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const parsed = personSchema.safeParse(raw);
  
  if (!parsed.success) {
    return { error: "Please check the fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const v = parsed.data;

  let photo = undefined;
  const photoFile = fd.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    photo = await saveUploadedFile(photoFile, "people");
  }

  try {
    const person = await prisma.person.update({
      where: { id },
      data: {
        name: v.name,
        email: v.email ? v.email.toLowerCase() : null,
        phone: v.phone || null,
        studentId: v.studentId || null,
        cnic: v.cnic || null,
        department: v.department || null,
        university: v.university || null,
        society: v.society || null,
        bio: v.bio || null,
        memberSince: v.memberSince,
        ...(photo ? { photo } : {}),
      },
    });

    await logAction(admin, `Updated Person "${person.name}" (${person.savdId})`);
    revalidatePath("/admin/people");
    revalidatePath(`/admin/people/${id}`);
    return { ok: true, msg: "Profile updated successfully." };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update person." };
  }
}

// 👇 YEH NAYA FUNCTION ADD KIYA GAYA HAI
export async function mergePeopleAction(primaryId: string, duplicateId: string) {
  const admin = await requireAdmin("people", "full");

  if (primaryId === duplicateId) return { error: "Cannot merge a person into themselves." };

  try {
    await prisma.$transaction(async (tx) => {
      const primary = await tx.person.findUnique({ where: { id: primaryId } });
      const duplicate = await tx.person.findUnique({ where: { id: duplicateId } });
      
      if (!primary || !duplicate) throw new Error("One or both people not found.");

      // 1. Move Team Memberships (Handle unique constraint gracefully)
      const dupMemberships = await tx.teamMember.findMany({ where: { personId: duplicateId } });
      for (const m of dupMemberships) {
        const exists = await tx.teamMember.findFirst({ where: { competitionId: m.competitionId, personId: primaryId } });
        if (exists) {
          // If primary is already in this team, just delete the duplicate row
          await tx.teamMember.delete({ where: { id: m.id } });
        } else {
          await tx.teamMember.update({ where: { id: m.id }, data: { personId: primaryId } });
        }
      }

      // 2. Move other relations
      await tx.archiveRole.updateMany({ where: { personId: duplicateId }, data: { personId: primaryId } });
      await tx.certificate.updateMany({ where: { personId: duplicateId }, data: { personId: primaryId } });
      await tx.review.updateMany({ where: { personId: duplicateId }, data: { personId: primaryId } });

      // 3. Log the merge
      await tx.personMergeLog.create({
        data: {
          primaryId: primary.id,
          primarySavdId: primary.savdId,
          primaryName: primary.name,
          duplicateSavdId: duplicate.savdId,
          duplicateName: duplicate.name,
          adminId: admin.id,
          adminName: admin.name,
          moved: { certificates: true, teamMemberships: true, archiveRoles: true, reviews: true }
        }
      });

      // 4. Delete duplicate
      await tx.person.delete({ where: { id: duplicateId } });
    });

    await logAction(admin, `Merged person ${duplicateId} into ${primaryId}`);
    revalidatePath("/admin/people");
    return { ok: true, msg: "People merged successfully." };
  } catch (e) {
    console.error(e);
    return { error: "Merge failed. Check if there are conflicts in roles." };
  }
}