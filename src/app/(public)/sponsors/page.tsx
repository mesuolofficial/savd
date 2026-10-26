import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";
import { Marquee } from "@/components/public/Marquee";
import { SponsorCard } from "@/components/public/SponsorCard";
import { externalUrl } from "@/lib/url";

export const metadata: Metadata = { title: "Sponsors, Partners & Ambassadors" };

export default async function SponsorsPage() {
  const allPartners = await prisma.partner.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
  });

  // Separate Partners and Ambassadors
  const partners = allPartners.filter(p => p.type === "SOCIETY" || p.type === "INSTITUTE");
  const ambassadors = allPartners.filter(p => p.type === "AMBASSADOR");

  const sponsors = await prisma.sponsor.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ tier: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">Backed by the best</p>
          <h1>Our Ecosystem</h1>
          <p className="sub">The organizations and individuals powering Pakistan&apos;s first national AUV competition.</p>
        </div>
      </header>
      <MeltEdge seed={99} />

      <section className="pg" style={{ overflowX: "clip" }}>
        <div className="wrap">
          
          {/* 1. SPONSORS & ORGANIZERS SECTION */}
          <div style={{ marginBottom: 80 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <p className="ey" style={{ color: "var(--color-signal)" }}>Official Sponsors & Organizers</p>
              <h2 style={{ fontSize: 36 }}>Powering the Mission</h2>
            </div>
            
            {sponsors.length === 0 ? (
              <p className="empty">Sponsors will be announced soon.</p>
            ) : (
              <div style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}>
              <Marquee 
                label="Sponsors and Organizers" 
                items={sponsors.map((s) => (
                  <SponsorCard key={s.id} size="lg" name={s.name} logo={s.logo} tier={s.tier} url={s.websiteUrl} />
                ))} 
              />
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link href="/sponsors/apply/sponsor" className="btn b1">Become a Sponsor</Link>
            </div>
          </div>

          {/* 2. PARTNERS SECTION */}
          <div style={{ marginBottom: 80, paddingTop: 40, borderTop: "1px dashed var(--line)" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <p className="ey" style={{ color: "var(--color-signal)" }}>Community Partners</p>
              <h2 style={{ fontSize: 36 }}>Societies & Institutes</h2>
            </div>
            
            {partners.length === 0 ? (
              <p className="empty">Partners will be announced soon.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                {partners.map((p) => {
                  const href = externalUrl(p.socialMediaUrl);
                  const inner = (
                    <>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--color-ink)" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--color-mist)", marginTop: 8 }}>{p.institution || p.type}</div>
                      {href ? <div style={{ fontSize: 12, color: "var(--color-signal)", marginTop: 10, fontWeight: 600 }}>Follow us ↗</div> : null}
                    </>
                  );
                  return href ? (
                    <a key={p.id} href={href} target="_blank" rel="noopener noreferrer" className="card transition duration-200 hover:-translate-y-1 hover:shadow-lg" style={{ padding: 24, textAlign: "center", display: "block", textDecoration: "none" }}>
                      {inner}
                    </a>
                  ) : (
                    <div key={p.id} className="card" style={{ padding: 24, textAlign: "center" }}>{inner}</div>
                  );
                })}
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link href="/sponsors/apply/partner" className="btn b2" style={{ borderColor: "var(--color-ink)", color: "var(--color-ink)" }}>Become a Partner</Link>
            </div>
          </div>

          {/* 3. AMBASSADORS SECTION (List Format with Referral Codes) */}
          <div style={{ paddingTop: 40, borderTop: "1px dashed var(--line)" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <p className="ey" style={{ color: "var(--color-signal)" }}>Campus Representatives</p>
              <h2 style={{ fontSize: 36, marginBottom: 16 }}>Student Ambassadors</h2>
              <p style={{ color: "var(--color-mist)", maxWidth: 600, margin: "0 auto" }}>
                Ambassadors are the driving force behind SAVD. They promote the competition on their campuses.
              </p>
            </div>
            
            {ambassadors.length === 0 ? (
              <p className="empty">Ambassadors will be announced soon.</p>
            ) : (
              <div className="card" style={{ maxWidth: 800, margin: "0 auto", padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead style={{ background: "var(--color-canvas)", borderBottom: "1px solid var(--color-line)" }}>
                    <tr>
                      <th style={{ padding: 16 }}>Name</th>
                      <th style={{ padding: 16 }}>Institution</th>
                      <th style={{ padding: 16 }}>Referral Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ambassadors.map((a) => (
                      <tr key={a.id} style={{ borderBottom: "1px solid var(--color-line)" }}>
                        <td style={{ padding: 16, fontWeight: 600 }}>{a.name}</td>
                        <td style={{ padding: 16, color: "var(--color-mist)" }}>{a.institution || "-"}</td>
                        <td style={{ padding: 16 }}>
                          <span className="mono-chip" style={{ background: "rgba(34, 97, 146, 0.1)", color: "var(--color-signal)", padding: "4px 8px", borderRadius: 6, fontWeight: "bold", fontFamily: "var(--font-mono)" }}>
                            {a.referralCode}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link href="/sponsors/apply/ambassador" className="btn b1">Become an Ambassador</Link>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}