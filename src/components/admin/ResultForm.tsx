"use client";

import { useActionState, useState } from "react";
import { saveResultAction, deleteResultAction } from "@/lib/actions/result.actions";

type Team = { id: string; name: string };
type Result = { id: string; label: string; medal: string; teamId: string | null; awardNote: string | null; team: Team | null };

export function ResultForm({ competitionId, results, teams }: { competitionId: string, results: Result[], teams: Team[] }) {
  const [state, formAction, pending] = useActionState(saveResultAction, {} as any);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (r: Result) => {
    setEditingId(r.id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const editingResult = results.find(r => r.id === editingId);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_350px]">
      
      {/* List of Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold border-b border-line pb-2">Current Results</h2>
        {results.length === 0 ? <p className="text-mist">No results added yet.</p> : results.map((r) => (
          <div key={r.id} className="card p-4 flex justify-between items-center bg-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-ink">{r.label}</span>
                <span className="text-xs font-bold text-mist uppercase tracking-wider bg-canvas px-2 py-0.5 rounded">{r.medal}</span>
              </div>
              <p className="text-sm font-semibold text-signal">{r.team ? r.team.name : "No team assigned"}</p>
              {r.awardNote && <p className="text-xs text-mist mt-1">"{r.awardNote}"</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(r)} className="btn btn-sm btn-outline-light">Edit</button>
              <form action={async () => { if(confirm("Delete this result?")) await deleteResultAction(r.id, competitionId); }}>
                <button type="submit" className="btn btn-sm text-danger hover:bg-danger/10">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      <aside className="card p-6 h-fit sticky top-24">
        <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Position" : "Add New Position"}</h2>
        
        {state.error && <div className="text-danger text-sm mb-4">{state.error}</div>}
        {state.msg && <div className="text-success text-sm mb-4">{state.msg}</div>}

        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="competitionId" value={competitionId} />
          {editingId && <input type="hidden" name="id" value={editingId} />}
          
          <div>
            <label className="label">Position Label *</label>
            <input name="label" className="input" defaultValue={editingResult?.label} placeholder="e.g. 1st Place" required />
          </div>
          
          <div>
            <label className="label">Medal</label>
            <select name="medal" className="input" defaultValue={editingResult?.medal || "NONE"}>
              <option value="NONE">None</option>
              <option value="GOLD">Gold 🥇</option>
              <option value="SILVER">Silver 🥈</option>
              <option value="BRONZE">Bronze 🥉</option>
            </select>
          </div>

          <div>
            <label className="label">Team</label>
            <select name="teamId" className="input" defaultValue={editingResult?.teamId || ""}>
              <option value="">-- No Team (Unassigned) --</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Award Note (Optional)</label>
            <input name="awardNote" className="input" defaultValue={editingResult?.awardNote || ""} placeholder="e.g. Best Design" />
          </div>

          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" name="sendEmail" defaultChecked={!editingId} className="w-4 h-4" />
            <span className="text-sm font-semibold">Send congratulation emails to team</span>
          </label>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary flex-1" disabled={pending}>
              {pending ? "Saving..." : "Save Result"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="btn btn-outline-light">
                Cancel
              </button>
            )}
          </div>
        </form>
      </aside>
    </div>
  );
}