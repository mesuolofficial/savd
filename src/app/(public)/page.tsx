import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateRange } from "@/lib/format";
import { MeltEdge } from "@/components/public/MeltEdge";
import { Countdown } from "@/components/public/Countdown";
import { getSettings } from "@/lib/settings";
import { Marquee, initials } from "@/components/public/Marquee";
import { Testimonials } from "@/components/public/Testimonials";

const ROLE_LABEL = { PARTICIPANT: "Participant", ORGANIZER: "Organizer", JUDGE: "Judge", GUEST: "Guest" } as const;

export default async function HomePage() {
  const now = new Date();
  const settings = await getSettings();
  
  const comp = await prisma.competition.findFirst({
    where: { isPublished: true },
    orderBy: { startDate: "desc" },
  });

  const [teamsCount, judgesCount] = await Promise.all([
    comp ? prisma.team.count({ where: { competitionId: comp.id } }) : 0,
    comp ? prisma.archiveRole.count({ where: { archive: { competitionId: comp.id }, role: "JUDGE" } }) : 0,
  ]);

  // Fetch Universities directly from the University table
  const uniList = comp ? await prisma.university.findMany({
    where: {
      OR: [
        { teams: { some: { competitionId: comp.id } } },
        { registrations: { some: { competitionId: comp.id } } }
      ]
    },
    orderBy: { name: "asc" }
  }) : [];

  const [sponsorList, reviewList] = await Promise.all([
    prisma.sponsor.findMany({ orderBy: [{ tier: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
    prisma.review.findMany({
      where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 8,
      include: { person: { select: { name: true, photo: true } }, competition: { select: { title: true } } },
    }),
  ]);
  
  const testimonials = reviewList.map((r) => ({ id: r.id, text: r.text, name: r.person.name, role: ROLE_LABEL[r.role], context: r.competition.title, photo: r.person.photo }));

  const regOpen = !!comp && settings.globalRegistrationOpen && comp.registrationOpen && comp.registrationDeadline > now;
  const target = !comp ? null : regOpen ? { at: comp.registrationDeadline, label: "Registration closes in" }
    : comp.startDate > now ? { at: comp.startDate, label: "The dive begins in" } : null;
  const primaryHref = comp ? (regOpen ? `/competitions/${comp.slug}/register` : `/competitions/${comp.slug}`) : "/competitions";
  const title = comp?.title ?? "SAVD";
  const live = comp && target ? { comp, target } : null;

  return (
    <>
      <header className="hero dk">
        <div className="ghost">SAVD</div>
        <span className="ring" /><span className="ring" /><span className="ring" />
        <div className="wrap">
          <p className="ey" style={{ position: "relative" }}>National Submersible Autonomous Vehicle Design Competition</p>
          <p className="ur" lang="ur" dir="rtl">گہرائیوں کی تسخیر</p>
          <h1>{title}</h1>
          <p className="t">Pakistan&apos;s first national autonomous underwater vehicle competition.</p>
          {comp ? (<><p className="dt">{formatDateRange(comp.startDate, comp.endDate).toUpperCase()}</p>{comp.venue ? <p className="vn">{comp.venue}</p> : null}</>)
            : <p className="dt">COMING SOON</p>}
          <div className="cta">
            <Link className="btn b1" href={primaryHref}>{regOpen ? "Register now" : "View competition"}</Link>
            <Link className="btn b2" href="/about">Explore SAVD</Link>
          </div>
        </div>
      </header>
      <MeltEdge seed={11} />

      <section className="cd"><div className="wrap rv">
        <p className="ey">{live ? live.target.label : "The dive begins in"}</p>
        <h2>{live ? (regOpen ? "Secure your spot" : `${live.comp.title} begins`) : `${title} begins`}</h2>
        {live ? (
          <Countdown targetIso={live.target.at.toISOString()} footer={`${formatDate(live.target.at)}${live.comp.venue ? ` · ${live.comp.venue}` : ""}`} />
        ) : (
          <div className="cdb"><div><div className="tba">To be announced soon</div><p>{comp?.venue || "University of Lahore"}</p></div></div>
        )}
      </div></section>

      <section className="intro"><div className="wrap">
        <div className="rv"><p className="ey">A national first</p><h2>Design.<br />Build. Dive.</h2>
          <p className="sub">Celebrating student engineering that works underwater.</p></div>
        <div className="rv">
          <p>SAVD brings together student teams from across Pakistan to design, build and pilot their own autonomous underwater vehicles, judged on manoeuvrability, remote-control precision and full autonomy.</p>
          <p>Organized by the Mechanical Engineering Society at the University of Lahore, it is open to engineers, programmers and designers from every department.</p>
          <Link className="btn b1" href="/competitions">View competitions</Link>
        </div>
      </div></section>

      <section className="stats dk"><div className="wrap"><div className="grid rv">
        <div className="st"><b data-n={teamsCount}>{teamsCount}</b><span>Teams</span></div>
        <div className="st"><b data-n={uniList.length}>{uniList.length}</b><span>Universities</span></div>
        <div className="st"><b data-n={judgesCount}>{judgesCount}</b><span>Judges</span></div>
        <div className="st"><b data-n={3}>3</b><span>Challenge stages</span></div>
      </div></div></section>
      <MeltEdge seed={53} />

      <section className="cards"><div className="wrap">
        <p className="ey" style={{ textAlign: "center" }}>What awaits</p><h2>Three stages. One depth.</h2>
        <div className="cg3">
          <div className="cd3 rv"><h3>Qualifying round</h3><p>Reverse, forward, roll, pitch, yaw and depth variation. Prove the vehicle can move.</p></div>
          <div className="cd3 rv"><h3>Controlled mode</h3><p>Three underwater gates and a black-line S-curve, flown by wireless remote control.</p></div>
          <div className="cd3 rv"><h3>Autonomous bonus</h3><p>No hands. The vehicle finds the gates and follows the line entirely on its own.</p></div>
        </div>
      </div></section>

      {/* ✅ UNIVERSITIES MARQUEE (Slightly smaller logos & padding) */}
      {uniList.length > 0 ? (
        <section className="uni">
          <div className="wrap rv"><p className="ey">Competing universities</p><h2>Teams from across Pakistan</h2></div>
          <Marquee label="Competing universities" items={uniList.map((u) => (
            <span key={u.id} className="uc" style={{ padding: "6px 20px 6px 12px" }}>
              {u.logo ? (
                <img 
                  src={u.logo} 
                  alt={u.name} 
                  style={{ maxHeight: "32px", width: "auto", maxWidth: "80px", objectFit: "contain" }} 
                />
              ) : (
                <i>{initials(u.name)}</i>
              )}
              {u.name}
            </span>
          ))} />
        </section>
      ) : null}

      {/* ✅ SPONSORS MARQUEE (Slightly smaller cards & logos) */}
      {sponsorList.length > 0 ? (
        <>
          <section className="spn dk">
            <svg className="wtop" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true"><path fill="var(--ivory)" d="M0 0H1440V28C1220 72 1010 4 730 32S250 64 0 22Z" /></svg>
            <div className="wrap rv"><p className="ey">Our partners</p><h2>Backed by the best</h2></div>
            <Marquee label="Sponsors and partners" items={sponsorList.map((sp) => (
              <div key={sp.id} style={{ width: 240, height: 110, background: "#fff", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, margin: "0 10px", flexShrink: 0 }}>
                {sp.logo ? (
                  <img src={sp.logo} alt={sp.name} style={{ maxHeight: 60, maxWidth: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, textAlign: "center", color: "#14202b" }}>{sp.name}</span>
                )}
                <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#5d6d7a", marginTop: 8 }}>{sp.tier}</span>
              </div>
            ))} />
            <div className="wrap rv"><Link className="btn b2" href="/sponsors">Become a sponsor</Link></div>
          </section>
          <MeltEdge seed={77} />
        </>
      ) : null}

      {testimonials.length > 0 ? (
        <section className="vo">
          <div className="wrap">
            <div className="rv" style={{ textAlign: "center" }}><p className="ey">Voices</p><h2>What they say</h2></div>
            <Testimonials items={testimonials} />
            <div style={{ textAlign: "center" }}><Link className="vl" href="/reviews">Read all reviews →</Link></div>
          </div>
        </section>
      ) : null}

      <div className="wrap"><div className="cb rv">
        <div><h2>Ready to dive in?</h2><div className="ur" lang="ur" dir="rtl">غوطہ لگانے کے لیے تیار؟</div>
          <p>{comp ? `Secure your team's place at ${comp.title}.` : "Registration opens soon."}</p></div>
        <Link className="btn b1" href={primaryHref}>{regOpen ? "Register now" : "View competition"}</Link>
      </div></div>
    </>
  );
}