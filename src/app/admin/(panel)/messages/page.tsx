import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export default async function MessagesPage() {
  await requireAdmin("messages", "view");
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Messages</h1>
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas border-b border-line">
            <tr>
              <th className="p-4">From</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Received</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-mist">No messages yet.</td></tr>
            ) : messages.map((m) => (
              <tr key={m.id} className={`border-b border-line/50 hover:bg-canvas/30 ${m.status === "UNREAD" ? "font-bold" : ""}`}>
                <td className="p-4">
                  <p className="text-ink">{m.name}</p>
                  <p className="text-xs text-mist font-normal">{m.email}</p>
                </td>
                <td className="p-4 text-ink">{m.subject}</td>
                <td className="p-4 text-mist font-normal">{formatDateTime(m.createdAt)}</td>
                <td className="p-4">
                  <span className={`pill text-xs ${m.status === "UNREAD" ? "bg-danger/20 text-danger" : m.status === "READ" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}`}>
                    {m.status}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/admin/messages/${m.id}`} className="btn btn-sm btn-outline-light">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}