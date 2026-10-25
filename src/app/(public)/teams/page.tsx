import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";

export const metadata: Metadata = { title: "Teams" };

export default async function PublicTeamsPage() {
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      competition: { select: { title: true, slug: true, isPublished: true } },
      _count: { select: { members: true } },
    },
  });

  // Filter out teams from draft competitions
  const publishedTeams = teams.filter(t => t.competition.isPublished);

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">The Vehicles</p>
          <h1>Meet the Teams</h1>
          <p className="sub">The brilliant minds engineering the future of underwater robotics.</p>
        </div>
      </header>
      <MeltEdge seed={55} />

      <section className="pg">
        <div className="wrap">
          {publishedTeams.length === 0 ? (
            <div className="card p-12 text-center max-w-lg mx-auto">
              <p className="text-lg font-bold text-ink mb-2">No teams announced yet</p>
              <p className="text-mist">Please check back later to meet the competitors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedTeams.map((t) => (
                // 👈 Yahan t.id ki jagah t.slug kar diya gaya hai
                <Link key={t.id} href={`/teams/${t.slug}`} className="card overflow-hidden flex flex-col bg-white hover:shadow-lg transition-shadow group">
                  
                  {/* Team Logo Header */}
                  <div className="bg-canvas h-40 flex items-center justify-center p-6 border-b border-line group-hover:bg-[#f0f4f8] transition-colors">
                    {t.logo ? (
                      <img src={t.logo} alt={t.name} className="max-h-full max-w-full object-contain drop-shadow-md" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-signal text-white flex items-center justify-center text-3xl font-display font-bold shadow-md">
                        {t.name[0]}
                      </div>
                    )}
                  </div>
                  
                  {/* Team Details */}
                  <div className="p-5 flex-1 flex flex-col text-center">
                    <h3 className="text-xl font-bold text-ink leading-tight mb-1">{t.name}</h3>
                    <p className="text-xs text-mist mb-4">{t.universityText || "University Not Specified"}</p>
                    
                    <div className="mt-auto pt-4 border-t border-line">
                      <div className="flex justify-between items-center text-xs font-semibold text-mist">
                        <span>{t.competition.title}</span>
                        <span className="bg-signal/10 text-signal px-2 py-1 rounded">{t._count.members} Members</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}