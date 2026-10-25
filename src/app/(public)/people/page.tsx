import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";

export const metadata: Metadata = { title: "People Directory" };

export default async function PublicPeoplePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  const people = await prisma.person.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { savdId: { contains: q, mode: "insensitive" } },
      ]
    } : undefined,
    orderBy: { savdId: "asc" }, // 👈 SAVD ID ke hisaab se sort kiya (ya createdAt use kar sakte hain)
    // take: 50, 👈 YEH LINE DELETE KAR DI HAI
  });

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">Community</p>
          <h1>People Directory</h1>
          <p className="sub">Everyone who&apos;s ever been part of SAVD.</p>
        </div>
      </header>
      <MeltEdge seed={44} />

      <section className="pg">
        <div className="wrap">
          <form className="max-w-2xl mx-auto mb-12 flex gap-2">
            <input name="q" defaultValue={q} placeholder="Search by name, email, or SAVD ID..." className="input flex-1" style={{ height: 54, borderRadius: 12 }} />
            <button type="submit" className="btn b1" style={{ height: 54 }}>Search</button>
          </form>

          {/* Total count indicator (Optional but helpful) */}
          <div className="mb-6 text-center text-mist text-sm">
            Showing {people.length} {q ? "results" : "people"}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {people.map(p => (
              <Link key={p.id} href={`/people/${p.savdId}`} className="card p-6 text-center hover:shadow-lg transition-shadow bg-white flex flex-col items-center">
                {p.photo ? <img src={p.photo} className="w-24 h-24 rounded-full object-cover mb-4" /> : <div className="w-24 h-24 rounded-full bg-signal text-white flex items-center justify-center text-3xl font-bold mb-4">{p.name[0]}</div>}
                <h3 className="font-bold text-ink">{p.name}</h3>
                <p className="text-xs font-mono text-signal mt-1">{p.savdId}</p>
                <p className="text-xs text-mist mt-2 line-clamp-1">{p.university || p.department}</p>
              </Link>
            ))}
            {people.length === 0 && <p className="col-span-full text-center text-mist">No people found.</p>}
          </div>
        </div>
      </section>
    </>
  );
}