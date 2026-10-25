import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateRange, formatDateTime } from "@/lib/format";
import { competitionState, isRegistrationOpen } from "@/lib/competition-status";
import type { Prize } from "@/lib/validators/competition.schema";
import { MeltEdge } from "@/components/public/MeltEdge";
import { getSettings } from "@/lib/settings";
import { Lightbox } from "@/components/public/Lightbox";

const MEDAL = { GOLD: "🥇", SILVER: "🥈", BRONZE: "🥉", NONE: "🏆" } as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await prisma.competition.findFirst({ where: { slug, isPublished: true }, select: { title: true } });
  return { title: c?.title ?? "Competition" };
}

export default async function CompetitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // UPDATED: Added _count to check if results exist without loading all data
  const c = await prisma.competition.findFirst({ 
    where: { slug, isPublished: true },
    include: { _count: { select: { results: true } } }
  });
  
  if (!c) notFound();

  const now = new Date();
  const settings = await getSettings();
  const st = competitionState(c, now), open = isRegistrationOpen(c, now, settings.globalRegistrationOpen);
  const prizes = Array.isArray(c.prizes) ? (c.prizes as Prize[]) : [];
  const closedReason = !settings.globalRegistrationOpen || !c.registrationOpen ? "Registration is currently closed." : "The registration deadline has passed.";

  const renderHtml = (html: string) => <div className="tx" dangerouslySetInnerHTML={{ __html: html }} />;
  const hasResults = c._count.results > 0;

  return (
    <>
      <header className="ph dk" style={c.bannerUrl ? { backgroundImage: `linear-gradient(rgba(15,47,75,0.8), rgba(15,47,75,0.8)), url(${c.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        <div className="wrap">
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <span className={`pill ${st === "ONGOING" ? "live" : st === "UPCOMING" ? "up" : ""}`}>{st.toLowerCase()}</span>
            {open ? <span className="pill open">Registration open</span> : null}
            {hasResults ? <span className="pill" style={{ background: "var(--gold)", color: "var(--cta-ink)" }}>Results Available</span> : null}
          </div>
          <h1>{c.title}</h1>
          <p className="sub">{formatDateRange(c.startDate, c.endDate)}{c.venue ? ` · ${c.venue}` : ""}</p>
        </div>
      </header>
      <MeltEdge seed={19} />

      <section className="pg"><div className="wrap det">
        <div>
          {c.bannerUrl && (
            <div style={{ marginBottom: 32 }}>
              <p className="ey" style={{ marginBottom: 8 }}>Event Poster</p>
              <Lightbox src={c.bannerUrl} alt={c.title}>
                <div style={{ position: "relative", display: "inline-block", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
                  <img src={c.bannerUrl} alt={c.title} style={{ display: "block", maxWidth: "100%", maxHeight: 400, objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "8px 16px", fontSize: 13, textAlign: "center" }}>Click to enlarge</div>
                </div>
              </Lightbox>
            </div>
          )}

          {c.description ? (<><h2>Overview</h2>{renderHtml(c.description)}</>) : null}
          {c.rules ? (<><h2>Rules</h2>{renderHtml(c.rules)}</>) : null}
          {c.eligibility ? (<><h2>Eligibility</h2>{renderHtml(c.eligibility)}</>) : null}
          
          {prizes.length ? (<><h2>Prizes</h2><div className="prz">{prizes.map((p, i) => (
            <div key={i}><span>{MEDAL[p.medal] ?? MEDAL.NONE} {p.label}</span><strong>{p.amount}</strong></div>))}</div></>) : null}

          {!c.description && !c.rules && !c.eligibility && !prizes.length ? <p className="empty">Details will be published soon.</p> : null}
        </div>

        <aside className="reg">
          <p className="ey">Registration</p>
          <dl>
            <div><dt>Dates</dt><dd>{formatDateRange(c.startDate, c.endDate)}</dd></div>
            {c.venue ? <div><dt>Venue</dt><dd>{c.venue}</dd></div> : null}
            <div><dt>Team size</dt><dd>{c.type === "TEAM" ? `${c.minTeamSize}–${c.maxTeamSize} members` : "Individual"}</dd></div>
            <div><dt>Deadline</dt><dd>{formatDateTime(c.registrationDeadline)}</dd></div>
          </dl>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {c.rulebookUrl ? (
              <a href={c.rulebookUrl} target="_blank" rel="noopener noreferrer" className="btn b2" style={{ width: "100%", borderColor: "var(--glow)", color: "var(--glow)" }}>📄 Download Rulebook</a>
            ) : null}

            {/* NEW: View Results Button */}
            {hasResults ? (
              <Link href={`/competitions/${c.slug}/results`} className="btn b2" style={{ width: "100%", borderColor: "var(--gold)", color: "var(--gold)" }}>
                🏆 View Official Results
              </Link>
            ) : null}

            {open ? <Link className="btn b1" href={`/competitions/${c.slug}/register`}>Register your team</Link>
              : <p style={{ opacity: 0.8, fontStyle: "italic", textAlign: "center", fontSize: "0.9rem", margin: "8px 0" }}>{closedReason}</p>}
          </div>
        </aside>
      </div></section>
    </>
  );
}