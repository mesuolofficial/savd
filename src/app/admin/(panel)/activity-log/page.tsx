import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export default async function ActivityLogPage() {
  await requireAdmin("activity-log", "view");

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100, // Show latest 100 logs
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Activity Log</h1>
      
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas border-b border-line">
            <tr>
              <th className="p-4">Time</th>
              <th className="p-4">Admin</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-line/50 hover:bg-canvas/30">
                <td className="p-4 text-mist text-xs w-48">{formatDateTime(log.createdAt)}</td>
                <td className="p-4 font-semibold text-ink w-48">{log.adminName}</td>
                <td className="p-4 text-ink">{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}