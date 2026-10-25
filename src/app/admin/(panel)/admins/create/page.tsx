import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAdminAction } from "@/lib/actions/admin.actions";
import { AdminForm } from "@/components/admin/AdminForm";

export default async function CreateAdminPage() {
  await requireAdmin("admins", "full");
  
  const competitions = await prisma.competition.findMany({
    select: { id: true, title: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/admins" className="text-mist hover:text-ink text-sm">← Back to Admins</Link>
      </div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Create New Admin</h1>
      <AdminForm action={createAdminAction} competitions={competitions} />
    </div>
  );
}