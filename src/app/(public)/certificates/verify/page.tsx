"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MeltEdge } from "@/components/public/MeltEdge";

type Cert = {
  id: string;
  serial: string;
  title: string;
  file: string | null;
  thumb: string | null;
  person: { name: string; savdId: string; studentId: string | null; university: string | null };
  competition: { title: string } | null;
};

export default function VerifyCertificatePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Cert[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSingleSerial, setIsSingleSerial] = useState(false);

  useEffect(() => { if (initialQuery) handleVerify(initialQuery); }, [initialQuery]);

  const handleVerify = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setHasSearched(false);
    try {
      const res = await fetch(`/api/certificates/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const found = data.results || [];
      setResults(found);
      const exactSerial = found.find((c: Cert) => c.serial.toLowerCase() === q.trim().toLowerCase());
      setIsSingleSerial(!!exactSerial && found.length === 1);
      setHasSearched(true);
    } catch { setResults([]); setHasSearched(true); }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes drawCheck { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
        .verified-badge { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .check-path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: drawCheck 0.8s ease-out 0.3s forwards; }
      `}</style>

      <header className="ph dk">
        <div className="wrap">
          <p className="ey">Official Portal</p>
          <h1>Verify a Certificate</h1>
          <p className="sub">Enter a serial number, SAVD ID, CNIC, or Name to verify authenticity.</p>
        </div>
      </header>
      <MeltEdge seed={42} />

      <section className="pg">
        <div className="wrap max-w-4xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleVerify(query); }} className="flex flex-col sm:flex-row gap-3 mb-12 bg-white p-3 sm:p-4 rounded-xl border border-line shadow-sm">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Serial, SAVD ID, CNIC or Name" aria-label="Certificate lookup" className="input w-full sm:flex-1 min-w-0 font-mono" style={{ height: 54, border: "none", background: "#f6f3ec", fontSize: 16, paddingLeft: 16, paddingRight: 16 }} required />
            <button type="submit" className="btn b1 justify-center" style={{ height: 54 }} disabled={loading}>{loading ? "Verifying..." : "Verify Now"}</button>
          </form>

          {hasSearched && results.length === 0 && (
            <div className="card p-12 text-center border-danger/30 bg-danger/5">
              <div className="text-6xl mb-4 text-danger">✕</div>
              <h2 className="text-3xl font-bold text-danger mb-2 uppercase tracking-widest">Not Verified</h2>
              <p className="text-mist">No certificate found matching your search. Please check for typos and try again.</p>
            </div>
          )}

          {hasSearched && results.length > 0 && (
            <div className="space-y-8">
              {isSingleSerial && (
                <div className="text-center mb-8">
                  <div className="verified-badge inline-flex items-center justify-center w-24 h-24 rounded-full bg-success/20 mb-4">
                    <svg className="w-12 h-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path className="check-path" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-success tracking-widest uppercase">Verified Authentic</h2>
                  <p className="text-mist mt-2">This certificate is officially issued and valid.</p>
                </div>
              )}

              <div className="grid gap-6">
                {results.map((c) => (
                  <div key={c.id} className="card border-success/30 bg-success/5 overflow-hidden flex flex-col md:flex-row shadow-lg">
                    <div className="bg-white md:w-1/3 p-4 flex items-center justify-center border-r border-line">
                      {c.thumb || c.file ? <img src={`${c.thumb || c.file}?v=1`} alt={c.serial} className="max-h-48 object-contain" /> : <span className="text-mist text-sm">Image Pending</span>}
                    </div>
                    <div className="p-6 md:w-2/3 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-success text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">✓ Verified</span>
                        <p className="font-mono text-sm font-bold text-ink">{c.serial}</p>
                      </div>
                      <h3 className="text-2xl font-bold text-ink leading-tight mb-2">{c.person.name}</h3>
                      <div className="text-sm text-mist mb-4 space-y-1">
                        <p><span className="font-semibold text-ink">SAVD ID:</span> {c.person.savdId}</p>
                        {c.person.studentId && <p><span className="font-semibold text-ink">Student ID:</span> {c.person.studentId}</p>}
                        <p><span className="font-semibold text-ink">Event:</span> {c.competition?.title || c.title}</p>
                      </div>
                      {c.file && (
                        <div className="flex gap-2 mt-2">
                          <a href={c.file} target="_blank" rel="noopener noreferrer" className="btn b2" style={{ borderColor: "var(--line)", color: "var(--ink)" }}>View File</a>
                          <a href={c.file} download target="_blank" rel="noopener noreferrer" className="btn b1">Download</a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-16 text-center"><Link href="/certificates" className="more">← Back to Certificate Vault</Link></div>
        </div>
      </section>
    </>
  );
}