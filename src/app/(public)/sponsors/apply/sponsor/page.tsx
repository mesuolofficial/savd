import type { Metadata } from "next";
import Link from "next/link";
import { MeltEdge } from "@/components/public/MeltEdge";
import { ApplicationForm } from "@/components/public/ApplicationForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Become a Sponsor" };

export default async function SponsorApplyPage() {
  const settings = await getSettings();

  if (!settings.sponsorOpen) {
    return (
      <>
        <header className="ph dk" style={{ padding: "60px 0 40px" }}><div className="wrap"><h1>Applications Closed</h1></div></header>
        <MeltEdge seed={12} />
        <section className="pg" style={{ paddingTop: 40 }}>
          <div className="wrap text-center max-w-lg mx-auto">
            <p className="text-xl mb-4">Sponsor applications are currently closed.</p>
            <p className="text-mist mb-8">Please check back later or contact us directly.</p>
            <Link href="/sponsors" className="btn b1">Back to Sponsors</Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <header className="ph dk" style={{ padding: "60px 0 40px" }}>
        <div className="wrap">
          <p className="ey">Support Innovation</p>
          <h1>Become a Sponsor</h1>
          <p className="sub">Partner with us to reach Pakistan&apos;s brightest engineering talent.</p>
        </div>
      </header>
      <MeltEdge seed={12} />
      <section className="pg" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <ApplicationForm type="sponsor" />
          <div style={{ textAlign: "center", marginTop: 24 }}><Link href="/sponsors" className="more">← Back to all partners</Link></div>
        </div>
      </section>
    </>
  );
}