import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { canView, competitionScope } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";
import { SITE_TIMEZONE } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const admin = await requireAdmin("dashboard");
  const { denied } = await searchParams;
  const scope = competitionScope(admin);
  const now = new Date();

  const [activeComps, pendingRegs, teams, people, unreadMsgs, pendingReviews, recent] = await Promise.all([
    canView(admin, "competitions")
      ? prisma.competition.count({ where: { endDate: { gte: now }, ...(admin.competitionId ? { id: admin.competitionId } : {}) } })
      : null,
    canView(admin, "registrations") ? prisma.registration.count({ where: { status: "PENDING", ...scope } }) : null,
    canView(admin, "teams") ? prisma.team.count({ where: scope }) : null,
    canView(admin, "people") ? prisma.person.count() : null,
    canView(admin, "messages") ? prisma.contactMessage.count({ where: { status: "UNREAD" } }) : null,
    canView(admin, "reviews") ? prisma.review.count({ where: { status: "PENDING", ...scope } }) : null,
    prisma.activityLog.findMany({
      where: admin.role === "SUPER_ADMIN" ? {} : { adminId: admin.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  // Each role only sees the numbers it can act on (spec §C5).
  const kpis = [
    { label: "Active competitions", value: activeComps },
    { label: "Pending registrations", value: pendingRegs },
    { label: "Teams", value: teams },
    { label: "People", value: people },
    { label: "Unread messages", value: unreadMsgs },
    { label: "Reviews to moderate", value: pendingReviews },
  ].filter((k): k is { label: string; value: number } => k.value !== null);

  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: SITE_TIMEZONE }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">
        {greeting}, {admin.name.split(" ")[0]}.
      </h1>
      <p className="mt-1 text-sm text-mist">Here is what needs your attention.</p>

      {denied ? (
        <div role="alert" className="mt-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-ink">
          You don&apos;t have access to that page with your current role.
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <p className="eyebrow text-mist">{k.label}</p>
            <p className="mt-2 font-display text-5xl font-bold text-signal">{k.value}</p>
          </div>
        ))}
      </div>

      <section className="card mt-6 p-5">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Recent activity</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-mist">Nothing yet. Actions you take will appear here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {recent.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm">
                <span><strong className="font-semibold">{r.adminName}</strong> — {r.action}</span>
                <time className="text-xs text-mist">{formatDateTime(r.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
