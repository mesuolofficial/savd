import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { canEdit } from "@/lib/permissions";
import { formatDateRange, formatDateTime } from "@/lib/format";
import { setPublishedAction, setRegistrationOpenAction, deleteCompetitionAction } from "@/lib/actions/competition.actions";

export const metadata: Metadata = { title: "Competitions" };

function Toggle({ id, on, action, labels, editable }: { id: string; on: boolean; action: (fd: FormData) => Promise<void>; labels: [string, string]; editable: boolean }) {
  const cls = `rounded-full px-3 py-1 text-xs font-bold ${on ? "bg-success/15 text-success" : "bg-line text-mist"}`;
  const label = on ? labels[0] : labels[1];
  if (!editable) return <span className={cls}>{label}</span>;
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} /><input type="hidden" name="to" value={on ? "0" : "1"} />
      <button type="submit" title="Click to change" className={`${cls} cursor-pointer hover:brightness-95`}>{label}</button>
    </form>
  );
}

export default async function CompetitionsAdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const admin = await requireAdmin("competitions");
  const { error } = await searchParams;
  const editable = canEdit(admin, "competitions");
  const canCreateDelete = editable && !admin.competitionId;

  const list = await prisma.competition.findMany({
    where: admin.competitionId ? { id: admin.competitionId } : {},
    orderBy: { startDate: "desc" },
    include: { _count: { select: { registrations: true, teams: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">Competitions</h1>
          <p className="mt-1 text-sm text-mist">Create editions, publish them, and open or close registration.</p>
        </div>
        {canCreateDelete ? <Link href="/admin/competitions/create" className="btn btn-primary">+ New competition</Link> : null}
      </div>

      {error === "confirm" ? <div role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm">Delete cancelled: the slug you typed did not match.</div> : null}

      {list.length === 0 ? (
        <div className="card p-10 text-center text-mist">No competitions yet.{canCreateDelete ? " Create the first one to get started." : ""}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-mist">
              <tr><th className="p-4">Competition</th><th className="p-4">Dates</th><th className="p-4">Deadline</th><th className="p-4">Published</th><th className="p-4">Registration</th><th className="p-4">Regs / Teams</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((c) => (
                <tr key={c.id} className="align-top">
                  <td className="p-4"><p className="font-semibold">{c.title}</p><span className="mono-chip mt-1">{c.slug}</span></td>
                  <td className="p-4 text-mist">{formatDateRange(c.startDate, c.endDate)}</td>
                  <td className="p-4 text-mist">{formatDateTime(c.registrationDeadline)}</td>
                  <td className="p-4"><Toggle id={c.id} on={c.isPublished} action={setPublishedAction} labels={["Published", "Draft"]} editable={editable} /></td>
                  <td className="p-4"><Toggle id={c.id} on={c.registrationOpen} action={setRegistrationOpenAction} labels={["Open", "Closed"]} editable={editable} /></td>
                  <td className="p-4 text-mist">{c._count.registrations} / {c._count.teams}</td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-3 text-sm font-semibold">
                        {c.isPublished ? <Link href={`/competitions/${c.slug}`} target="_blank" className="text-signal hover:underline">View</Link> : null}
                        {editable ? <Link href={`/admin/competitions/${c.id}/edit`} className="text-signal hover:underline">Edit</Link> : null}
                      </div>
                      {canCreateDelete ? (
                        <details className="text-left">
                          <summary className="cursor-pointer text-xs font-semibold text-danger">Delete…</summary>
                          <form action={deleteCompetitionAction} className="mt-2 w-64 rounded-lg border border-danger/30 bg-danger/5 p-3">
                            <p className="mb-2 text-xs">Deletes this competition <strong>and</strong> its registrations, teams, archive and results. Type <span className="mono-chip">{c.slug}</span> to confirm.</p>
                            <input type="hidden" name="id" value={c.id} />
                            <input name="confirm" className="input mb-2 !h-9 text-sm" autoComplete="off" required />
                            <button type="submit" className="btn btn-sm w-full bg-danger text-white">Delete forever</button>
                          </form>
                        </details>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
