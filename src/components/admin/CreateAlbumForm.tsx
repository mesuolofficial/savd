"use client";

import { useActionState } from "react";
import { createAlbumAction } from "@/lib/actions/gallery.actions";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export function CreateAlbumForm({ competitions }: { competitions: { id: string; title: string }[] }) {
  const [state, formAction, pending] = useActionState(createAlbumAction, {} as any);

  return (
    <form action={formAction} className="card grid gap-6 p-6">
      {state?.msg && <div className="bg-success/10 text-success p-4 rounded-lg font-bold">{state.msg}</div>}
      {state?.error && <div className="bg-danger/10 text-danger p-4 rounded-lg font-bold">{state.error}</div>}

      <div>
        <label className="label">Album Title *</label>
        <input name="title" className="input" required placeholder="e.g. MES SAVD 2026 - National Finals" />
      </div>

      <div>
        <label className="label">Link to Competition (Optional)</label>
        <select name="competitionId" className="input">
          <option value="">General (No specific event)</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Description</label>
        <RichTextEditor name="description" defaultValue="" placeholder="Enter details about this album..." />
      </div>

      <div className="bg-canvas p-4 rounded-lg border border-line">
        <label className="label">External Link (Optional)</label>
        <input name="externalUrl" className="input" type="url" placeholder="https://facebook.com/..." />
        <p className="text-xs text-mist mt-2">If provided, a button to this link will be shown at the bottom of the public album page (after the internal media).</p>
      </div>

      <div className="bg-canvas p-4 rounded-lg border border-line flex items-center gap-3">
        <input type="checkbox" name="isPublished" id="isPublished" className="w-5 h-5 cursor-pointer" />
        <div>
          <label htmlFor="isPublished" className="font-bold text-sm cursor-pointer">Publish immediately?</label>
          <p className="text-xs text-mist">If unchecked, it will be saved as a Draft and hidden from public.</p>
        </div>
      </div>

      <div className="border-t border-line pt-5 mt-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Creating..." : "Create Album"}
        </button>
      </div>
    </form>
  );
}