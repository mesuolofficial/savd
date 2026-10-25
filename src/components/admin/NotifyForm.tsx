"use client";

import { useState } from "react";
import { notifyCertificateAction } from "@/lib/actions/certificate.actions";

type Cert = {
  id: string;
  serial: string;
  title: string;
  notifiedAt: Date | null;
  person: { name: string; email: string | null };
};

export function NotifyForm({ certificates }: { certificates: Cert[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pendingCerts = certificates.filter(c => !c.notifiedAt);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(certificates.map(c => c.id)); // Select literally everyone
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNotify = async (scope: "ALL" | "PENDING" | "SELECTED") => {
    if (scope === "SELECTED" && selectedIds.length === 0) return alert("Please select at least one certificate.");
    
    let confirmMsg = "";
    if (scope === "ALL") confirmMsg = `Send email to ALL ${certificates.length} certificate holders? (Including those already sent)`;
    if (scope === "PENDING") confirmMsg = `Send email to ${pendingCerts.length} pending certificate holders?`;
    if (scope === "SELECTED") confirmMsg = `Send email to ${selectedIds.length} selected users?`;
    
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    setResult(null);
    const res = await notifyCertificateAction(scope, selectedIds);
    setResult(res);
    setLoading(false);
    window.location.reload(); // Reload to update sent status
  };

  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 bg-canvas border-b border-line flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleNotify("PENDING")} disabled={loading || pendingCerts.length === 0} className="btn btn-primary">
            Send to PENDING ({pendingCerts.length})
          </button>
          <button onClick={() => handleNotify("SELECTED")} disabled={loading || selectedIds.length === 0} className="btn btn-primary bg-signal hover:bg-signal/90 text-white">
            Send SELECTED ({selectedIds.length})
          </button>
          <button onClick={() => handleNotify("ALL")} disabled={loading || certificates.length === 0} className="btn btn-outline-light bg-white">
            Send to ALL ({certificates.length})
          </button>
        </div>
        
        {result && (
          <div className={`text-sm font-bold p-3 rounded-lg ${result.error ? 'text-danger bg-danger/10' : 'text-success bg-success/10'}`}>
            {result.error ? result.error : `✓ Sent ${result.sent} emails successfully!`}
          </div>
        )}
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#f9f9f9] border-b border-line sticky top-0 z-10">
            <tr>
              <th className="p-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedIds.length === certificates.length && certificates.length > 0}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="p-4">Person</th>
              <th className="p-4">Serial</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-mist">No certificates found with images.</td></tr>
            ) : certificates.map((c) => (
              <tr key={c.id} className={`border-b border-line/50 hover:bg-canvas/30 ${c.notifiedAt ? "bg-gray-50/50" : ""}`}>
                <td className="p-4 text-center">
                  <input 
                    type="checkbox" 
                    // REMOVED DISABLED so you can manually select already sent users
                    checked={selectedIds.includes(c.id)}
                    onChange={() => toggleSelection(c.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="p-4">
                  <p className={`font-bold ${c.notifiedAt ? "text-mist" : "text-ink"}`}>{c.person.name}</p>
                  <p className="text-xs text-mist">{c.person.email || "No email"}</p>
                </td>
                <td className="p-4 font-mono text-xs">{c.serial}</td>
                <td className="p-4">
                  {c.notifiedAt ? (
                    <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">Sent</span>
                  ) : (
                    <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}