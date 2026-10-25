import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";

export default async function PublicResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const competition = await prisma.competition.findFirst({
    where: { slug, isPublished: true },
    include: {
      results: {
        orderBy: { sortOrder: "asc" },
        include: { team: true },
      },
    },
  });

  if (!competition) notFound();

  const podium = competition.results.filter(r => ["GOLD", "SILVER", "BRONZE"].includes(r.medal) && r.team);
  const others = competition.results.filter(r => !["GOLD", "SILVER", "BRONZE"].includes(r.medal) && r.team);

  const first = podium.find(r => r.medal === "GOLD");
  const second = podium.find(r => r.medal === "SILVER");
  const third = podium.find(r => r.medal === "BRONZE");

  const TeamLogo = ({ team, size = "md" }: { team: any, size?: "sm" | "md" | "lg" }) => {
    const s = size === "lg" ? "w-20 h-20" : size === "md" ? "w-16 h-16" : "w-12 h-12";
    if (team?.logo) return <img src={team.logo} alt={team.name} className={`${s} object-contain mb-2`} />;
    return <div className={`${s} rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl mb-2`}>{team?.name?.[0]}</div>;
  };

  return (
    <>
      <header className="ph dk" style={{ paddingBottom: 60 }}>
        <div className="wrap">
          <p className="ey">Official Results</p>
          <h1>{competition.title}</h1>
          <p className="sub">The official podium and award winners.</p>
        </div>
      </header>
      <MeltEdge seed={77} />

      <section className="pg">
        <div className="wrap max-w-5xl mx-auto">
          
          {podium.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-lg font-bold text-ink mb-2">Results not announced yet</p>
              <p className="text-mist">Please check back later.</p>
            </div>
          ) : (
            <>
              {/* PODIUM DISPLAY */}
              <div className="flex justify-center items-end h-72 sm:h-96 mb-16 gap-2 sm:gap-4">
                {/* 2nd Place */}
                {second && (
                  <div className="flex flex-col items-center w-28 sm:w-40">
                    <div className="text-3xl mb-2">🥈</div>
                    <TeamLogo team={second.team} size="md" />
                    <div className="bg-[#A9B4BF] w-full rounded-t-lg p-4 text-center h-32 flex flex-col justify-center shadow-lg">
                      <p className="font-bold text-white text-sm sm:text-base leading-tight">{second.team?.name}</p>
                      <p className="text-white/80 text-[10px] sm:text-xs mt-1 uppercase tracking-widest">{second.label}</p>
                    </div>
                  </div>
                )}
                {/* 1st Place */}
                {first && (
                  <div className="flex flex-col items-center w-32 sm:w-48">
                    <div className="text-4xl mb-2">🥇</div>
                    <TeamLogo team={first.team} size="lg" />
                    <div className="bg-[#D9A441] w-full rounded-t-lg p-4 text-center h-44 flex flex-col justify-center shadow-xl">
                      <p className="font-bold text-white text-base sm:text-lg leading-tight">{first.team?.name}</p>
                      <p className="text-white/80 text-[10px] sm:text-xs mt-1 uppercase tracking-widest">{first.label}</p>
                    </div>
                  </div>
                )}
                {/* 3rd Place */}
                {third && (
                  <div className="flex flex-col items-center w-28 sm:w-40">
                    <div className="text-3xl mb-2">🥉</div>
                    <TeamLogo team={third.team} size="sm" />
                    <div className="bg-[#B87333] w-full rounded-t-lg p-4 text-center h-24 flex flex-col justify-center shadow-lg">
                      <p className="font-bold text-white text-sm sm:text-base leading-tight">{third.team?.name}</p>
                      <p className="text-white/80 text-[10px] sm:text-xs mt-1 uppercase tracking-widest">{third.label}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* OTHER AWARDS */}
              {others.length > 0 && (
                <div className="mt-16 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-ink mb-6 text-center border-b border-line pb-2">Special Awards</h2>
                  <div className="space-y-4">
                    {others.map(r => (
                      <div key={r.id} className="card p-4 flex justify-between items-center bg-white border border-line">
                        <div className="flex items-center gap-4">
                          {r.team?.logo ? (
                            <img src={r.team.logo} alt={r.team.name} className="w-12 h-12 object-contain" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center font-bold text-mist">{r.team?.name[0]}</div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-mist uppercase tracking-wider mb-1">{r.label}</p>
                            <p className="font-bold text-ink text-lg">{r.team?.name}</p>
                            {r.awardNote && <p className="text-sm text-mist mt-1 italic">"{r.awardNote}"</p>}
                          </div>
                        </div>
                        <div className="text-3xl">🏆</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-16 text-center">
            <Link href={`/competitions/${competition.slug}`} className="more">← Back to Competition</Link>
          </div>
        </div>
      </section>
    </>
  );
}