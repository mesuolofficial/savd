"use client";

import { useActionState } from "react";
import { bulkAddCertificatesAction } from "@/lib/actions/certificate.actions";

export function BulkAddForm({ competitions }: { competitions: { id: string, title: string }[] }) {
  const [state, formAction, pending] = useActionState(bulkAddCertificatesAction, {} as any);

  return (
    <div>
      {state.error && <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</div>}
      
      {state.ok && (
        <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-4 text-sm">
          <p className="font-bold text-success mb-2">✓ {state.inserted} certificates inserted successfully!</p>
          {state.errors.length > 0 && (
            <div className="mt-4">
              <p className="font-bold text-danger mb-2">Errors ({state.errors.length}):</p>
              <ul className="list-disc pl-5 space-y-1 max-h-40 overflow-y-auto">
                {state.errors.map((e: string, i: number) => <li key={i} className="text-danger">{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <form action={formAction} className="card grid gap-5 p-6">
        <div>
          <label className="label">Competition (Year) *</label>
          <select name="competitionId" className="input" required>
            <option value="">Select a competition</option>
            {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Certificate Title</label>
          <input name="title" className="input" defaultValue="Certificate of Participation" required />
        </div>

        <div>
          <label className="label">Paste Data *</label>
          <p className="text-xs text-mist mb-2">Format: SAVD ID, Serial Number (One per line)</p>
          <textarea 
            name="csvData" 
            className="input font-mono text-sm" 
            rows={10} 
            placeholder="SAVD-0001, SAVD26-0001&#10;SAVD-0002, SAVD26-0002" 
            required 
          />
        </div>

        <div className="border-t border-line pt-5">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Processing..." : "Insert Certificates"}
          </button>
        </div>
      </form>
    </div>
  );
}