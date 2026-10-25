"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { encrypt, generateTempPassword } from "@/lib/crypto";
import { destroyAllSessionsFor } from "@/lib/session";
import { saveUploadedFile } from "@/lib/upload"; // <--- ADDED

const adminSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150).toLowerCase(),
  role: z.enum(["SUPER_ADMIN", "EVENT_MANAGER", "CERTIFICATE_MANAGER", "REGISTRATION_REVIEWER", "CONTENT_MANAGER"]),
  competitionId: z.string().trim().optional().or(z.literal("")),
  readOnly: z.preprocess((v) => v === "on" || v === true, z.boolean()).default(false),
  isActive: z.preprocess((v) => v === "on" || v === true, z.boolean()).default(true),
});

export async function createAdminAction(_prev: any, fd: FormData) {
  const admin = await requireAdmin("admins", "full");
  
  const raw = Object.fromEntries([...fd.entries()].filter(([k]) => k !== "avatar").map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const parsed = adminSchema.safeParse(raw);
  
  if (!parsed.success) return { error: "Invalid fields." };
  const v = parsed.data;

  const existing = await prisma.admin.findUnique({ where: { email: v.email } });
  if (existing) return { error: "An admin with this email already exists." };

  // Avatar Upload
  let avatar = null;
  const avatarFile = fd.get("avatar") as File | null;
  if (avatarFile && avatarFile.size > 0) {
    avatar = await saveUploadedFile(avatarFile, "admins");
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  const tempPasswordEnc = encrypt(tempPassword);

  try {
    await prisma.admin.create({
      data: {
        name: v.name,
        email: v.email,
        passwordHash,
        role: v.role,
        avatar, // <--- ADDED
        competitionId: v.competitionId || null,
        readOnly: v.readOnly,
        isActive: v.isActive,
        mustChangePassword: true,
        tempPasswordEnc,
      },
    });

    await logAction(admin, `Created new admin account for ${v.email} (${v.role})`);
    revalidatePath("/admin/admins");
    
    return { ok: true, tempPassword };
  } catch (e) {
    console.error(e);
    return { error: "Database error." };
  }
}

export async function updateAdminAction(id: string, _prev: any, fd: FormData) {
  const admin = await requireAdmin("admins", "full");
  
  const raw = Object.fromEntries([...fd.entries()].filter(([k]) => k !== "avatar").map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const parsed = adminSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid fields." };
  const v = parsed.data;

  // Avatar Upload
  let avatar = undefined;
  const avatarFile = fd.get("avatar") as File | null;
  if (avatarFile && avatarFile.size > 0) {
    avatar = await saveUploadedFile(avatarFile, "admins");
  }

  try {
    await prisma.admin.update({
      where: { id },
      data: {
        name: v.name,
        email: v.email,
        role: v.role,
        ...(avatar ? { avatar } : {}), // <--- ADDED
        competitionId: v.competitionId || null,
        readOnly: v.readOnly,
        isActive: v.isActive,
      },
    });

    if (!v.isActive) {
      await destroyAllSessionsFor(id);
    }

    await logAction(admin, `Updated admin account for ${v.email}`);
    revalidatePath("/admin/admins");
    return { ok: true, msg: "Admin updated." };
  } catch (e) {
    return { error: "Failed to update admin." };
  }
}

export async function unlockAdminAction(id: string) {
  const admin = await requireAdmin("admins", "full");
  const target = await prisma.admin.update({
    where: { id },
    data: { failedAttempts: 0, lockedUntil: null },
  });
  await logAction(admin, `Unlocked admin account: ${target.email}`);
  revalidatePath("/admin/admins");
}

export async function deleteAdminAction(id: string) {
  const admin = await requireAdmin("admins", "full");
  if (admin.id === id) return { error: "You cannot delete your own account." };
  
  const target = await prisma.admin.delete({ where: { id } });
  await logAction(admin, `Deleted admin account: ${target.email}`);
  revalidatePath("/admin/admins");
  redirect("/admin/admins");
}