import type { Metadata } from "next";
import Link from "next/link";
import { MeltEdge } from "@/components/public/MeltEdge";
import { ApplicationForm } from "@/components/public/ApplicationForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Become an Ambassador" };

export default async function AmbassadorApplyPage() {
  const settings = await getSettings();

  if (!settings.ambassadorOpen) {
    return (
      <>
        <header className="ph dk" style={{ padding: "60px 0 40px" }}><div className="wrap"><h1>Applications Closed</h1></div></header>
        <MeltEdge seed={14} />
        <section className="pg" style={{ paddingTop: 40 }}>
          <div className="wrap text-center max-w-lg mx-auto">
            <p className="text-xl mb-4">Ambassador applications are currently closed.</p>
            <p className="text-mist mb-8">Please check back later or contact us directly.</p>
            <Link href="/sponsors" className="btn b1">Back to Ecosystem</Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <header className="ph dk" style={{ padding: "60px 0 40px" }}>
        <div className="wrap">
          <p className="ey">Represent Your Campus</p>
          <h1>Become an Ambassador</h1>
          <p className="sub">Spread the word. You get a referral link and leaderboard status.</p>
        </div>
      </header>
      <MeltEdge seed={14} />
      <section className="pg" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <ApplicationForm type="ambassador" />
          <div style={{ textAlign: "center", marginTop: 24 }}><Link href="/sponsors" className="more">← Back to all partners</Link></div>
        </div>
      </section>
    </>
  );
}