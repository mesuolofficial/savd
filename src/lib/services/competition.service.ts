import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CompetitionData = {
  title: string; type: "TEAM" | "INDIVIDUAL"; minTeamSize: number; maxTeamSize: number;
  description: string; rules: string; eligibility: string; venue: string; 
  bannerUrl: string | null; rulebookUrl: string | null;
  prizes: Prisma.InputJsonValue;
  allowMultipleTeams: boolean;
  startDate: Date; endDate: Date; registrationDeadline: Date;
};

async function uniqueSlug(base: string, excludeId?: string) {
  const root = base || "competition";
  let slug = root, n = 2;
  while (await prisma.competition.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } })) slug = `${root}-${n++}`;
  return slug;
}

export async function createCompetition(data: CompetitionData, slugBase: string) {
  return prisma.competition.create({ data: { ...data, slug: await uniqueSlug(slugBase), archive: { create: {} } } });
}

export async function updateCompetition(id: string, data: CompetitionData, slugBase?: string) {
  return prisma.competition.update({ where: { id }, data: { ...data, ...(slugBase ? { slug: await uniqueSlug(slugBase, id) } : {}) } });
}

export async function removeCompetition(id: string) {
  await prisma.$transaction([
    prisma.admin.updateMany({ where: { competitionId: id }, data: { isActive: false } }),
    prisma.competition.delete({ where: { id } }),
  ]);
}