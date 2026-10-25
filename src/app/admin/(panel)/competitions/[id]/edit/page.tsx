import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { toKarachiInput } from "@/lib/format";
import { formatPrizes } from "@/lib/validators/competition.schema";
import { updateCompetitionAction } from "@/lib/actions/competition.actions";
import { CompetitionForm } from "@/components/admin/CompetitionForm";

export const metadata: Metadata = { title: "Edit competition" };

export default async function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin("competitions", "full");
  if (admin.competitionId && admin.competitionId !== id) redirect("/admin/dashboard?denied=1");
  
  const c = await prisma.competition.findUnique({ where: { id } });
  if (!c) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">Edit competition</h1>
      <p className="mb-6 mt-1 text-sm text-mist">{c.title}</p>
      <CompetitionForm
        action={updateCompetitionAction.bind(null, c.id)}
        submitLabel="Save changes"
        initial={{
          title: c.title, slug: c.slug, type: c.type, minTeamSize: String(c.minTeamSize), maxTeamSize: String(c.maxTeamSize),
          description: c.description, rules: c.rules, eligibility: c.eligibility, venue: c.venue, prizes: formatPrizes(c.prizes),
          bannerUrl: c.bannerUrl || "", rulebookUrl: c.rulebookUrl || "",
          allowMultipleTeams: c.allowMultipleTeams,
          startDate: toKarachiInput(c.startDate), endDate: toKarachiInput(c.endDate), registrationDeadline: toKarachiInput(c.registrationDeadline),
        }}
      />
    </div>
  );
}