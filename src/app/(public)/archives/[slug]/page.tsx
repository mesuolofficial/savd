import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";
import { formatDateRange } from "@/lib/format";
import { ArchiveCollapsible } from "@/components/public/ArchiveCollapsible";
import { ArchiveHeading } from "@/components/public/ArchiveHeading";
import { FileText, Star, Users, Gavel, Shield, Trophy } from "lucide-react";

const MEDAL = { GOLD: "🥇", SILVER: "🥈", BRONZE: "🥉", NONE: "🏆" } as const;

export default async function PublicArchiveDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const archive = await prisma.archive.findFirst({
    where: { competition: { slug }, isPublished: true },
    include: {
      competition: {
        include: {
          results: { include: { team: true }, orderBy: { sortOrder: "asc" } },
          teams: true,
        }
      },
      roles: { include: { person: true }, orderBy: { displayOrder: "asc" } },
    },
  });

  if (!archive) notFound();

  const comp = archive.competition;
  const winners = comp.results.filter(r => r.team);
  
  const chiefGuests = archive.roles.filter(r => r.role === "CHIEF_GUEST");
  const panelMembers = archive.roles.filter(r => r.role === "PANEL_MEMBER");
  const judges = archive.roles.filter(r => r.role === "JUDGE");
  const organizers = archive.roles.filter(r => r.role === "ORGANIZER");

  return (
    <>
      <header className="ph dk" style={{ paddingBottom: 60 }}>
        <div className="wrap">
          <p className="ey">Past Edition</p>
          <h1>{comp.title}</h1>
          <p className="sub">{formatDateRange(comp.startDate, comp.endDate)} · {comp.venue}</p>
        </div>
      </header>
      <MeltEdge seed={99} />

      <section className="pg">
        <div className="wrap max-w-5xl mx-auto">
          
          {/* 1. Collapsible Description Section */}
          {comp.description && (
            <div className="w-full mb-12">
              <ArchiveCollapsible title="Overview & Details" icon={<FileText className="w-5 h-5" />}>
                <div className="bg-white border border-line rounded-xl p-6 sm:p-8 shadow-sm text-left">
                  <div className="tx text-mist leading-relaxed" dangerouslySetInnerHTML={{ __html: comp.description }} />
                </div>
              </ArchiveCollapsible>
            </div>
          )}

          {/* 2. Chief Guest */}
          {chiefGuests.length > 0 && (
            <div className="mb-16">
              <ArchiveHeading title="Chief Guest" icon={<Star className="w-5 h-5" />} />
              <div className="text-center">
                {chiefGuests.map(cg => (
                  <div key={cg.id} className="inline-block text-center">
                    {cg.person.photo ? <img src={cg.person.photo} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-[#ef8557] shadow-lg transition-transform hover:scale-105" /> : <div className="w-32 h-32 rounded-full bg-signal text-white flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-[#ef8557]">{cg.person.name[0]}</div>}
                    <h3 className="text-xl font-bold text-ink">{cg.person.name}</h3>
                    <p className="text-sm text-mist mt-1">{cg.person.bio || "Chief Guest"}</p>
                    <p className="text-xs font-mono text-signal mt-2">{cg.person.savdId}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Panel Members */}
          {panelMembers.length > 0 && (
            <div className="mb-16">
              <ArchiveHeading title="Panel Members" icon={<Users className="w-5 h-5" />} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {panelMembers.map(r => (
                  <div key={r.id} className="text-center group">
                    {r.person.photo ? <img src={r.person.photo} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-[#ef8557] transition-transform group-hover:scale-105" /> : <div className="w-20 h-20 rounded-full bg-canvas flex items-center justify-center text-2xl font-bold mx-auto mb-3 border-2 border-[#ef8557]">{r.person.name[0]}</div>}
                    <p className="font-bold text-ink text-sm">{r.person.name}</p>
                    <p className="text-xs text-mist font-mono">{r.person.savdId}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Judges */}
          {judges.length > 0 && (
            <div className="mb-16">
              <ArchiveHeading title="Judges" icon={<Gavel className="w-5 h-5" />} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {judges.map(r => (
                  <div key={r.id} className="text-center group">
                    {r.person.photo ? <img src={r.person.photo} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-[#ef8557] transition-transform group-hover:scale-105" /> : <div className="w-20 h-20 rounded-full bg-canvas flex items-center justify-center text-2xl font-bold mx-auto mb-3 border-2 border-[#ef8557]">{r.person.name[0]}</div>}
                    <p className="font-bold text-ink text-sm">{r.person.name}</p>
                    <p className="text-xs text-mist font-mono">{r.person.savdId}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Organizers */}
          {organizers.length > 0 && (
            <div className="mb-16">
              <ArchiveHeading title="Organizers" icon={<Shield className="w-5 h-5" />} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {organizers.map(r => (
                  <div key={r.id} className="text-center group">
                    {r.person.photo ? <img src={r.person.photo} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-[#ef8557] transition-transform group-hover:scale-105" /> : <div className="w-20 h-20 rounded-full bg-canvas flex items-center justify-center text-2xl font-bold mx-auto mb-3 border-2 border-[#ef8557]">{r.person.name[0]}</div>}
                    <p className="font-bold text-ink text-sm">{r.person.name}</p>
                    <p className="text-xs text-mist font-mono">{r.person.savdId}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Competing Teams */}
          {comp.teams.length > 0 && (
            <div className="mb-16">
              <ArchiveHeading title="Competing Teams" icon={<Users className="w-5 h-5" />} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {comp.teams.map(t => (
                  <Link key={t.id} href={`/teams/${t.id}`} className="card p-6 text-center hover:shadow-lg transition-shadow bg-white border border-line flex flex-col items-center group">
                    {t.logo ? <img src={t.logo} className="w-16 h-16 object-contain mb-4 transition-transform group-hover:scale-110" /> : <div className="w-16 h-16 rounded-full bg-signal text-white flex items-center justify-center text-2xl font-bold mb-4">{t.name[0]}</div>}
                    <p className="font-bold text-ink">{t.name}</p>
                    <p className="text-xs text-mist mt-1">{t.universityText}</p>
                    <p className="text-xs text-signal font-bold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">View Team →</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 7. Final Results */}
          {winners.length > 0 && (
            <div className="max-w-2xl mx-auto w-full mb-16">
              <ArchiveHeading title="Final Results" icon={<Trophy className="w-5 h-5" />} />
              <div className="card overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0f2f4b] text-white">
                    <tr><th className="p-4">Position</th><th className="p-4">Team</th><th className="p-4 text-center">Medal</th></tr>
                  </thead>
                  <tbody>
                    {winners.map(r => (
                      <tr key={r.id} className="border-b border-line last:border-0 hover:bg-canvas/50 transition-colors">
                        <td className="p-4 font-bold text-ink">{r.label}</td>
                        <td className="p-4 text-mist">{r.team?.name}</td>
                        <td className="p-4 text-center text-xl">{MEDAL[r.medal]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}