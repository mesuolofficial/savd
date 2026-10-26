"use client";

import { useEffect, useState } from "react";
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

export default function CertificatesVault() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => { search(query, 1); }, []);

  const search = async (q: string, targetPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/certificates/search?q=${encodeURIComponent(q)}&page=${targetPage}&limit=12`);
      const data = await res.json();
      setResults(data.results || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      setPage(targetPage);
    } catch { setResults([]); }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); search(query, 1); };

  return (
    <>
      <header className="ph dk" style={{ paddingBottom: 60 }}>
        <div className="wrap">
          <p className="ey">Official Records</p>
          <h1>Certificate Vault</h1>
          <p className="sub">Find and download your achievement certificates instantly.</p>
        </div>
      </header>
      <MeltEdge seed={33} />

      <section className="pg">
        <div className="wrap">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto mb-10 p-3 sm:p-5"
            style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--line)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, SAVD ID, SAP ID, CNIC or Serial"
              aria-label="Search certificates"
              className="input w-full sm:flex-1 min-w-0"
              style={{ height: 54, border: "none", background: "#f6f3ec", fontSize: 16, paddingLeft: 16, paddingRight: 16 }}
            />
            <div className="flex gap-2">
              <button type="submit" className="btn b1 flex-1 sm:flex-none justify-center" style={{ height: 54 }}>Search</button>
              {query && (
                <button type="button" onClick={() => { setQuery(""); search("", 1); }} className="btn b2 flex-1 sm:flex-none justify-center" style={{ height: 54, borderColor: "var(--line)", color: "var(--ink)" }}>Clear</button>
              )}
            </div>
          </form>

          <div className="mb-6 flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
            <p className="text-sm font-semibold text-mist">Showing {results.length} of {totalCount} certificates</p>
            <Link href="/certificates/verify" className="more">Go to Verification Portal →</Link>
          </div>

          {loading ? <p className="text-center text-mist py-10">Loading certificates...</p> : results.length === 0 ? (
            <div className="card p-10 text-center max-w-lg mx-auto"><p className="text-lg font-bold text-ink mb-2">No certificates found</p></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((c) => (
                  <div key={c.id} className="card overflow-hidden flex flex-col bg-white">
                    <div className="bg-canvas h-48 flex items-center justify-center p-4 border-b border-line">
                      {/* USE THUMB FOR FAST LOADING */}
                      {c.thumb || c.file ? (
                        <img src={`${c.thumb || c.file}?v=1`} alt={c.serial} className="max-h-full max-w-full object-contain drop-shadow-sm" />
                      ) : <span className="text-mist text-sm font-semibold">Image Pending</span>}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2"><p className="font-mono text-xs font-bold text-signal bg-signal/10 px-2 py-1 rounded">{c.serial}</p></div>
                      <h3 className="text-xl font-bold text-ink leading-tight mb-1">{c.person.name}</h3>
                      <div className="text-xs text-mist mb-4 space-y-1 mt-2">
                        <p><span className="font-semibold text-ink">SAVD ID:</span> {c.person.savdId}</p>
                        {c.person.studentId && <p><span className="font-semibold text-ink">Student ID:</span> {c.person.studentId}</p>}
                      </div>
                      <div className="mt-auto pt-4 border-t border-line">
                        <div className="flex items-center gap-2 mb-4 bg-[#fcf8e3] text-[#8a6d3b] px-3 py-1.5 rounded-full text-xs font-semibold w-max">🏆 {c.competition?.title || c.title}</div>
                        <div className="flex gap-2">
                          {c.file ? (
                            <>
                              <a href={c.file} target="_blank" rel="noopener noreferrer" className="btn b2 flex-1 justify-center" style={{ borderColor: "var(--line)", color: "var(--ink)" }}>View</a>
                              <a href={c.file} download target="_blank" rel="noopener noreferrer" className="btn b1 flex-1 justify-center">Download</a>
                            </>
                          ) : <button disabled className="btn b1 w-full justify-center opacity-50">Not Available</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <button onClick={() => search(query, page - 1)} disabled={page === 1} className="btn b2 disabled:opacity-50" style={{ borderColor: "var(--line)", color: "var(--ink)" }}>← Previous</button>
                  <span className="text-sm font-semibold text-mist">Page {page} of {totalPages}</span>
                  <button onClick={() => search(query, page + 1)} disabled={page === totalPages} className="btn b2 disabled:opacity-50" style={{ borderColor: "var(--line)", color: "var(--ink)" }}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}