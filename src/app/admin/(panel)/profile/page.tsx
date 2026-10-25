import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/admin/ProfileForm";

export default async function AdminProfilePage() {
  const session = await requireAdmin("dashboard", "view"); 
  const admin = await prisma.admin.findUnique({ where: { id: session.id } });

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">My Profile</h1>
      <ProfileForm admin={admin} />
    </div>
  );
}