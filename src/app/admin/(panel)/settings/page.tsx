import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { Notice } from "@/components/admin/Notice";
import { saveSettingsAction } from "@/lib/actions/reference.actions";

export const metadata: Metadata = { title: "Settings" };

function Text({ label, name, value, placeholder }: { label: string; name: string; value: string | null; placeholder?: string }) {
  return <div><label htmlFor={name} className="label">{label}</label><input id={name} name={name} className="input" defaultValue={value ?? ""} placeholder={placeholder} /></div>;
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin("settings", "full");
  const { msg } = await searchParams;
  const s = await getSettings();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">Settings</h1>
      <p className="mb-6 mt-1 text-sm text-mist">Site-wide switches and contact details.</p>
      {msg === "saved" ? <Notice kind="ok">Settings saved.</Notice> : null}
      {msg === "email" ? <Notice kind="error">Enter a valid admin email address.</Notice> : null}

      <form action={saveSettingsAction} className="grid max-w-3xl gap-5">
        <section className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="font-display text-xl font-bold uppercase text-ink sm:col-span-2">General</h2>
          <Text label="Site title" name="siteTitle" value={s.siteTitle} />
          <Text label="Admin email" name="adminEmail" value={s.adminEmail} />
          <Text label="Contact phone" name="contactPhone" value={s.contactPhone} />
          <Text label="Address" name="contactAddress" value={s.contactAddress} />
        </section>

        <section className="card grid gap-4 p-5 sm:grid-cols-3">
          <h2 className="font-display text-xl font-bold uppercase text-ink sm:col-span-3">Social links</h2>
          <Text label="Facebook" name="facebookUrl" value={s.facebookUrl} placeholder="https://" />
          <Text label="Instagram" name="instagramUrl" value={s.instagramUrl} placeholder="https://" />
          <Text label="Twitter / X" name="twitterUrl" value={s.twitterUrl} placeholder="https://" />
        </section>

        <section className="card grid gap-4 p-5">
          <h2 className="font-display text-xl font-bold uppercase text-ink">Operations</h2>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="maintenanceMode" defaultChecked={s.maintenanceMode} className="mt-1 size-4" />
            <span><strong>Maintenance mode.</strong> Visitors see a &ldquo;We&apos;ll be right back&rdquo; page. Signed-in admins still see the real site.</span></label>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="globalRegistrationOpen" defaultChecked={s.globalRegistrationOpen} className="mt-1 size-4" />
            <span><strong>Registration allowed site-wide.</strong> Untick to close registration on every competition at once.</span></label>
        </section>

        {/* NEW FORM TOGGLES SECTION */}
        <section className="card grid gap-4 p-5">
          <h2 className="font-display text-xl font-bold uppercase text-ink">Application Forms</h2>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="sponsorOpen" defaultChecked={s.sponsorOpen} className="mt-1 size-4" />
            <span><strong>Sponsor Application Form Open</strong></span></label>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="partnerOpen" defaultChecked={s.partnerOpen} className="mt-1 size-4" />
            <span><strong>Partner Application Form Open</strong></span></label>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="ambassadorOpen" defaultChecked={s.ambassadorOpen} className="mt-1 size-4" />
            <span><strong>Ambassador Application Form Open</strong></span></label>
        </section>

        <div><button type="submit" className="btn btn-primary">Save settings</button></div>
      </form>
    </div>
  );
}