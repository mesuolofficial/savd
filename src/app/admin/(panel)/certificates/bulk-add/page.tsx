import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { BulkAddForm } from "@/components/admin/BulkAddForm";

export default async function BulkAddCertificatesPage() {
  await requireAdmin("certificates", "full");
  
  // Fetch competitions for the dropdown
  const competitions = await prisma.competition.findMany({
    select: { id: true, title: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/certificates" className="text-mist hover:text-ink text-sm">← Back to Certificates</Link>
      </div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Bulk Add Certificates</h1>
      
      <BulkAddForm competitions={competitions} />
    </div>
  );
}