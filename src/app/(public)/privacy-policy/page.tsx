import type { Metadata } from "next";
import { MeltEdge } from "@/components/public/MeltEdge";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <h1>Privacy Policy</h1>
          <p className="sub">Last updated: October 2026</p>
        </div>
      </header>
      <MeltEdge seed={91} />

      <section className="pg">
        <div className="wrap max-w-3xl mx-auto">
          <div className="card p-8 sm:p-12 text-mist leading-relaxed space-y-6">
            <h2 className="text-2xl font-bold text-ink mb-4">1. Information We Collect</h2>
            <p>When you register for a competition, we collect personal information including your name, email address, phone number, CNIC, student ID, and university details. This information is used strictly for managing the competition, verifying eligibility, and communicating with you.</p>
            
            <h2 className="text-2xl font-bold text-ink mt-8 mb-4">2. How We Use Your Data</h2>
            <p>Your data is used to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process your registration and verify your team.</li>
              <li>Send transactional emails (confirmation, approval, certificates).</li>
              <li>Issue and verify official certificates.</li>
              <li>Maintain a public directory of participants, organizers, and judges.</li>
            </ul>

            <h2 className="text-2xl font-bold text-ink mt-8 mb-4">3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share limited information with competition organizers, judges, and security personnel (e.g., for campus entry). Public profiles will only display information you consent to share.</p>

            <h2 className="text-2xl font-bold text-ink mt-8 mb-4">4. Security</h2>
            <p>We implement industry-standard security measures to protect your data. Admin accounts are protected with bcrypt hashing and strict session management.</p>

            <h2 className="text-2xl font-bold text-ink mt-8 mb-4">5. Contact Us</h2>
            <p>If you have any questions about this policy or your data, please contact us at <a href="mailto:mesuolofficial@gmail.com" className="text-signal font-bold">mesuolofficial@gmail.com</a>.</p>
          </div>
        </div>
      </section>
    </>
  );
}