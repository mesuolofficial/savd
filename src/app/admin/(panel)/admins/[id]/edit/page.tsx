import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updateAdminAction } from "@/lib/actions/admin.actions";
import { AdminForm } from "@/components/admin/AdminForm";

export default async function EditAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("admins", "full");
  const { id } = await params;

  const [admin, competitions] = await Promise.all([
    prisma.admin.findUnique({ where: { id } }),
    prisma.competition.findMany({ select: { id: true, title: true }, orderBy: { startDate: "desc" } }),
  ]);

  if (!admin) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/admins" className="text-mist hover:text-ink text-sm">← Back to Admins</Link>
      </div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Edit Admin</h1>
      <AdminForm action={updateAdminAction.bind(null, admin.id)} competitions={competitions} initialData={admin} />
    </div>
  );
}