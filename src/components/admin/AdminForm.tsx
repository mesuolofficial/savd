"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { FileUpload } from "@/components/public/FileUpload"; // <--- FIXED PATH

type Props = {
  action: any;
  competitions: { id: string; title: string }[];
  initialData?: any; 
};

export function AdminForm({ action, competitions, initialData }: Props) {
  const [state, formAction, pending] = useActionState(action, {} as any);
  const [copied, setCopied] = useState(false);
  const isEditing = !!initialData;

  if (state?.ok && state?.tempPassword && !isEditing) {
    return (
      <div className="card p-8 text-center bg-success/5 border-success/30">
        <div className="text-5xl mb-4 text-success">✓</div>
        <h1 className="text-2xl font-bold text-success mb-2">Admin Created Successfully</h1>
        <p className="text-mist mb-6">Please copy this temporary password now. It will not be shown again.</p>
        <div className="bg-white border border-line p-4 rounded-lg mb-6 flex items-center justify-between">
          <p className="font-mono text-xl font-bold tracking-widest text-ink select-all">{state.tempPassword}</p>
          <button 
            type="button" 
            onClick={() => { navigator.clipboard.writeText(state.tempPassword); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="btn btn-sm btn-outline-light"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <Link href="/admin/admins" className="btn btn-primary w-full justify-center">Back to Admins</Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="card grid gap-5 p-6">
      {state?.error && <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm font-bold">{state.error}</div>}
      {state?.msg && <div className="bg-success/10 text-success p-3 rounded-lg text-sm font-bold">{state.msg}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input name="name" className="input" required defaultValue={initialData?.name || ""} />
        </div>
        <div>
          <label className="label">Email *</label>
          <input name="email" type="email" className="input" required defaultValue={initialData?.email || ""} />
        </div>
      </div>

      <div>
        <label className="label">Role *</label>
        <select name="role" className="input" required defaultValue={initialData?.role || "EVENT_MANAGER"}>
          <option value="EVENT_MANAGER">Event Manager</option>
          <option value="CERTIFICATE_MANAGER">Certificate Manager</option>
          <option value="REGISTRATION_REVIEWER">Registration Reviewer</option>
          <option value="CONTENT_MANAGER">Content Manager</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      <div>
        <label className="label">Scope to Competition (Optional)</label>
        <select name="competitionId" className="input" defaultValue={initialData?.competitionId || ""}>
          <option value="">All Competitions</option>
          {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Avatar Upload */}
      <div>
        <label className="label">Profile Picture (Optional)</label>
        {initialData?.avatar && (
          <img src={initialData.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover mb-2 border border-line" />
        )}
        <FileUpload name="avatar" accept="image/*" label="Click to upload avatar" hint="JPG, PNG (Max 2MB)" />
      </div>

      <div className="flex gap-6 bg-canvas p-4 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={isEditing ? initialData.isActive : true} className="w-4 h-4" />
          <span className="text-sm font-semibold">Account Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="readOnly" defaultChecked={isEditing ? initialData.readOnly : false} className="w-4 h-4" />
          <span className="text-sm font-semibold">View-Only Access</span>
        </label>
      </div>

      <div className="border-t border-line pt-5">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving..." : isEditing ? "Save Changes" : "Create Admin"}
        </button>
      </div>
    </form>
  );
}