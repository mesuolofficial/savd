import Link from "next/link";
import type { RegistrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

const STATUSES: { key: RegistrationStatus; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "WITHDRAWN", label: "Withdrawn" },
];

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; competition?: string }>;
}) {
  await requireAdmin("registrations", "view");
  const { status, competition } = await searchParams;

  // Every competition automatically becomes a filter chip.
  const competitions = await prisma.competition.findMany({
    orderBy: { startDate: "desc" },
    select: { id: true, title: true },
  });
  const perCompetition = await prisma.registration.groupBy({ by: ["competitionId"], _count: true });
  const compCount = (id: string) => perCompetition.find((c) => c.competitionId === id)?._count ?? 0;
  const totalAll = perCompetition.reduce((sum, c) => sum + c._count, 0);

  const activeCompetition = competition && competitions.some((c) => c.id === competition) ? competition : undefined;
  const filterStatus = STATUSES.find((s) => s.key === status?.toUpperCase())?.key;

  const registrations = await prisma.registration.findMany({
    where: {
      ...(filterStatus ? { status: filterStatus } : {}),
      ...(activeCompetition ? { competitionId: activeCompetition } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { competition: { select: { title: true } }, partner: { select: { name: true } } },
  });

  // Status counts follow the selected competition.
  const counts = await prisma.registration.groupBy({
    by: ["status"],
    _count: true,
    where: activeCompetition ? { competitionId: activeCompetition } : undefined,
  });
  const getCount = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const totalInScope = counts.reduce((sum, c) => sum + c._count, 0);

  const href = (p: { status?: string; competition?: string }) => {
    const q = new URLSearchParams();
    if (p.competition) q.set("competition", p.competition);
    if (p.status) q.set("status", p.status);
    const s = q.toString();
    return s ? `/admin/registrations?${s}` : "/admin/registrations";
  };

  const btn = (active: boolean) => `btn btn-sm ${active ? "btn-primary" : "btn-outline-light"}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">Registrations</h1>
      </div>

      <div className="mb-6 border-b border-line pb-4 grid gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-mist mb-2">Competition</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link href={href({ status: filterStatus })} className={btn(!activeCompetition)}>
              All competitions ({totalAll})
            </Link>
            {competitions.map((c) => (
              <Link key={c.id} href={href({ competition: c.id, status: filterStatus })} className={btn(activeCompetition === c.id)}>
                {c.title} ({compCount(c.id)})
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-mist mb-2">Status</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link href={href({ competition: activeCompetition })} className={btn(!filterStatus)}>
              All ({totalInScope})
            </Link>
            {STATUSES.map((s) => (
              <Link key={s.key} href={href({ competition: activeCompetition, status: s.key })} className={btn(filterStatus === s.key)}>
                {s.label} ({getCount(s.key)})
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas border-b border-line">
            <tr>
              <th className="p-4">Team / Competition</th>
              <th className="p-4">Leader</th>
              <th className="p-4">Referred By</th>
              <th className="p-4">Submitted</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-mist">
                  No registrations found for this filter.
                </td>
              </tr>
            ) : (
              registrations.map((r) => (
                <tr key={r.id} className="border-b border-line/50 hover:bg-canvas/30">
                  <td className="p-4">
                    <p className="font-bold text-ink">{r.teamName}</p>
                    <p className="text-xs text-mist">{r.competition.title}</p>
                  </td>
                  <td className="p-4">
                    <p>{r.leaderName}</p>
                    <p className="text-xs text-mist">{r.leaderEmail}</p>
                  </td>
                  <td className="p-4">
                    {r.partner ? (
                      <span className="pill bg-signal/10 text-signal border border-signal/20">{r.partner.name}</span>
                    ) : (
                      <span className="text-mist italic text-xs">Direct</span>
                    )}
                  </td>
                  <td className="p-4 text-mist">{formatDateTime(r.createdAt)}</td>
                  <td className="p-4">
                    <span
                      className={`pill ${
                        r.status === "APPROVED"
                          ? "bg-success/20 text-success"
                          : r.status === "PENDING"
                            ? "bg-warning/20 text-warning"
                            : "bg-danger/20 text-danger"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/registrations/${r.id}`} className="btn btn-sm btn-outline-light">
                      Review
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}