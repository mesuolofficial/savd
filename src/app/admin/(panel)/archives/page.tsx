import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export default async function ArchivesPage() {
  await requireAdmin("archives", "view");

  const competitions = await prisma.competition.findMany({
    orderBy: { startDate: "desc" },
    include: { archive: true, _count: { select: { teams: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Archives</h1>
      
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas border-b border-line">
            <tr>
              <th className="p-4">Competition</th>
              <th className="p-4">Date</th>
              <th className="p-4">Teams</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((c) => (
              <tr key={c.id} className="border-b border-line/50 hover:bg-canvas/30">
                <td className="p-4 font-bold text-ink">{c.title}</td>
                <td className="p-4 text-mist">{formatDate(c.startDate)}</td>
                <td className="p-4">{c._count.teams}</td>
                <td className="p-4">
                  {c.archive?.isPublished ? (
                    <span className="pill bg-success/20 text-success">Published</span>
                  ) : (
                    <span className="pill bg-canvas text-mist">Draft</span>
                  )}
                </td>
                <td className="p-4">
                  <Link href={`/admin/archives/${c.id}`} className="btn btn-sm btn-outline-light">Manage Archive</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}