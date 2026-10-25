"use client";

import { useState } from "react";
import { submitApplicationAction } from "@/lib/actions/application.actions";

export function SponsorsForm() {
  const [activeTab, setActiveTab] = useState<"sponsor" | "partner" | "ambassador">("sponsor");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    fd.append("type", activeTab);
    
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
      <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", padding: 40, textAlign: "center", borderRadius: 16 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 28, marginBottom: 12 }}>Application Received!</h2>
        <p style={{ color: "var(--mist)" }}>Thank you. We will review your application and get back to you via email soon.</p>
        <button onClick={() => setStatus("idle")} className="btn b1" style={{ marginTop: 24 }}>Submit Another</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)" }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--line)" }}>
        <button type="button" onClick={() => setActiveTab("sponsor")} style={{ flex: 1, padding: "16px", fontWeight: 700, background: activeTab === "sponsor" ? "var(--color-signal)" : "#fff", color: activeTab === "sponsor" ? "#fff" : "var(--color-ink)", border: 0, cursor: "pointer", transition: "0.2s" }}>Become a Sponsor</button>
        <button type="button" onClick={() => setActiveTab("partner")} style={{ flex: 1, padding: "16px", fontWeight: 700, background: activeTab === "partner" ? "var(--color-signal)" : "#fff", color: activeTab === "partner" ? "#fff" : "var(--color-ink)", border: 0, borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)", cursor: "pointer", transition: "0.2s" }}>Become a Partner</button>
        <button type="button" onClick={() => setActiveTab("ambassador")} style={{ flex: 1, padding: "16px", fontWeight: 700, background: activeTab === "ambassador" ? "var(--color-signal)" : "#fff", color: activeTab === "ambassador" ? "#fff" : "var(--color-ink)", border: 0, cursor: "pointer", transition: "0.2s" }}>Become an Ambassador</button>
      </div>

      <div style={{ padding: 32 }}>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          {status === "error" && <div className="sm:col-span-2 text-red-600 text-sm font-bold">Something went wrong. Please try again.</div>}

          {activeTab === "sponsor" && (
            <>
              <div><label className="label">Company Name *</label><input name="name" className="input" required /></div>
              <div><label className="label">Website URL</label><input name="website" className="input" type="url" /></div>
              <div><label className="label">Contact Email *</label><input name="email" className="input" type="email" required /></div>
              <div><label className="label">Contact Phone *</label><input name="phone" className="input" type="tel" required /></div>
              <div className="sm:col-span-2"><label className="label">Message / Sponsorship Tier Interest</label><textarea name="message" className="input" rows={3} /></div>
            </>
          )}

          {activeTab === "partner" && (
            <>
              <div className="sm:col-span-2"><label className="label">Society / Institute Name *</label><input name="name" className="input" required /></div>
              <div><label className="label">Contact Person *</label><input name="contactName" className="input" required /></div>
              <div><label className="label">Contact Email *</label><input name="email" className="input" type="email" required /></div>
              <div><label className="label">Contact Phone *</label><input name="phone" className="input" type="tel" required /></div>
              <div><label className="label">University / Institution *</label><input name="institution" className="input" required /></div>
            </>
          )}

          {activeTab === "ambassador" && (
            <>
              <div><label className="label">Full Name *</label><input name="name" className="input" required /></div>
              <div><label className="label">University / Institution *</label><input name="institution" className="input" required /></div>
              <div><label className="label">Email Address *</label><input name="email" className="input" type="email" required /></div>
              <div><label className="label">WhatsApp Number *</label><input name="phone" className="input" type="tel" required /></div>
            </>
          )}

          <div className="sm:col-span-2 mt-2">
            <button type="submit" className="btn b1" style={{ width: "100%" }} disabled={status === "sending"}>
              {status === "sending" ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}