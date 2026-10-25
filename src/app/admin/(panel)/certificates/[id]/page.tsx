"use client";

import { useActionState } from "react";
import { useParams } from "next/navigation"; // <--- IMPORTED useParams
import Link from "next/link";
import { uploadCertificateImageAction } from "@/lib/actions/certificate.actions";

export default function CertificateEditPage() {
  // Next.js 16 way to get params in Client Component
  const params = useParams();
  const id = params.id as string;

  const [state, formAction, pending] = useActionState(uploadCertificateImageAction.bind(null, id), {} as any);

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Link href="/admin/certificates" className="text-mist hover:text-ink text-sm">← Back to Certificates</Link>
      </div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink mb-6">Upload Certificate Image</h1>

      {state?.error && <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</div>}
      {state?.msg && <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{state.msg}</div>}

      <form action={formAction} className="card grid gap-5 p-6">
        <div>
          <label className="label">Certificate Image *</label>
          <p className="text-xs text-mist mb-2">Upload a JPG, PNG, or WEBP file.</p>
          <input type="file" name="file" accept="image/jpeg, image/png, image/webp" className="input" required style={{ paddingTop: 10 }} />
        </div>
        <div className="border-t border-line pt-5">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </form>
    </div>
  );
}