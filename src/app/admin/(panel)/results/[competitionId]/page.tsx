import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ResultForm } from "@/components/admin/ResultForm";

export default async function ManageResultsPage({ params }: { params: Promise<{ competitionId: string }> }) {
  await requireAdmin("results", "full");
  const { competitionId } = await params;

  const [competition, results, teams] = await Promise.all([
    prisma.competition.findUnique({ where: { id: competitionId } }),
    prisma.result.findMany({
      where: { competitionId },
      orderBy: { sortOrder: "asc" },
      include: { team: true },
    }),
    prisma.team.findMany({
      where: { competitionId },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!competition) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/results" className="text-mist hover:text-ink text-sm">← Back to Results</Link>
      </div>
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">{competition.title}</h1>
          <p className="text-mist">Manage Winners & Podium</p>
        </div>
      </div>

      <ResultForm competitionId={competitionId} results={results} teams={teams} />
    </div>
  );
}