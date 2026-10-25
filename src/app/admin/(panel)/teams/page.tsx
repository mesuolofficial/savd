import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function TeamsPage() {
  await requireAdmin("teams", "view");

  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      competition: { select: { title: true } },
      _count: { select: { members: true, media: true } },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">Teams</h1>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas border-b border-line">
            <tr>
              <th className="p-4">Team Name</th>
              <th className="p-4">Competition</th>
              <th className="p-4">University</th>
              <th className="p-4">Members</th>
              <th className="p-4">Media</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-mist">No teams created yet. Approve a registration to create a team.</td></tr>
            ) : teams.map((t) => (
              <tr key={t.id} className="border-b border-line/50 hover:bg-canvas/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {t.logo ? (
                      <img src={t.logo} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center font-bold text-xs">{t.name[0]}</div>
                    )}
                    <span className="font-bold text-ink">{t.name}</span>
                  </div>
                </td>
                <td className="p-4 text-mist">{t.competition.title}</td>
                <td className="p-4">{t.universityText || "-"}</td>
                <td className="p-4"><span className="pill bg-signal/10 text-signal">{t._count.members} members</span></td>
                <td className="p-4 text-mist">{t._count.media} files</td>
                <td className="p-4">
                  <Link href={`/admin/teams/${t.id}`} className="btn btn-sm btn-outline-light">Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}