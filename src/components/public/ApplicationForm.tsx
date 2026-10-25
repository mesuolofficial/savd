"use client";

import { useState } from "react";
import { submitApplicationAction } from "@/lib/actions/application.actions";
import { FileUpload } from "./FileUpload"; // <--- IMPORTED

export type ApplicationType = "sponsor" | "partner" | "ambassador";

export function ApplicationForm({ type }: { type: ApplicationType }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    fd.append("type", type);

    const res = await submitApplicationAction(fd);
    if (res.ok) {
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="card" style={{ padding: 60, textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontSize: 32, marginBottom: 16 }}>Application Received!</h2>
        <p style={{ color: "var(--mist)", marginBottom: 32, fontSize: 16 }}>Thank you. We will review your application and get back to you via email soon.</p>
        <button onClick={() => setStatus("idle")} className="btn b1">Submit Another</button>
      </div>
    );
  }

  const Section = ({ num, title, children }: { num: string, title: string, children: React.ReactNode }) => (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-signal)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{num}</div>
        <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );

  const isSponsor = type === "sponsor";
  const isPartner = type === "partner";
  const isAmbassador = type === "ambassador";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", padding: 40, borderRadius: 16, border: "1px solid var(--line)" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8, textTransform: "capitalize" }}>Apply as {type}</h1>
      <p style={{ color: "var(--mist)", marginBottom: 40 }}>Please fill out the details below carefully.</p>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {status === "error" && <div className="text-red-600 text-sm font-bold mb-4">Something went wrong. Please try again.</div>}

        {isPartner && (
          <>
            <Section num="1" title="Society Information">
              <div className="sm:col-span-2"><label className="label">Society Name *</label><input name="name" className="input" required placeholder="Mechanical Engineering Society" /></div>
              <div className="sm:col-span-2"><label className="label">University / Institution Name *</label><input name="institution" className="input" required placeholder="University of Lahore" /></div>
              <div><label className="label">Campus</label><input name="campus" className="input" placeholder="Main Campus" /></div>
              <div><label className="label">City *</label><input name="city" className="input" required placeholder="Lahore" /></div>
              <div><label className="label">Society's Official Email *</label><input name="email" type="email" className="input" required placeholder="society@university.edu" /></div>
              <div><label className="label">Society Instagram / Social Media Link</label><input name="socialMediaUrl" className="input" placeholder="https://instagram.com/yoursociety" /></div>
            </Section>

            <Section num="2" title="Faculty Advisor">
              <div><label className="label">Faculty Advisor Name</label><input name="advisorName" className="input" placeholder="Full name" /></div>
              <div><label className="label">Faculty Advisor Email</label><input name="advisorEmail" type="email" className="input" placeholder="advisor@university.edu" /></div>
              <div><label className="label">Faculty Advisor Contact Number</label><input name="advisorPhone" className="input" placeholder="+92 300 1234567" /></div>
            </Section>

            <Section num="3" title="President / Society Head">
              <div><label className="label">President / Society Head Name *</label><input name="presidentName" className="input" required placeholder="Full name" /></div>
              <div><label className="label">President / Society Head Email *</label><input name="presidentEmail" type="email" className="input" required placeholder="president@email.com" /></div>
              <div><label className="label">President / Contact Number / WhatsApp *</label><input name="presidentPhone" className="input" required placeholder="+92 300 1234567" /></div>
              <div><label className="label">President / Instagram / LinkedIn</label><input name="presidentSocial" className="input" placeholder="Profile link or handle" /></div>
            </Section>

            <Section num="4" title="Community Partner Contact Person">
              <p className="sm:col-span-2 text-mist text-sm mb-2">Please provide the details of the person from your society who will be the main point of contact for SAVD 2026 communication and coordination.</p>
              <div><label className="label">Contact Person Name *</label><input name="contactName" className="input" required placeholder="Full name" /></div>
              <div><label className="label">Designation *</label><input name="contactDesignation" className="input" required placeholder="e.g. General Secretary" /></div>
              <div><label className="label">Contact Person Email *</label><input name="email" type="email" className="input" required placeholder="contact@email.com" /></div>
              <div><label className="label">Contact Person WhatsApp / Phone *</label><input name="phone" className="input" required placeholder="+92 300 1234567" /></div>
            </Section>

            <Section num="5" title="Society Branding">
              <div className="sm:col-span-2">
                <label className="label">Society Logo — With Background *</label>
                <p className="text-mist text-xs mb-2">Upload your official society logo with its original background. High-resolution preferred.</p>
                {/* UPDATED: Using new FileUpload component */}
                <FileUpload name="logoWithBg" accept="image/*" required label="Click to upload logo" hint="PNG, JPG (Max 5MB)" />
              </div>
              <div className="sm:col-span-2 mt-4">
                <label className="label">Society Logo — Transparent / Without Background *</label>
                <p className="text-mist text-xs mb-2">Upload a transparent PNG version of your logo for use on posters and certificates.</p>
                {/* UPDATED: Using new FileUpload component */}
                <FileUpload name="logoTransparent" accept="image/*" required label="Click to upload transparent logo" hint="PNG only (Max 5MB)" />
              </div>
            </Section>

            <Section num="6" title="Additional Information">
              <div className="sm:col-span-2"><label className="label">Branding / Logo Usage Instructions</label><textarea name="additionalInfo" className="input" rows={3} placeholder="Anything specific we should know about your branding?" /></div>
            </Section>

            <Section num="7" title="Confirmation">
              <div className="sm:col-span-2 mb-4">
                <label className="flex gap-2 items-start text-sm">
                  <input type="checkbox" required className="mt-1" />
                  <span>I confirm that the information and branding assets provided in this form are accurate and represent the official information of our society. *</span>
                </label>
              </div>
              <div><label className="label">Submitted By *</label><input name="submittedBy" className="input" required placeholder="Your full name" /></div>
              <div><label className="label">Designation *</label><input name="submittedByDesignation" className="input" required placeholder="e.g. President" /></div>
            </Section>
          </>
        )}

        {isSponsor && (
          <Section num="1" title="Sponsor Information">
            <div className="sm:col-span-2"><label className="label">Company Name *</label><input name="name" className="input" required /></div>
            <div className="sm:col-span-2"><label className="label">Website URL</label><input name="website" className="input" type="url" placeholder="https://" /></div>
            <div><label className="label">Contact Person *</label><input name="contactName" className="input" required /></div>
            <div><label className="label">Contact Email *</label><input name="email" className="input" type="email" required /></div>
            <div><label className="label">Contact Phone *</label><input name="phone" className="input" type="tel" required /></div>
            <div className="sm:col-span-2"><label className="label">Message / Tier Interest</label><textarea name="message" className="input" rows={3} /></div>
          </Section>
        )}

        {isAmbassador && (
          <Section num="1" title="Ambassador Information">
            <div><label className="label">Full Name *</label><input name="name" className="input" required /></div>
            <div><label className="label">University / Institution *</label><input name="institution" className="input" required /></div>
            <div><label className="label">Email Address *</label><input name="email" className="input" type="email" required /></div>
            <div><label className="label">WhatsApp Number *</label><input name="phone" className="input" type="tel" required /></div>
            <div className="sm:col-span-2"><label className="label">Why do you want to be an ambassador?</label><textarea name="message" className="input" rows={3} /></div>
          </Section>
        )}

        <div className="mt-8 pt-6 border-t border-line">
          <button type="submit" className="btn b1" style={{ width: "100%", height: 54, fontSize: 18 }} disabled={status === "sending"}>
            {status === "sending" ? "Submitting..." : `Submit ${type} Application`}
          </button>
        </div>
      </form>
    </div>
  );
}