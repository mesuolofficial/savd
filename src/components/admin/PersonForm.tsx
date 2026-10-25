"use client";

import { useActionState } from "react";
import Link from "next/link";

export function PersonForm({ action, initialValues }: { action: any, initialValues?: any }) {
  const [state, formAction, pending] = useActionState(action, {} as any);
  const e = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="card grid gap-5 p-5 sm:p-6">
      {state.error ? <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</div> : null}
      {state.msg ? <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{state.msg}</div> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Full Name *</label>
          <input name="name" className="input" required defaultValue={initialValues?.name} />
          {e.name && <p className="text-xs text-red-600 mt-1">{e.name}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" className="input" defaultValue={initialValues?.email} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input name="phone" className="input" defaultValue={initialValues?.phone} />
        </div>
        <div>
          <label className="label">University / Organization</label>
          <input name="university" className="input" defaultValue={initialValues?.university} placeholder="e.g. NUST, Pakistan Navy" />
        </div>
        <div>
          <label className="label">Department / Role</label>
          <input name="department" className="input" defaultValue={initialValues?.department} />
        </div>
        <div>
          <label className="label">Student ID / Employee ID</label>
          <input name="studentId" className="input" defaultValue={initialValues?.studentId} />
        </div>
        <div>
          <label className="label">CNIC</label>
          <input name="cnic" className="input" defaultValue={initialValues?.cnic} />
        </div>
        <div>
          <label className="label">Society</label>
          <input name="society" className="input" defaultValue={initialValues?.society} />
        </div>
        <div>
          <label className="label">Member Since (Year)</label>
          <input name="memberSince" type="number" className="input" defaultValue={initialValues?.memberSince || new Date().getFullYear()} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Profile Photo</label>
          {initialValues?.photo && (
            <div className="mb-2">
              <img src={initialValues.photo} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-line" />
            </div>
          )}
          <input type="file" name="photo" accept="image/*" className="input" style={{ paddingTop: 10 }} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Bio / Notes</label>
          <textarea name="bio" className="input" rows={4} defaultValue={initialValues?.bio} />
        </div>
      </div>

      <div className="flex gap-3 border-t border-line pt-5">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving..." : initialValues ? "Save Changes" : "Create Person"}
        </button>
        <Link href="/admin/people" className="btn btn-outline-light">Cancel</Link>
      </div>
    </form>
  );
}