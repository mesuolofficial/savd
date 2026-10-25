import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ArchiveForm } from "@/components/admin/ArchiveForm";

export default async function ManageArchivePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("archives", "full");
  const { id } = await params;

  const [competition, people] = await Promise.all([
    prisma.competition.findUnique({
      where: { id },
      include: {
        archive: { include: { roles: { include: { person: true } } } },
      },
    }),
    prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, savdId: true } }),
  ]);

  if (!competition || !competition.archive) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/archives" className="text-mist hover:text-ink text-sm">← Back to Archives</Link>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">{competition.title}</h1>
          <p className="text-mist">Archive Management</p>
        </div>
      </div>

      <ArchiveForm competitionId={competition.id} archive={competition.archive} people={people} />
    </div>
  );
}