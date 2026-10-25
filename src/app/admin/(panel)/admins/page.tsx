import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/constants";

export default async function AdminsPage() {
  await requireAdmin("admins", "full");

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">Admin Accounts</h1>
        <Link href="/admin/admins/create" className="btn btn-primary">+ New Admin</Link>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas border-b border-line">
            <tr>
              <th className="p-4">Admin</th>
              <th className="p-4">Role & Scope</th>
              <th className="p-4">Status</th>
              <th className="p-4">Last Login</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-line/50 hover:bg-canvas/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {a.avatar ? (
                      <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full object-cover border border-line" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-abyss text-white flex items-center justify-center text-xs font-bold">
                        {a.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-ink">{a.name}</p>
                      <p className="text-xs text-mist">{a.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="pill bg-signal/10 text-signal">{ROLE_LABELS[a.role]}</span>
                </td>
                <td className="p-4">
                  <span className={`pill ${a.isActive ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>
                    {a.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="p-4 text-mist">{a.lastLoginAt ? formatDateTime(a.lastLoginAt) : "Never"}</td>
                <td className="p-4">
                  <Link href={`/admin/admins/${a.id}/edit`} className="btn btn-sm btn-outline-light">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}