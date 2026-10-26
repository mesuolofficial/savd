import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Notice } from "@/components/admin/Notice";
import { updateApplicationStatusAction } from "@/lib/actions/application.actions";
import { CopyLinkInput } from "@/components/admin/CopyLinkInput";
import { SubmitButton } from "@/components/SubmitButton";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin("sponsors", "full");
  const { msg } = await searchParams;

  const [partners, sponsors, activeComp] = await Promise.all([
    prisma.partner.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.sponsor.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.competition.findFirst({ where: { isPublished: true }, orderBy: { startDate: "asc" } }),
  ]);

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const compSlug = activeComp?.slug || "your-competition";
  const baseRefUrl = `${siteUrl}/competitions/${compSlug}/register?ref=`;

  const pendingPartners = partners.filter(p => p.status === "PENDING");
  const approvedPartners = partners.filter(p => p.status === "APPROVED");
  const pendingSponsors = sponsors.filter(s => s.status === "PENDING");
  const approvedSponsors = sponsors.filter(s => s.status === "APPROVED");

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Applications</h1>
      {msg === "updated" && <Notice kind="ok">Status updated successfully.</Notice>}

      {/* PENDING SECTION */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 border-b border-line pb-2">Pending Approvals</h2>
        
        <div className="grid gap-8">
          {/* Pending Sponsors */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 bg-canvas border-b border-line">
              <h3 className="text-lg font-bold">Sponsor Applications ({pendingSponsors.length})</h3>
            </div>
            {pendingSponsors.length === 0 ? <p className="p-4 text-sm text-mist">No pending sponsor applications.</p> : (
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas/50 border-b border-line">
                  <tr><th className="p-3">Company</th><th className="p-3">Contact</th><th className="p-3">Message</th><th className="p-3">Action</th></tr>
                </thead>
                <tbody>
                  {pendingSponsors.map(s => (
                    <tr key={s.id} className="border-b border-line/50">
                      <td className="p-3 font-semibold">{s.name}<br/><a href={s.websiteUrl || "#"} className="text-xs text-signal font-normal">{s.websiteUrl}</a></td>
                      <td className="p-3">{s.contactName}<br/><span className="text-mist text-xs">{s.contactEmail}</span></td>
                      <td className="p-3 text-mist text-xs max-w-xs truncate">{s.message}</td>
                      <td className="p-3">
                        <form action={updateApplicationStatusAction} className="flex gap-2">
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="type" value="sponsor" />
                          <SubmitButton name="status" value="APPROVED" pendingLabel="Approving…" className="btn btn-sm bg-success/20 text-success">Approve</SubmitButton>
                          <SubmitButton name="status" value="REJECTED" pendingLabel="Rejecting…" className="btn btn-sm bg-danger/20 text-danger" confirmMessage="Reject this application?">Reject</SubmitButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pending Partners & Ambassadors */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 bg-canvas border-b border-line">
              <h3 className="text-lg font-bold">Partner & Ambassador Applications ({pendingPartners.length})</h3>
            </div>
            {pendingPartners.length === 0 ? <p className="p-4 text-sm text-mist">No pending partner applications.</p> : (
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas/50 border-b border-line">
                  <tr><th className="p-3">Name / Inst.</th><th className="p-3">Type</th><th className="p-3">Contact</th><th className="p-3">Referral Code</th><th className="p-3">Action</th></tr>
                </thead>
                <tbody>
                  {pendingPartners.map(p => (
                    <tr key={p.id} className="border-b border-line/50">
                      <td className="p-3 font-semibold">{p.name}<br/><span className="text-xs text-mist font-normal">{p.institution}</span></td>
                      <td className="p-3"><span className="pill">{p.type}</span></td>
                      <td className="p-3">{p.contactName}<br/><span className="text-mist text-xs">{p.contactEmail}</span></td>
                      <td className="p-3 font-mono text-signal">{p.referralCode}</td>
                      <td className="p-3">
                        <form action={updateApplicationStatusAction} className="flex gap-2">
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="type" value="partner" />
                          <SubmitButton name="status" value="APPROVED" pendingLabel="Approving…" className="btn btn-sm bg-success/20 text-success">Approve</SubmitButton>
                          <SubmitButton name="status" value="REJECTED" pendingLabel="Rejecting…" className="btn btn-sm bg-danger/20 text-danger" confirmMessage="Reject this application?">Reject</SubmitButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* APPROVED SECTION */}
      <div>
        <h2 className="text-2xl font-bold mb-4 border-b border-line pb-2">Approved Applications</h2>
        
        <div className="grid gap-8">
          {/* Approved Sponsors */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 bg-canvas border-b border-line">
              <h3 className="text-lg font-bold">Approved Sponsors ({approvedSponsors.length})</h3>
            </div>
            {approvedSponsors.length === 0 ? <p className="p-4 text-sm text-mist">No approved sponsors yet.</p> : (
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas/50 border-b border-line">
                  <tr><th className="p-3">Company</th><th className="p-3">Contact</th><th className="p-3">Website</th></tr>
                </thead>
                <tbody>
                  {approvedSponsors.map(s => (
                    <tr key={s.id} className="border-b border-line/50">
                      <td className="p-3 font-semibold">{s.name}</td>
                      <td className="p-3">{s.contactName}<br/><span className="text-mist text-xs">{s.contactEmail}</span></td>
                      <td className="p-3"><a href={s.websiteUrl || "#"} target="_blank" className="text-signal hover:underline">{s.websiteUrl}</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Approved Partners & Ambassadors */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 bg-canvas border-b border-line">
              <h3 className="text-lg font-bold">Approved Partners & Ambassadors ({approvedPartners.length})</h3>
            </div>
            {approvedPartners.length === 0 ? <p className="p-4 text-sm text-mist">No approved partners yet.</p> : (
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas/50 border-b border-line">
                  <tr><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Referral Code</th><th className="p-3">Referral Link (Copy & Share)</th></tr>
                </thead>
                <tbody>
                  {approvedPartners.map(p => (
                    <tr key={p.id} className="border-b border-line/50">
                      <td className="p-3 font-semibold">{p.name}<br/><span className="text-xs text-mist font-normal">{p.institution}</span></td>
                      <td className="p-3"><span className="pill">{p.type}</span></td>
                      <td className="p-3 font-mono text-signal font-bold">{p.referralCode}</td>
                      <td className="p-3">
                        {/* USING THE NEW CLIENT COMPONENT */}
                        <CopyLinkInput value={`${baseRefUrl}${p.referralCode}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}