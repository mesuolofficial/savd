import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export default async function ProgressListPage() {
  await requireAdmin("progress", "view");

  const competitions = await prisma.competition.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { teams: true, requirements: true } } }
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Progress Tracking</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map(c => (
          <Link key={c.id} href={`/admin/progress/${c.id}`} className="card p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-ink mb-1">{c.title}</h2>
            <p className="text-sm text-mist mb-4">{formatDate(c.startDate)}</p>
            <div className="flex justify-between items-center border-t border-line pt-4 mt-auto text-sm font-semibold">
              <span className="text-signal">{c._count.teams} Teams</span>
              <span className="text-mist">{c._count.requirements} Requirements</span>
            </div>
          </Link>
        ))}
        {competitions.length === 0 && <p className="text-mist col-span-3">No competitions found.</p>}
      </div>
    </div>
  );
}