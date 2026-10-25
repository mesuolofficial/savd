import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { updateMessageStatusAction, deleteMessageAction } from "@/lib/actions/message.actions";
import { AutoMarkRead } from "@/components/admin/AutoMarkRead"; // <--- IMPORTED

export default async function ViewMessagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("messages", "full");
  const { id } = await params;
  const msg = await prisma.contactMessage.findUnique({ where: { id } });

  if (!msg) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/messages" className="text-mist hover:text-ink text-sm">← Back to Messages</Link>
      </div>
      
      <div className="card p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6 border-b border-line pb-4">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-1">{msg.subject}</h1>
            <p className="text-sm text-mist">From: <strong className="text-ink">{msg.name}</strong> &lt;{msg.email}&gt;</p>
            <p className="text-xs text-mist mt-1">{formatDateTime(msg.createdAt)}</p>
          </div>
          <span className={`pill text-xs ${msg.status === "REPLIED" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{msg.status}</span>
        </div>

        <div className="prose max-w-none text-ink leading-relaxed mb-8">
          <p className="whitespace-pre-wrap">{msg.message}</p>
        </div>

        {msg.imageFile && (
          <div className="mb-8">
            <p className="text-sm font-bold text-mist mb-2">Attachment:</p>
            <img src={msg.imageFile} alt="Attachment" className="max-h-64 rounded-lg border border-line" />
          </div>
        )}

        <div className="flex gap-3 border-t border-line pt-6">
          <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="btn btn-primary">
            Reply via Email
          </a>
          
          {msg.status !== "REPLIED" && (
            <form action={updateMessageStatusAction.bind(null, msg.id, "REPLIED")}>
              <button type="submit" className="btn btn-outline-light">Mark as Replied</button>
            </form>
          )}
          
          <form action={deleteMessageAction.bind(null, msg.id)} className="ml-auto">
            <button type="submit" className="btn text-danger hover:bg-danger/10">Delete Message</button>
          </form>
        </div>
      </div>

      {/* INVISIBLE COMPONENT TO AUTO-MARK AS READ */}
      {msg.status === "UNREAD" && <AutoMarkRead id={msg.id} />}
    </div>
  );
}