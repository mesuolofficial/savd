import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export default async function RegistrationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin("registrations", "view");
  const { status } = await searchParams;

  const validStatuses = ["PENDING", "APPROVED", "REJECTED", "WITHDRAWN"];
  const filterStatus = status && validStatuses.includes(status.toUpperCase()) ? status.toUpperCase() as any : undefined;

  const registrations = await prisma.registration.findMany({
    where: filterStatus ? { status: filterStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { competition: { select: { title: true } }, partner: { select: { name: true } } },
  });

  const counts = await prisma.registration.groupBy({ by: ['status'], _count: true });
  const getCount = (s: string) => counts.find(c => c.status === s)?._count || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">Registrations</h1>
      </div>

      <div className="flex gap-2 mb-6 border-b border-line pb-4 overflow-x-auto">
        <Link href="/admin/registrations" className={`btn btn-sm ${!filterStatus ? "btn-primary" : "btn-outline-light"}`}>All ({getCount("PENDING") + getCount("APPROVED") + getCount("REJECTED") + getCount("WITHDRAWN")})</Link>
        <Link href="/admin/registrations?status=PENDING" className={`btn btn-sm ${filterStatus === "PENDING" ? "btn-primary" : "btn-outline-light"}`}>Pending ({getCount("PENDING")})</Link>
        <Link href="/admin/registrations?status=APPROVED" className={`btn btn-sm ${filterStatus === "APPROVED" ? "btn-primary" : "btn-outline-light"}`}>Approved ({getCount("APPROVED")})</Link>
        <Link href="/admin/registrations?status=REJECTED" className={`btn btn-sm ${filterStatus === "REJECTED" ? "btn-primary" : "btn-outline-light"}`}>Rejected ({getCount("REJECTED")})</Link>
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
              <tr><td colSpan={6} className="p-8 text-center text-mist">No registrations found.</td></tr>
            ) : registrations.map((r) => (
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
                  <span className={`pill ${r.status === "APPROVED" ? "bg-success/20 text-success" : r.status === "PENDING" ? "bg-warning/20 text-warning" : "bg-danger/20 text-danger"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/admin/registrations/${r.id}`} className="btn btn-sm btn-outline-light">Review</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}