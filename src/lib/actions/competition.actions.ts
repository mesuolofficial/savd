"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { slugify } from "@/lib/slug";
import { parseKarachi } from "@/lib/format";
import { competitionSchema, parsePrizes } from "@/lib/validators/competition.schema";
import { createCompetition, updateCompetition, removeCompetition, type CompetitionData } from "@/lib/services/competition.service";
import { saveUploadedFile } from "@/lib/upload";
import { sanitizeHtml } from "@/lib/sanitize"; // <--- IMPORTED
import type { CompetitionFormState } from "@/types";

const DENIED = "/admin/dashboard?denied=1";

async function readForm(fd: FormData): Promise<{ ok: false; fieldErrors: Record<string, string> } | { ok: true; data: CompetitionData; slugInput: string; titleSlug: string }> {
  const raw = Object.fromEntries([...fd.entries()].filter(([k]) => !["bannerFile", "existingBannerUrl", "rulebookFile", "existingRulebookUrl"].includes(k)).map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  
  const parsed = competitionSchema.safeParse(raw);
  const fieldErrors: Record<string, string> = {};
  if (!parsed.success) {
    for (const i of parsed.error.issues) { const k = String(i.path[0] ?? "form"); if (!fieldErrors[k]) fieldErrors[k] = i.message; }
    return { ok: false, fieldErrors };
  }
  const v = parsed.data;
  const startDate = parseKarachi(v.startDate), endDate = parseKarachi(v.endDate), deadline = parseKarachi(v.registrationDeadline);
  
  if (!startDate) fieldErrors.startDate = "Invalid start date";
  if (!endDate) fieldErrors.endDate = "Invalid end date";
  if (!deadline) fieldErrors.registrationDeadline = "Invalid deadline";
  
  if (Object.keys(fieldErrors).length || !startDate || !endDate || !deadline) return { ok: false, fieldErrors };

  let bannerUrl = String(fd.get("existingBannerUrl") || "") || null;
  const bannerFile = fd.get("bannerFile") as File | null;
  if (bannerFile && bannerFile.size > 0) {
    try { bannerUrl = await saveUploadedFile(bannerFile, "competitions"); }
    catch (e) { return { ok: false, fieldErrors: { bannerFile: (e as Error).message } }; }
  }

  let rulebookUrl = String(fd.get("existingRulebookUrl") || "") || null;
  const rulebookFile = fd.get("rulebookFile") as File | null;
  if (rulebookFile && rulebookFile.size > 0) {
    try { rulebookUrl = await saveUploadedFile(rulebookFile, "rulebooks", ["application/pdf"]); }
    catch (e) { return { ok: false, fieldErrors: { rulebookFile: (e as Error).message } }; }
  }

  const individual = v.type === "INDIVIDUAL";
  return {
    ok: true,
    slugInput: slugify(v.slug),
    titleSlug: slugify(v.title),
    data: {
      title: v.title, type: v.type, minTeamSize: individual ? 1 : v.minTeamSize, maxTeamSize: individual ? 1 : v.maxTeamSize,
      description: sanitizeHtml(v.description), // <--- APPLIED
      rules: sanitizeHtml(v.rules), // <--- APPLIED
      eligibility: sanitizeHtml(v.eligibility), // <--- APPLIED
      venue: v.venue,
      bannerUrl, rulebookUrl,
      allowMultipleTeams: v.allowMultipleTeams,
      prizes: parsePrizes(v.prizes), startDate, endDate, registrationDeadline: deadline,
    },
  };
}

function refresh(slug?: string) {
  revalidatePath("/"); revalidatePath("/competitions"); revalidatePath("/admin/competitions");
  if (slug) revalidatePath(`/competitions/${slug}`);
}

export async function createCompetitionAction(_prev: CompetitionFormState, fd: FormData): Promise<CompetitionFormState> {
  const admin = await requireAdmin("competitions", "full");
  const r = await readForm(fd);
  if (!r.ok) return { error: "Please fix the errors.", fieldErrors: r.fieldErrors };
  const c = await createCompetition(r.data, r.slugInput || r.titleSlug);
  await logAction(admin, `Created competition "${c.title}"`);
  refresh(c.slug);
  redirect("/admin/competitions");
}

export async function updateCompetitionAction(id: string, _prev: CompetitionFormState, fd: FormData): Promise<CompetitionFormState> {
  const admin = await requireAdmin("competitions", "full");
  const r = await readForm(fd);
  if (!r.ok) return { error: "Please fix the errors.", fieldErrors: r.fieldErrors };
  const c = await updateCompetition(id, r.data, r.slugInput || undefined);
  await logAction(admin, `Edited competition "${c.title}"`);
  refresh(c.slug);
  redirect("/admin/competitions");
}

async function toggle(fd: FormData, field: "isPublished" | "registrationOpen", label: string) {
  const admin = await requireAdmin("competitions", "full");
  const id = String(fd.get("id") ?? "");
  const on = fd.get("to") === "1";
  const c = await prisma.competition.update({ where: { id }, data: field === "isPublished" ? { isPublished: on } : { registrationOpen: on } });
  await logAction(admin, `${on ? "On" : "Off"} ${label} for "${c.title}"`);
  refresh(c.slug);
}

export async function setPublishedAction(fd: FormData) { await toggle(fd, "isPublished", "publishing"); }
export async function setRegistrationOpenAction(fd: FormData) { await toggle(fd, "registrationOpen", "registration"); }

export async function deleteCompetitionAction(fd: FormData) {
  const admin = await requireAdmin("competitions", "full");
  const c = await prisma.competition.findUnique({ where: { id: String(fd.get("id") ?? "") } });
  if (!c) redirect("/admin/competitions");
  if (String(fd.get("confirm") ?? "").trim() !== c.slug) redirect("/admin/competitions?error=confirm");
  await removeCompetition(c.id);
  await logAction(admin, `Deleted competition "${c.title}"`);
  redirect("/admin/competitions");
}