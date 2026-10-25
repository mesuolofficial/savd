import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";

export default async function PublicPersonProfilePage({ params }: { params: Promise<{ savdId: string }> }) {
  const { savdId } = await params;

  const person = await prisma.person.findUnique({
    where: { savdId },
    include: {
      archiveRoles: { include: { archive: { include: { competition: true } } } },
      teamMemberships: { include: { team: { include: { competition: true } } } },
      certificates: true,
    },
  });

  if (!person) notFound();

  return (
    <>
      <header className="ph dk" style={{ paddingBottom: 60 }}>
        <div className="wrap text-center">
          {person.photo ? <img src={person.photo} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-[#ef8557]" /> : <div className="w-32 h-32 rounded-full bg-signal text-white flex items-center justify-center text-5xl font-bold mx-auto mb-4 border-4 border-[#ef8557]">{person.name[0]}</div>}
          <h1>{person.name}</h1>
          <p className="font-mono text-glow font-bold text-lg">{person.savdId}</p>
        </div>
      </header>
      <MeltEdge seed={55} />

      <section className="pg">
        <div className="wrap max-w-4xl mx-auto grid gap-8 md:grid-cols-[1fr_300px]">
          
          <main className="space-y-8">
            {person.bio && (
              <div className="card p-6">
                <h2 className="text-xl font-bold border-b border-line pb-2 mb-4">Biography</h2>
                <p className="text-mist text-sm leading-relaxed whitespace-pre-wrap">{person.bio}</p>
              </div>
            )}

            <div className="card p-6">
              <h2 className="text-xl font-bold border-b border-line pb-2 mb-4">Roles & Participation</h2>
              <div className="space-y-4">
                {person.archiveRoles.map(r => (
                  <div key={r.id} className="flex justify-between items-center border-b border-line/50 pb-2 last:border-0">
                    <div>
                      <p className="font-bold text-ink">{r.role.replace("_", " ")}</p>
                      <p className="text-xs text-mist">{r.archive.competition.title}</p>
                    </div>
                    <Link href={`/archives/${r.archive.competition.slug}`} className="text-xs font-bold text-signal">View Event →</Link>
                  </div>
                ))}
                {person.teamMemberships.map(tm => (
                  <div key={tm.id} className="flex justify-between items-center border-b border-line/50 pb-2 last:border-0">
                    <div>
                      <p className="font-bold text-ink">{tm.role} - {tm.team.name}</p>
                      <p className="text-xs text-mist">{tm.team.competition.title}</p>
                    </div>
                    {/* 👈 YAHAN UPDATE KIYA HAI: tm.team.id -> tm.team.slug */}
                    <Link href={`/teams/${tm.team.slug}`} className="text-xs font-bold text-signal">View Team →</Link>
                  </div>
                ))}
                {person.archiveRoles.length === 0 && person.teamMemberships.length === 0 && <p className="text-sm text-mist">No roles recorded yet.</p>}
              </div>
            </div>
          </main>

          <aside className="space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-mist mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div><p className="text-xs text-mist">Email</p><p className="font-semibold text-ink break-all">{person.email || "-"}</p></div>
                <div><p className="text-xs text-mist">University</p><p className="font-semibold text-ink">{person.university || "-"}</p></div>
                <div><p className="text-xs text-mist">Department</p><p className="font-semibold text-ink">{person.department || "-"}</p></div>
                <div><p className="text-xs text-mist">Student ID</p><p className="font-semibold text-ink">{person.studentId || "-"}</p></div>
                <div><p className="text-xs text-mist">Member Since</p><p className="font-semibold text-ink">{person.memberSince || "-"}</p></div>
              </div>
            </div>

            {person.certificates.length > 0 && (
              <div className="card p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-mist mb-4">Certificates</h3>
                <div className="grid grid-cols-2 gap-2">
                  {person.certificates.map(c => (
                    <a key={c.id} href={c.file || "#"} target="_blank" className="block border border-line rounded overflow-hidden hover:shadow-md transition-shadow">
                      {c.thumb ? <img src={c.thumb} className="w-full h-16 object-cover" /> : <div className="w-full h-16 bg-canvas flex items-center justify-center text-xs text-mist">No Img</div>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}