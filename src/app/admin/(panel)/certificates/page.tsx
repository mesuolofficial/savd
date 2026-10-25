import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export default async function CertificatesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin("certificates", "view");
  const { q } = await searchParams;

  const certificates = await prisma.certificate.findMany({
    where: q ? {
      OR: [
        { serial: { contains: q, mode: "insensitive" } },
        { person: { name: { contains: q, mode: "insensitive" } } },
        { person: { savdId: { contains: q, mode: "insensitive" } } },
      ]
    } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50, // Limit admin to 50 to prevent crash
    include: {
      person: { select: { name: true, savdId: true } },
      competition: { select: { title: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">Certificates</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/certificates/notify" className="btn btn-outline-light">Send Notifications</Link>
          <Link href="/admin/certificates/bulk-add" className="btn btn-outline-light">Bulk Add</Link>
          <Link href="/admin/certificates/create" className="btn btn-primary">+ Single Add</Link>
        </div>
      </div>

      <form className="mb-6 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search by Name, SAVD ID, or Serial..." className="input max-w-md" />
        <button type="submit" className="btn btn-primary">Search</button>
        {q && <Link href="/admin/certificates" className="btn btn-outline-light">Clear</Link>}
      </form>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas border-b border-line">
            <tr>
              <th className="p-4">Thumb</th>
              <th className="p-4">Serial</th>
              <th className="p-4">Person (SAVD ID)</th>
              <th className="p-4">Title / Competition</th>
              <th className="p-4">Issue Date</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-mist">No certificates found.</td></tr>
            ) : certificates.map((c) => (
              <tr key={c.id} className="border-b border-line/50 hover:bg-canvas/30">
                <td className="p-4">
                  {c.thumb || c.file ? (
                    <img src={c.thumb || c.file || ""} alt="cert" className="w-12 h-8 object-cover rounded border border-line" />
                  ) : (
                    <span className="text-xs text-mist bg-canvas px-2 py-1 rounded">No img</span>
                  )}
                </td>
                <td className="p-4 font-mono font-bold text-signal">{c.serial}</td>
                <td className="p-4">
                  <p className="font-bold text-ink">{c.person.name}</p>
                  <p className="text-xs text-mist font-mono">{c.person.savdId}</p>
                </td>
                <td className="p-4">
                  <p>{c.title}</p>
                  <p className="text-xs text-mist">{c.competition?.title || "General"}</p>
                </td>
                <td className="p-4 text-mist">{c.issueDate ? formatDate(c.issueDate) : "-"}</td>
                <td className="p-4">
                  <Link href={`/admin/certificates/${c.id}/edit`} className="btn btn-sm btn-outline-light">
                    Edit / Replace
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}