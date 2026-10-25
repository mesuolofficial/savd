"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReviewAction } from "@/lib/actions/review.actions";

export function PostReviewWizard({ competition }: { competition: { id: string, title: string, slug: string } }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [person, setPerson] = useState<any>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/otp/request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "POST_REVIEW" }),
      });
      if (!res.ok) throw new Error("Failed to send OTP.");
      setStep(2);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "POST_REVIEW", code: otp, competitionId: competition.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP.");
      setPerson(data.person);
      setStep(3);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData();
    fd.append("competitionId", competition.id);
    fd.append("role", person.role);
    fd.append("text", text);
    const res = await submitReviewAction(email, fd);
    if (res.ok) router.push("/reviews?msg=submitted");
    else { setError(res.error || "Failed to submit."); setLoading(false); }
  };

  return (
    <div className="max-w-lg w-full mx-auto bg-white rounded-2xl shadow-xl border border-line p-8">
      <h1 className="text-2xl font-bold text-center text-ink mb-2 font-display">Post a Review</h1>
      <p className="text-center text-sm text-mist mb-6">{competition.title}</p>
      
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="mt-6">
          <p className="text-sm text-mist text-center mb-6">Enter your email to verify you participated in this competition.</p>
          <label className="label">Email Address</label>
          <input type="email" className="input mb-6" value={email} onChange={e => setEmail(e.target.value)} required />
          {error && <p className="text-danger text-xs mb-4">{error}</p>}
          <button type="submit" disabled={loading} className="btn b1 w-full justify-center">{loading ? "Sending..." : "Send OTP"}</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="mt-6">
          <p className="text-sm text-mist text-center mb-6">Enter the 6-digit code sent to your email.</p>
          <label className="label">Verification Code</label>
          <input type="text" maxLength={6} className="input mb-6 font-mono text-center tracking-widest text-lg" value={otp} onChange={e => setOtp(e.target.value)} required />
          {error && <p className="text-danger text-xs mb-4">{error}</p>}
          <button type="submit" disabled={loading} className="btn b1 w-full justify-center">{loading ? "Verifying..." : "Verify OTP"}</button>
        </form>
      )}

      {step === 3 && person && (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex items-center gap-4 bg-[#faf9f7] p-4 rounded-xl mb-6">
            {person.photo ? <img src={person.photo} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-signal text-white flex items-center justify-center font-bold">{person.name[0]}</div>}
            <div><p className="font-bold text-ink">{person.name}</p><p className="text-xs text-mist">{person.role}</p></div>
          </div>
          <label className="label">Your Review</label>
          <textarea className="input min-h-[150px] mb-6" value={text} onChange={e => setText(e.target.value)} placeholder="Share your experience..." required />
          {error && <p className="text-danger text-xs mb-4">{error}</p>}
          <button type="submit" disabled={loading} className="btn b1 w-full justify-center">{loading ? "Submitting..." : "Submit Review"}</button>
        </form>
      )}
    </div>
  );
}