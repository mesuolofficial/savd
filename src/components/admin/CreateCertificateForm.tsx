"use client";

import { useActionState, useState } from "react";
import { addCertificateAction } from "@/lib/actions/certificate.actions";

export function CreateCertificateForm({ competitions }: { competitions: { id: string; title: string }[] }) {
  const [state, formAction, pending] = useActionState(addCertificateAction, {} as any);
  
  const [savdId, setSavdId] = useState("");
  const [person, setPerson] = useState<{ name: string, university: string } | null>(null);
  const [lookupStatus, setLookupStatus] = useState<"idle" | "checking" | "found" | "notfound">("idle");

  const handleLookup = async () => {
    if (!savdId.trim()) return;
    setLookupStatus("checking");
    setPerson(null);
    try {
      const res = await fetch(`/api/people/lookup?savdId=${encodeURIComponent(savdId)}`);
      const data = await res.json();
      if (data.found) {
        setPerson(data.person);
        setLookupStatus("found");
      } else {
        setLookupStatus("notfound");
      }
    } catch {
      setLookupStatus("notfound");
    }
  };

  return (
    <form action={formAction} className="card grid gap-5 p-6">
      {state.error ? <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</div> : null}
      {state.msg ? <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{state.msg}</div> : null}

      <div>
        <label className="label">SAVD ID *</label>
        <div className="flex gap-2">
          <input 
            name="savdId" 
            className="input font-mono" 
            placeholder="e.g. SAVD-0001" 
            value={savdId}
            onChange={(e) => { setSavdId(e.target.value.toUpperCase()); setLookupStatus("idle"); }}
            onBlur={handleLookup}
            required 
          />
          <button type="button" onClick={handleLookup} className="btn btn-outline-light">Check</button>
        </div>
        
        {lookupStatus === "checking" && <p className="text-xs text-mist mt-2">Checking database...</p>}
        {lookupStatus === "found" && person && (
          <div className="mt-2 p-3 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm font-bold text-success">✓ {person.name}</p>
            <p className="text-xs text-mist">{person.university}</p>
          </div>
        )}
        {lookupStatus === "notfound" && <p className="text-xs text-danger mt-2 font-bold">✖ SAVD ID not found in database.</p>}
      </div>

      <div>
        <label className="label">Serial Number *</label>
        <input name="serial" className="input font-mono" placeholder="e.g. SAVD26-0001" required />
      </div>

      <div>
        <label className="label">Certificate Title</label>
        <input name="title" className="input" defaultValue="Certificate of Participation" required />
      </div>

      <div>
        <label className="label">Competition (Year)</label>
        <select name="competitionId" className="input">
          <option value="">General (No specific year)</option>
          {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Certificate Image *</label>
        <p className="text-xs text-mist mb-2">Upload a JPG or PNG file.</p>
        <input type="file" name="file" accept="image/jpeg, image/png, image/webp" className="input" style={{ paddingTop: 10 }} required />
      </div>

      <div className="border-t border-line pt-5">
        <button type="submit" className="btn btn-primary" disabled={pending || lookupStatus !== "found"}>
          {pending ? "Uploading..." : "Save Certificate"}
        </button>
        {lookupStatus !== "found" && <p className="text-xs text-danger mt-2">Please verify a valid SAVD ID first.</p>}
      </div>
    </form>
  );
}