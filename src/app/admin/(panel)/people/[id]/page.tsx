import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PersonForm } from "@/components/admin/PersonForm";
import { updatePersonAction } from "@/lib/actions/person.actions";
import { formatDate } from "@/lib/format";

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("people", "full");
  const { id } = await params;

  const person = await prisma.person.findUnique({
    where: { id },
    include: { 
      teamMemberships: { include: { team: { select: { name: true, competition: { select: { title: true } } } } } },
      certificates: true,
    },
  });

  if (!person) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/people" className="text-mist hover:text-ink text-sm">← Back to Directory</Link>
      </div>
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">{person.name}</h1>
          <p className="font-mono text-signal font-bold mt-1">{person.savdId}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div>
          <h2 className="text-lg font-bold mb-4">Edit Details</h2>
          <PersonForm action={updatePersonAction.bind(null, person.id)} initialValues={person} />
        </div>

        <aside className="space-y-6">
          <div className="card p-6 bg-canvas">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mist mb-4">Team History</h2>
            {person.teamMemberships.length === 0 ? (
              <p className="text-sm text-mist">Not part of any team yet.</p>
            ) : (
              <div className="space-y-3">
                {person.teamMemberships.map((tm) => (
                  <div key={tm.id} className="bg-white p-3 rounded border border-line">
                    <p className="font-bold text-sm text-ink">{tm.team.name}</p>
                    <p className="text-xs text-mist">{tm.team.competition.title} · {tm.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mist mb-4">Certificates</h2>
            <p className="text-sm font-semibold">{person.certificates.length} issued</p>
          </div>
        </aside>
      </div>
    </div>
  );
}