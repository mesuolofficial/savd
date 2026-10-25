"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { saveUploadedFile } from "@/lib/upload";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const nameSchema = z.string().trim().min(2).max(120);
const isDuplicate = (e: unknown) => typeof e === "object" && e !== null && (e as { code?: unknown }).code === "P2002";

function go(path: string, msg?: string): never {
  redirect(msg ? `${path}?msg=${msg}` : path);
}

// ---------------------------------------------------------------- universities (FR-19)
const UNI = "/admin/universities";
export async function addUniversityAction(fd: FormData) {
  const admin = await requireAdmin("universities", "full");
  const name = nameSchema.safeParse(str(fd, "name"));
  if (!name.success) go(UNI, "invalid");
  
  let logo = null;
  const logoFile = fd.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) logo = await saveUploadedFile(logoFile, "universities");

  try { await prisma.university.create({ data: { name: name.data, logo } }); } catch (e) { if (isDuplicate(e)) go(UNI, "exists"); throw e; }
  await logAction(admin, `Added university "${name.data}"`);
  revalidatePath(UNI);
  go(UNI, "saved");
}

export async function renameUniversityAction(fd: FormData) {
  const admin = await requireAdmin("universities", "full");
  const id = str(fd, "id");
  const name = nameSchema.safeParse(str(fd, "name"));
  if (!name.success) go(UNI, "invalid");
  
  let logo = undefined;
  const logoFile = fd.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) logo = await saveUploadedFile(logoFile, "universities");

  try {
    await prisma.$transaction([
      prisma.university.update({ where: { id }, data: { name: name.data, ...(logo ? { logo } : {}) } }),
      prisma.team.updateMany({ where: { universityId: id }, data: { universityText: name.data } }),
    ]);
  } catch (e) { if (isDuplicate(e)) go(UNI, "exists"); throw e; }
  await logAction(admin, `Renamed university to "${name.data}"`);
  revalidatePath(UNI);
  go(UNI, "saved");
}

export async function deleteUniversityAction(fd: FormData) {
  const admin = await requireAdmin("universities", "full");
  const id = str(fd, "id");
  const uni = await prisma.university.findUnique({ where: { id }, include: { _count: { select: { teams: true } } } });
  if (!uni) go(UNI);
  if (uni._count.teams > 0) go(UNI, "in-use");
  await prisma.university.delete({ where: { id } });
  await logAction(admin, `Deleted university "${uni.name}"`);
  revalidatePath(UNI);
  go(UNI, "saved");
}

// ---------------------------------------------------------------- sponsors (FR-20)
const SP = "/admin/sponsors";
const TIERS = ["SPONSOR", "ORGANIZER", "PARTNER", "COLLABORATOR"] as const;

function readSponsor(fd: FormData) {
  const name = nameSchema.safeParse(str(fd, "name"));
  const tier = z.enum(TIERS).safeParse(str(fd, "tier"));
  const url = str(fd, "websiteUrl");
  if (!name.success || !tier.success) go(SP, "invalid");
  if (url && !/^https?:\/\//i.test(url)) go(SP, "url");
  return { name: name.data, tier: tier.data, websiteUrl: url || null, sortOrder: parseInt(str(fd, "sortOrder"), 10) || 0 };
}

export async function addSponsorAction(fd: FormData) {
  const admin = await requireAdmin("sponsors", "full");
  const data = readSponsor(fd);
  
  let logo = null;
  const logoFile = fd.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) logo = await saveUploadedFile(logoFile, "sponsors");

  await prisma.sponsor.create({ data: { ...data, logo } });
  await logAction(admin, `Added sponsor "${data.name}" (${data.tier.toLowerCase()})`);
  revalidatePath(SP); revalidatePath("/");
  go(SP, "saved");
}

export async function updateSponsorAction(fd: FormData) {
  const admin = await requireAdmin("sponsors", "full");
  const data = readSponsor(fd);
  const id = str(fd, "id");
  
  let logo = undefined;
  const logoFile = fd.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) logo = await saveUploadedFile(logoFile, "sponsors");

  await prisma.sponsor.update({ where: { id }, data: { ...data, ...(logo ? { logo } : {}) } });
  await logAction(admin, `Edited sponsor "${data.name}"`);
  revalidatePath(SP); revalidatePath("/");
  go(SP, "saved");
}

export async function deleteSponsorAction(fd: FormData) {
  const admin = await requireAdmin("sponsors", "full");
  const s = await prisma.sponsor.delete({ where: { id: str(fd, "id") } });
  await logAction(admin, `Deleted sponsor "${s.name}"`);
  revalidatePath(SP); revalidatePath("/");
  go(SP, "saved");
}

// ---------------------------------------------------------------- site settings (FR-18)
export async function saveSettingsAction(fd: FormData) {
  const admin = await requireAdmin("settings", "full");
  const email = str(fd, "adminEmail");
  if (email && !z.string().email().safeParse(email).success) go("/admin/settings", "email");
  const data = {
    siteTitle: str(fd, "siteTitle") || "SAVD",
    adminEmail: email || null,
    contactPhone: str(fd, "contactPhone") || null,
    contactAddress: str(fd, "contactAddress") || null,
    facebookUrl: str(fd, "facebookUrl") || null,
    instagramUrl: str(fd, "instagramUrl") || null,
    twitterUrl: str(fd, "twitterUrl") || null,
    maintenanceMode: fd.get("maintenanceMode") === "on",
    globalRegistrationOpen: fd.get("globalRegistrationOpen") === "on",
    // NEW TOGGLES
    sponsorOpen: fd.get("sponsorOpen") === "on",
    partnerOpen: fd.get("partnerOpen") === "on",
    ambassadorOpen: fd.get("ambassadorOpen") === "on",
  };
  await prisma.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  await logAction(admin, `Updated site settings (with form toggles)`);
  revalidatePath("/", "layout");
  go("/admin/settings", "saved");
}