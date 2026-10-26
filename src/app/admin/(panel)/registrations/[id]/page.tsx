import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { updateRegistrationStatusAction, convertToTeamAction } from "@/lib/actions/registration.actions";
import { DeleteRegistrationButton } from "@/components/admin/DeleteRegistrationButton";

export default async function RegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("registrations", "full");
  const { id } = await params;

  let reg = null;
  try {
    reg = await prisma.registration.findUnique({
      where: { id },
      include: {
        competition: true,
        members: true,
        partner: true,
        team: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch registration:", error);
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Database Error</h2>
        <p>Could not load the registration details. The database might be waking up or experiencing connection issues. Please try reloading.</p>
        <Link href="/admin/registrations" className="text-red-900 underline mt-4 block">← Back to registrations</Link>
      </div>
    );
  }

  if (!reg) notFound();

  // Safe Fallbacks taake agar relation delete ho jaye toh page crash na ho
  const competitionTitle = reg.competition?.title || "Unknown Competition";
  const partnerName = reg.partner?.name || "Direct (No referral)";
  const partnerCode = reg.partner?.referralCode ? `(${reg.partner.referralCode})` : "";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/admin/registrations" className="text-mist hover:text-ink text-sm">← Back to registrations</Link>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">{reg.teamName || "Unnamed Team"}</h1>
          <p className="text-mist">{competitionTitle}</p>
        </div>
        <span className={`pill text-sm px-4 py-2 ${reg.status === "APPROVED" ? "bg-success/20 text-success" : reg.status === "PENDING" ? "bg-warning/20 text-warning" : "bg-danger/20 text-danger"}`}>
          {reg.status}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold border-b border-line pb-2 mb-4">Team Leader</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-mist text-xs">Name</p><p className="font-semibold">{reg.leaderName || "-"}</p></div>
              <div><p className="text-mist text-xs">Email</p><p className="font-semibold">{reg.leaderEmail || "-"}</p></div>
              <div><p className="text-mist text-xs">WhatsApp</p><p className="font-semibold">{reg.leaderWhatsapp || "-"}</p></div>
              <div><p className="text-mist text-xs">CNIC</p><p className="font-semibold">{reg.leaderCnic || "-"}</p></div>
              <div><p className="text-mist text-xs">Student ID</p><p className="font-semibold">{reg.leaderSapId || "-"}</p></div>
              <div><p className="text-mist text-xs">Department</p><p className="font-semibold">{reg.leaderDepartment || "-"}</p></div>
              <div><p className="text-mist text-xs">University</p><p className="font-semibold">{reg.leaderUniversity || "-"}</p></div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold border-b border-line pb-2 mb-4">Team Members ({reg.members?.length || 0})</h2>
            {(!reg.members || reg.members.length === 0) ? <p className="text-sm text-mist">No additional members.</p> : (
              <div className="space-y-4">
                {reg.members.map((m) => (
                  <div key={m.id} className="grid grid-cols-2 gap-4 text-sm border-b border-line/50 pb-3 last:border-0 last:pb-0">
                    <div><p className="text-mist text-xs">Name</p><p className="font-semibold">{m.name || "-"}</p></div>
                    <div><p className="text-mist text-xs">Email</p><p className="font-semibold">{m.email || "-"}</p></div>
                    <div><p className="text-mist text-xs">Phone</p><p className="font-semibold">{m.phone || "-"}</p></div>
                    <div><p className="text-mist text-xs">CNIC</p><p className="font-semibold">{m.cnic || "-"}</p></div>
                    <div><p className="text-mist text-xs">Student ID</p><p className="font-semibold">{m.sapId || "-"}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-canvas">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mist mb-4">Actions</h2>
            <div className="grid gap-2">
              {/* 👈 WRAPPED ACTIONS */}
              <form action={async () => { "use server"; await updateRegistrationStatusAction(reg.id, "APPROVED"); }}>
                <button type="submit" className="btn btn-primary w-full bg-success hover:bg-success/90" disabled={reg.status === "APPROVED"}>Approve Team</button>
              </form>
              <form action={async () => { "use server"; await updateRegistrationStatusAction(reg.id, "REJECTED"); }}>
                <button type="submit" className="btn btn-outline-light w-full border-danger text-danger hover:bg-danger/10" disabled={reg.status === "REJECTED"}>Reject Team</button>
              </form>
              <form action={async () => { "use server"; await updateRegistrationStatusAction(reg.id, "WITHDRAWN"); }}>
                <button type="submit" className="btn btn-outline-light w-full" disabled={reg.status === "WITHDRAWN"}>Mark Withdrawn</button>
              </form>

              {/* NEW: Convert to Team Button */}
              {reg.status === "APPROVED" && !reg.team && (
                <form action={async () => { "use server"; await convertToTeamAction(reg.id); }} className="mt-4 border-t border-line pt-4">
                  <button type="submit" className="btn btn-primary w-full bg-[#226192] hover:bg-[#1a4b72]">Generate SAVD IDs & Convert to Team</button>
                  <p className="text-xs text-mist mt-2 text-center">This will create the official team and generate SAVD profiles.</p>
                </form>
              )}

              {reg.team && (
                <div className="mt-4 border-t border-line pt-4 text-center">
                  <p className="text-sm font-semibold text-success mb-2">✓ Team Profile Created</p>
                  <Link href={`/admin/teams/${reg.team.id}`} className="btn btn-outline-light w-full">Manage Team</Link>
                </div>
              )}

              {/* Delete (no emails are sent) */}
              <div className="mt-4 border-t border-line pt-4">
                {reg.team ? (
                  <p className="text-xs text-mist text-center">
                    To delete this registration, delete its team profile first.
                  </p>
                ) : (
                  <DeleteRegistrationButton regId={reg.id} teamName={reg.teamName || "this team"} />
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mist mb-4">Source</h2>
            <div className="text-sm">
              <p className="text-mist text-xs mb-1">Referred By</p>
              <p className="font-semibold text-signal">{partnerName} {partnerCode}</p>
            </div>
            <div className="text-sm mt-4">
              <p className="text-mist text-xs mb-1">Submitted On</p>
              <p className="font-semibold">{formatDateTime(reg.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}