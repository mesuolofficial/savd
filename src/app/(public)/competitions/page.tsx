import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/format";
import { competitionState, isRegistrationOpen } from "@/lib/competition-status";
import { MeltEdge } from "@/components/public/MeltEdge";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Competitions" };

const STATES = [["open", "Open"], ["ongoing", "Ongoing"], ["upcoming", "Upcoming"], ["ended", "Ended"]] as const;
const TYPES = [["team", "Team"], ["individual", "Individual"]] as const;

function href(p: { state?: string; type?: string }) {
  const q = new URLSearchParams();
  if (p.state) q.set("state", p.state);
  if (p.type) q.set("type", p.type);
  const s = q.toString();
  return s ? `/competitions?${s}` : "/competitions";
}

export default async function CompetitionsPage({ searchParams }: { searchParams: Promise<{ state?: string; type?: string }> }) {
  const { state, type } = await searchParams;
  const now = new Date();
  const settings = await getSettings();
  const all = await prisma.competition.findMany({ where: { isPublished: true }, orderBy: { startDate: "desc" } });

  // Helper to strip HTML tags for short descriptions
  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

  const list = all.filter((c) => {
    const st = competitionState(c, now);
    if (state === "open" && !isRegistrationOpen(c, now, settings.globalRegistrationOpen)) return false;
    if (state && state !== "open" && st.toLowerCase() !== state) return false;
    if (type && c.type.toLowerCase() !== type) return false;
    return true;
  });

  return (
    <>
      <header className="ph dk"><div className="wrap">
        <p className="ey">Battle of design</p>
        <h1>Competitions</h1>
        <p className="sub">Every edition of SAVD, past and present.</p>
      </div></header>
      <MeltEdge seed={7} />

      <section className="pg"><div className="wrap">
        <div className="fl">
          <Link href={href({ type })} className={!state ? "on" : undefined}>All</Link>
          {STATES.map(([k, l]) => <Link key={k} href={href({ state: k, type })} className={state === k ? "on" : undefined}>{l}</Link>)}
        </div>
        <div className="fl">
          {TYPES.map(([k, l]) => <Link key={k} href={href({ state, type: type === k ? undefined : k })} className={type === k ? "on" : undefined}>{l}</Link>)}
        </div>

        {list.length === 0 ? (
          <p className="empty">{all.length === 0 ? "Competitions will be announced soon." : "No competitions match these filters."}</p>
        ) : (
          <div className="cgrid">
            {list.map((c) => {
              const st = competitionState(c, now), open = isRegistrationOpen(c, now, settings.globalRegistrationOpen);
              return (
                <Link key={c.id} href={`/competitions/${c.slug}`} className="cc rv">
                  <div className="bn" style={c.bannerUrl ? { backgroundImage: `url(${c.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
                  <div className="bd">
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className={`pill ${st === "ONGOING" ? "live" : st === "UPCOMING" ? "up" : ""}`}>{st.toLowerCase()}</span>
                      {open ? <span className="pill open">Registration open</span> : null}
                    </div>
                    <h3>{c.title}</h3>
                    <p className="mt">{formatDateRange(c.startDate, c.endDate)}{c.venue ? ` · ${c.venue}` : ""}</p>
                    
                    {/* FIXED: Strip HTML tags for list view */}
                    {c.description ? <p className="ds">{stripHtml(c.description)}</p> : null}
                    
                    <div className="ft"><span className="mt">{c.type === "TEAM" ? `Teams of ${c.minTeamSize}–${c.maxTeamSize}` : "Individual"}</span><span className="more">View details →</span></div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div></section>
    </>
  );
}