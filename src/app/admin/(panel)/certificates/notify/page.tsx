import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NotifyForm } from "@/components/admin/NotifyForm";

export default async function NotifyCertificatesPage() {
  await requireAdmin("certificates", "full");

  const certificates = await prisma.certificate.findMany({
    where: { file: { not: null } }, // Only those with images
    include: { person: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/certificates" className="text-mist hover:text-ink text-sm">← Back</Link>
      </div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Send Notifications</h1>
      
      <NotifyForm certificates={certificates} />
    </div>
  );
}