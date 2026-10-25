import type { Metadata } from "next";
import { MeltEdge } from "@/components/public/MeltEdge";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsOfServicePage() {
  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <h1>Terms of Service</h1>
          <p className="sub">Last updated: October 2026</p>
        </div>
      </header>
      <MeltEdge seed={92} />

      <section className="pg">
        <div className="wrap max-w-3xl mx-auto">
          <div className="card p-8 sm:p-12 text-mist leading-relaxed space-y-6">
            <h2 className="text-2xl font-bold text-ink mb-4">1. Acceptance of Terms</h2>
            <p>By registering for the SAVD competition, you agree to abide by these Terms of Service, the official rulebook of the specific edition, and the decisions of the organizing committee.</p>

            <h2 className="text-2xl font-bold text-ink mt-8 mb-4">2. Eligibility</h2>
            <p>Participation is open to undergraduate students from recognized Higher Education Institutions (HEIs) across Pakistan. Proof of enrollment (Student ID) is mandatory.</p>

            <h2 className="text-2xl font-bold text-ink mt-8 mb-4">3. Team Registration</h2>
            <p>Registration is only confirmed once the team is approved by the organizers. Duplicate registrations (same leader email or member CNIC) for the same competition are strictly prohibited and will be disqualified.</p>

            <h2 className="text-2xl font-bold text-ink mt-8 mb-4">4. Code of Conduct</h2>
            <p>All participants must maintain sportsmanship and safety standards. Any violation of safety rules, harassment, or attempt to manipulate competition results will result in immediate disqualification.</p>

            <h2 className="text-2xl font-bold text-ink mt-8 mb-4">5. Intellectual Property</h2>
            <p>Teams retain the intellectual property rights to their vehicle designs. However, by participating, you grant SAVD and MES the right to publish photos, videos, and design descriptions for promotional and archival purposes.</p>

            <h2 className="text-2xl font-bold text-ink mt-8 mb-4">6. Changes to Terms</h2>
            <p>The organizing committee reserves the right to modify these terms or the competition rules at any time. Changes will be communicated via email or the official website.</p>
          </div>
        </div>
      </section>
    </>
  );
}