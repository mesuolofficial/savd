import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin("people", "view");
  const { q } = await searchParams;

  const people = await prisma.person.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { savdId: { contains: q, mode: "insensitive" } },
      ]
    } : undefined,
    orderBy: { createdAt: "desc" },
    include: { teamMemberships: { include: { team: { select: { name: true } } } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">People Directory</h1>
        {/* ADDED THE BUTTON HERE */}
        <Link href="/admin/people/create" className="btn btn-primary">
          + Add Person
        </Link>
      </div>

      <form className="mb-6 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search by name, email, or SAVD ID..." className="input max-w-md" />
        <button type="submit" className="btn btn-primary">Search</button>
        {q && <Link href="/admin/people" className="btn btn-outline-light">Clear</Link>}
      </form>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas border-b border-line">
            <tr>
              <th className="p-4">SAVD ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">University / Dept</th>
              <th className="p-4">Teams</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-mist">No people found.</td></tr>
            ) : people.map((p) => (
              <tr key={p.id} className="border-b border-line/50 hover:bg-canvas/30">
                <td className="p-4 font-mono font-bold text-signal">{p.savdId}</td>
                <td className="p-4">
                  <p className="font-bold text-ink">{p.name}</p>
                  <p className="text-xs text-mist">{p.email}</p>
                </td>
                <td className="p-4">
                  <p>{p.university}</p>
                  <p className="text-xs text-mist">{p.department}</p>
                </td>
                <td className="p-4">
                  {p.teamMemberships.length > 0 ? (
                    <span className="pill bg-success/20 text-success">{p.teamMemberships[0].team.name}</span>
                  ) : (
                    <span className="text-mist italic text-xs">None</span>
                  )}
                </td>
                <td className="p-4">
<Link href={`/admin/people/${p.id}`} className="btn btn-sm btn-outline-light">View Profile</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}