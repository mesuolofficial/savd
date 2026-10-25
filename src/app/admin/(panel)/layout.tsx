import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { canView, competitionScope, type AdminModule } from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/constants";
import { AdminShell, type ShellNavGroup } from "@/components/admin/AdminShell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const { admin } = session;
  const scope = competitionScope(admin);

  // Fetch avatar directly from DB (kyunke session mein nahi hai)
  const adminRecord = await prisma.admin.findUnique({ where: { id: admin.id }, select: { avatar: true } });

  const [pendingRegs, unreadMsgs, pendingReviews, scoped] = await Promise.all([
    canView(admin, "registrations") ? prisma.registration.count({ where: { status: "PENDING", ...scope } }) : 0,
    canView(admin, "messages") ? prisma.contactMessage.count({ where: { status: "UNREAD" } }) : 0,
    canView(admin, "reviews") ? prisma.review.count({ where: { status: "PENDING", ...scope } }) : 0,
    admin.competitionId ? prisma.competition.findUnique({ where: { id: admin.competitionId }, select: { title: true } }) : null,
  ]);

  const badges: Partial<Record<AdminModule, number>> = {
    registrations: pendingRegs,
    messages: unreadMsgs,
    reviews: pendingReviews,
  };

  const groups: ShellNavGroup[] = ADMIN_NAV.map((g) => ({
    label: g.label,
    items: g.items
      .filter((i) => canView(admin, i.module))
      .map((i) => ({ label: i.label, href: i.href, icon: i.icon, badge: badges[i.module] || undefined })),
  })).filter((g) => g.items.length > 0);

  return (
    <AdminShell 
      groups={groups} 
      user={{ name: admin.name, roleLabel: ROLE_LABELS[admin.role], avatar: adminRecord?.avatar }} 
      scopeLabel={scoped?.title ?? null}
    >
      {children}
    </AdminShell>
  );
}