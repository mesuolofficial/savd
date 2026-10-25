import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";
import { formatDateRange } from "@/lib/format";

export const metadata: Metadata = { title: "Archives" };

export default async function PublicArchivesPage() {
  const archives = await prisma.archive.findMany({
    where: { isPublished: true },
    include: { competition: true },
    orderBy: { competition: { startDate: "desc" } },
  });

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">History</p>
          <h1>Archives</h1>
          <p className="sub">Relive the past editions of SAVD.</p>
        </div>
      </header>
      <MeltEdge seed={88} />

      <section className="pg">
        <div className="wrap">
          {archives.length === 0 ? (
            <div className="card p-12 text-center max-w-lg mx-auto">
              <p className="text-lg font-bold text-ink mb-2">No archives published yet</p>
              <p className="text-mist">Past editions will appear here once they are over.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archives.map((a) => (
                <Link key={a.id} href={`/archives/${a.competition.slug}`} className="card overflow-hidden bg-white hover:shadow-lg transition-shadow group">
                  <div className="h-40 bg-canvas flex items-center justify-center border-b border-line group-hover:bg-[#f0f4f8] transition-colors">
                    <span className="font-display text-5xl font-bold text-line">{new Date(a.competition.startDate).getFullYear()}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-ink">{a.competition.title}</h3>
                    <p className="text-sm text-mist mt-1">{formatDateRange(a.competition.startDate, a.competition.endDate)}</p>
                    <p className="text-sm font-semibold text-signal mt-4">View Archive →</p>
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