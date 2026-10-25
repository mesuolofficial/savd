"use client";

import { useState } from "react";
import { mergePeopleAction } from "@/lib/actions/person.actions";
import { useRouter } from "next/navigation";

type Person = { id: string; name: string; savdId: string; email: string | null };

export function MergeForm({ people }: { people: Person[] }) {
  const router = useRouter();
  const [primaryId, setPrimaryId] = useState("");
  const [duplicateId, setDuplicateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryId || !duplicateId) return setError("Select both primary and duplicate.");
    if (primaryId === duplicateId) return setError("Cannot merge a person into themselves.");
    
    if (!confirm("Are you sure? This will move all certificates, teams, and roles to the primary person and DELETE the duplicate.")) return;

    setLoading(true);
    setError("");
    const res = await mergePeopleAction(primaryId, duplicateId);
    setLoading(false);

    if (res.error) setError(res.error);
    else router.push("/admin/people?msg=merged");
  };

  return (
    <form onSubmit={handleMerge} className="card p-6 grid gap-6">
      {error && <div className="text-danger text-sm font-bold bg-danger/10 p-3 rounded">{error}</div>}

      <div>
        <label className="label">Primary Person (Keep this one)</label>
        <select className="input" value={primaryId} onChange={e => setPrimaryId(e.target.value)} required>
          <option value="">-- Select Primary --</option>
          {people.map(p => <option key={p.id} value={p.id}>{p.name} ({p.savdId}) - {p.email}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Duplicate Person (Delete this one)</label>
        <select className="input" value={duplicateId} onChange={e => setDuplicateId(e.target.value)} required>
          <option value="">-- Select Duplicate --</option>
          {people.map(p => <option key={p.id} value={p.id}>{p.name} ({p.savdId}) - {p.email}</option>)}
        </select>
      </div>

      <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
        {loading ? "Merging..." : "Merge People"}
      </button>
    </form>
  );
}