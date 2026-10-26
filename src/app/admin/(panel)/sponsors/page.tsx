import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Notice } from "@/components/admin/Notice";
import { SubmitButton } from "@/components/SubmitButton";
import { addSponsorAction, updateSponsorAction, deleteSponsorAction } from "@/lib/actions/reference.actions";

export default async function SponsorsAdminPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin("sponsors", "full");
  const { msg } = await searchParams;
  const sponsors = await prisma.sponsor.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Sponsors, Organizers & Partners</h1>
      {msg === "saved" && <Notice kind="ok">Saved successfully.</Notice>}
      {msg === "invalid" && <Notice kind="error">Please check fields.</Notice>}

      {/* Add Form */}
      <form action={addSponsorAction} className="card p-4 mb-8 grid gap-4 items-end grid-cols-1 md:grid-cols-[1fr_150px_1fr_100px_1fr_auto]">
        <div><label className="label">Name</label><input name="name" className="input" required /></div>
        <div>
          <label className="label">Tier</label>
          <select name="tier" className="input">
            <option value="SPONSOR">Sponsor</option>
            <option value="ORGANIZER">Organizer</option>
            <option value="PARTNER">Partner</option>
            <option value="COLLABORATOR">Collaborator</option>
          </select>
        </div>
        <div><label className="label">Website</label><input name="websiteUrl" className="input" placeholder="https://" /></div>
        <div><label className="label">Order</label><input name="sortOrder" type="number" className="input" defaultValue="0" /></div>
        <div><label className="label">Logo</label><input type="file" name="logo" accept="image/*" className="input" style={{ paddingTop: 8 }} /></div>
        <SubmitButton pendingLabel="Adding…" className="btn btn-primary">Add</SubmitButton>
      </form>

      {/* List */}
      <div className="grid gap-4">
        {sponsors.map((sp) => (
          <form key={sp.id} action={updateSponsorAction} className="card p-4 grid gap-4 items-end grid-cols-1 md:grid-cols-[1fr_150px_1fr_100px_1fr_auto_auto] bg-white">
            <input type="hidden" name="id" value={sp.id} />
            <div><input name="name" className="input" defaultValue={sp.name} required /></div>
            <div>
              <select name="tier" className="input" defaultValue={sp.tier}>
                <option value="SPONSOR">Sponsor</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="PARTNER">Partner</option>
                <option value="COLLABORATOR">Collaborator</option>
              </select>
            </div>
            <div><input name="websiteUrl" className="input" defaultValue={sp.websiteUrl || ""} /></div>
            <div><input name="sortOrder" type="number" className="input" defaultValue={sp.sortOrder} /></div>
            <div>
              <input type="file" name="logo" accept="image/*" className="input" style={{ paddingTop: 8 }} />
              {sp.logo && <span className="text-xs text-success mt-1 block">Logo exists</span>}
            </div>
            <SubmitButton name="intent" value="save" pendingLabel="Saving…" className="btn btn-outline-light">Save</SubmitButton>
            <SubmitButton name="intent" value="delete" formAction={deleteSponsorAction} pendingLabel="Deleting…" confirmMessage={`Delete ${sp.name}? This cannot be undone.`} className="btn text-danger hover:bg-danger/10">Delete</SubmitButton>
          </form>
        ))}
      </div>
    </div>
  );
}