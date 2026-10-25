import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { EditCertificateForm } from "@/components/admin/EditCertificateForm";

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("certificates", "full");
  const { id } = await params;

  const [cert, competitions] = await Promise.all([
    prisma.certificate.findUnique({
      where: { id },
      include: { person: { select: { name: true, savdId: true } } }
    }),
    prisma.competition.findMany({ select: { id: true, title: true }, orderBy: { startDate: "desc" } }),
  ]);

  if (!cert) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/certificates" className="text-mist hover:text-ink text-sm font-semibold">← Back to Certificates</Link>
      </div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Edit Certificate</h1>
      
      <EditCertificateForm cert={cert} competitions={competitions} />
    </div>
  );
}