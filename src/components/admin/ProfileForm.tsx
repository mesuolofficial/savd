"use client";

import { useActionState } from "react";
import { changePasswordAction, updateAdminAvatarAction } from "@/lib/actions/auth.actions";

export function ProfileForm({ admin }: { admin: any }) {
  const [passState, passAction, passPending] = useActionState(changePasswordAction, {} as any);
  const [avatarState, avatarAction, avatarPending] = useActionState(updateAdminAvatarAction, {} as any);

  return (
    <div className="grid gap-6">
      {/* AVATAR UPDATE */}
      <form action={avatarAction} className="card p-6 grid gap-4 items-start">
        <h2 className="text-lg font-bold border-b border-line pb-2 mb-2">Profile Picture</h2>
        
        {avatarState?.error && <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm font-bold">{avatarState.error}</div>}
        {avatarState?.success && <div className="bg-success/10 text-success p-3 rounded-lg text-sm font-bold">{avatarState.success}</div>}

        <div className="flex items-center gap-4">
          {admin?.avatar ? (
            <img src={admin.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-line" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-abyss text-white flex items-center justify-center text-2xl font-bold">
              {admin?.name[0]}
            </div>
          )}
          <div className="flex-1">
            <label className="label">Upload New Image</label>
            <input type="file" name="avatar" accept="image/*" className="input" required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-max" disabled={avatarPending}>
          {avatarPending ? "Uploading..." : "Update Picture"}
        </button>
      </form>

      {/* PASSWORD UPDATE */}
      <form action={passAction} className="card p-6 grid gap-5">
        <h2 className="text-lg font-bold border-b border-line pb-2">Change Password</h2>
        
        {passState?.error && <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm font-bold">{passState.error}</div>}
        {passState?.success && <div className="bg-success/10 text-success p-3 rounded-lg text-sm font-bold">{passState.success}</div>}

        <div>
          <label className="label">Current Password *</label>
          <input name="currentPassword" type="password" className="input" required />
        </div>
        
        <div>
          <label className="label">New Password *</label>
          <input name="newPassword" type="password" className="input" required minLength={12} placeholder="Min. 12 characters" />
        </div>
        
        <div>
          <label className="label">Confirm New Password *</label>
          <input name="confirmPassword" type="password" className="input" required minLength={12} />
        </div>

        <button type="submit" className="btn btn-primary mt-2 w-max" disabled={passPending}>
          {passPending ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}