import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ProgressGrid } from "@/components/admin/ProgressGrid";

export default async function ManageProgressPage({ params }: { params: Promise<{ competitionId: string }> }) {
  await requireAdmin("progress", "full");
  const { competitionId } = await params;

  // Fetch competition, requirements, and APPROVED teams only
  const [competition, requirements, teams] = await Promise.all([
    prisma.competition.findUnique({ where: { id: competitionId } }),
    prisma.progressRequirement.findMany({ where: { competitionId }, orderBy: { sortOrder: "asc" } }),
    prisma.team.findMany({
      where: { 
        competitionId,
        registration: { status: "APPROVED" } 
      },
      // INCLUDE REGISTRATION to get leaderName
      include: {
        registration: { select: { leaderName: true } }
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!competition) notFound();

  // Fetch all statuses for these teams and requirements
  const statuses = await prisma.progressStatus.findMany({
    where: {
      teamId: { in: teams.map(t => t.id) },
      requirementId: { in: requirements.map(r => r.id) },
    },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/admin/progress" className="text-mist hover:text-ink text-sm font-semibold">← Back to Progress</Link>
      </div>
      
      <div className="mb-6 border-b border-line pb-4">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">{competition.title}</h1>
        <p className="text-mist mt-1">Track team deliverables and requirements.</p>
      </div>

      <ProgressGrid 
        competitionId={competition.id}
        competitionTitle={competition.title}
        teams={teams}
        requirements={requirements}
        statuses={statuses}
      />
    </div>
  );
}