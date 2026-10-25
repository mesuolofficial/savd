"use client";

import { useActionState, useState } from "react";
import { toggleArchivePublishAction, addArchiveRoleAction, removeArchiveRoleAction } from "@/lib/actions/archive.actions";

type Person = { id: string; name: string; savdId: string };
type Role = { id: string; personId: string; role: string; isPrimary: boolean; person: Person };
type Archive = { id: string; isPublished: boolean; roles: Role[] };

const ROLE_NAMES = {
  ORGANIZER: "Organizer",
  JUDGE: "Judge",
  CHIEF_GUEST: "Chief Guest",
  PANEL_MEMBER: "Panel Member",
} as const;

export function ArchiveForm({ competitionId, archive, people }: { competitionId: string, archive: Archive, people: Person[] }) {
  const [isPublished, setIsPublished] = useState(archive.isPublished);
  const [publishing, setPublishing] = useState(false);
  
  const [roleState, roleAction, rolePending] = useActionState(addArchiveRoleAction.bind(null, competitionId), {} as any);

  const handleToggle = async () => {
    setPublishing(true);
    const newState = !isPublished;
    await toggleArchivePublishAction(competitionId, newState);
    setIsPublished(newState);
    setPublishing(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_350px]">
      
      {/* Roles Management */}
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold border-b border-line pb-2 mb-4">People & Roles</h2>
          
          <div className="space-y-4 mb-6">
            {Object.entries(ROLE_NAMES).map(([key, label]) => {
              const roles = archive.roles.filter(r => r.role === key);
              if (roles.length === 0) return null;
              
              return (
                <div key={key}>
                  <h3 className="text-sm font-bold text-mist uppercase tracking-wider mb-2">{label}s</h3>
                  <div className="flex flex-wrap gap-2">
                    {roles.map(r => (
                      <div key={r.id} className="bg-canvas border border-line px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                        <span className="font-semibold text-ink">{r.person.name}</span>
                        {r.isPrimary && <span className="text-xs text-gold font-bold">★</span>}
                        <form action={async () => { await removeArchiveRoleAction(r.id, competitionId); }}>
                          <button className="text-danger hover:text-danger/80 text-xs font-bold ml-1">✕</button>
                        </form>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {archive.roles.length === 0 && <p className="text-sm text-mist">No roles assigned yet.</p>}
          </div>

          <form action={roleAction} className="bg-canvas p-4 rounded-lg grid gap-3 items-end sm:grid-cols-[1fr_150px_auto_auto]">
            <div>
              <label className="label">Select Person</label>
              <select name="personId" className="input" required>
                <option value="">Choose...</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.name} ({p.savdId})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Role</label>
              <select name="role" className="input" required>
                <option value="ORGANIZER">Organizer</option>
                <option value="JUDGE">Judge</option>
                <option value="CHIEF_GUEST">Chief Guest</option>
                <option value="PANEL_MEMBER">Panel Member</option>
              </select>
            </div>
            <div className="pb-3">
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="isPrimary" /> Primary</label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={rolePending}>Add</button>
          </form>
        </div>
      </div>

      {/* Publish Toggle */}
      <aside className="space-y-6">
        <div className="card p-6 bg-canvas">
          <h2 className="text-sm font-bold uppercase tracking-wider text-mist mb-4">Visibility</h2>
          <p className="text-sm mb-4">Archives are saved as drafts by default. Publish to make them visible on the public site.</p>
          <button 
            onClick={handleToggle} 
            disabled={publishing}
            className={`btn w-full ${isPublished ? "bg-danger/10 text-danger hover:bg-danger/20" : "btn-primary"}`}
          >
            {publishing ? "Updating..." : isPublished ? "Unpublish Archive" : "Publish Archive"}
          </button>
          {isPublished && <p className="text-xs text-center text-success font-bold mt-3">✓ Currently Live</p>}
        </div>
      </aside>
    </div>
  );
}