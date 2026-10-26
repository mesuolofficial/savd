import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";
import type { Metadata } from "next";
import { TeamMediaGallery } from "@/components/public/TeamMediaGallery";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const team = await prisma.team.findUnique({ where: { slug }, select: { name: true } });
  return { title: team ? `${team.name} — Team Profile` : "Team" };
}

export default async function TeamProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const team = await prisma.team.findUnique({
    where: { slug }, // 👈 Ab slug use ho raha hai
    include: {
      competition: { select: { title: true, slug: true } },
      members: { include: { person: true } },
      media: true,
      results: true,
    },
  });

  if (!team) notFound();

  return (
    <>
      <header className="ph dk" style={{ paddingBottom: 60 }}>
        <div className="wrap">
          <p className="ey">Competing Team</p>
          <h1>{team.name}</h1>
          <p className="sub">{team.universityText || "University Not Specified"} · {team.competition.title}</p>
        </div>
      </header>
      <MeltEdge seed={66} />

      <section className="pg">
        <div className="wrap max-w-5xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-[300px_1fr]">
          
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="card p-6 text-center">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-full max-h-48 object-contain mb-6" />
              ) : (
                <div className="w-32 h-32 mx-auto rounded-full bg-signal text-white flex items-center justify-center text-5xl font-display font-bold mb-6">
                  {team.name[0]}
                </div>
              )}
              <h2 className="text-xl font-bold text-ink">{team.name}</h2>
              <p className="text-sm text-mist mb-4">{team.universityText}</p>
              
              {team.results.length > 0 && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-xs font-bold text-mist uppercase tracking-wider mb-2">Awards</p>
                  {team.results.map(r => (
                    <span key={r.id} className="inline-block bg-[#fcf8e3] text-[#8a6d3b] px-2 py-1 rounded text-xs font-bold mr-2 mb-2">
                      {r.medal === "GOLD" ? "🥇" : r.medal === "SILVER" ? "🥈" : r.medal === "BRONZE" ? "🥉" : "🏆"} {r.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-mist mb-4">Team Members</h3>
              <div className="space-y-4">
                {team.members.map(m => (
                  <div key={m.id} className="flex gap-3 items-center">
                    {m.person.photo ? <img src={m.person.photo} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center font-bold text-mist">{m.person.name[0]}</div>}
                    <div>
                      <p className="font-bold text-ink text-sm">{m.person.name}</p>
                      <p className="text-xs text-mist font-mono">{m.person.savdId} · {m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-8">
            <div className="card p-4 sm:p-6">
              <h2 className="text-xl font-bold text-ink mb-4 border-b border-line pb-2">Prototype Description</h2>
              <p className="text-mist text-sm leading-relaxed whitespace-pre-wrap">
                {team.prototypeDescription || "No description provided yet."}
              </p>
            </div>

            {/* Media Gallery */}
            {team.media.length > 0 && (
              <div className="card p-4 sm:p-6">
                <h2 className="text-xl font-bold text-ink mb-4 border-b border-line pb-2">Prototype Media</h2>
                <TeamMediaGallery items={team.media.map((m) => ({ id: m.id, type: m.type, file: m.file }))} />
              </div>
            )}

            {/* Documents */}
            {(team.reportFile || team.posterFile) && (
              <div className="card p-4 sm:p-6">
                <h2 className="text-xl font-bold text-ink mb-4 border-b border-line pb-2">Documents</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  {team.reportFile && <a href={team.reportFile} target="_blank" className="btn b1 justify-center">📄 Design Report</a>}
                  {team.posterFile && <a href={team.posterFile} target="_blank" className="btn b2 justify-center" style={{ borderColor: "var(--line)", color: "var(--ink)" }}>🖼️ Design Poster</a>}
                </div>
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
}