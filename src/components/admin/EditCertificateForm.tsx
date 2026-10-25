"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateCertificateAction, uploadCertificateImageAction, deleteCertificateAction } from "@/lib/actions/certificate.actions";

export function EditCertificateForm({ cert, competitions }: { cert: any, competitions: { id: string, title: string }[] }) {
  const router = useRouter();
  const [updateState, updateAction, updatePending] = useActionState(updateCertificateAction.bind(null, cert.id), {} as any);
  const [uploadState, uploadAction, uploadPending] = useActionState(uploadCertificateImageAction.bind(null, cert.id), {} as any);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this certificate? This action cannot be undone and will remove the image from cloud.")) {
      const res = await deleteCertificateAction(cert.id);
      if (res.ok) {
        router.push("/admin/certificates");
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <div className="grid gap-6">
      
      {/* DETAILS FORM */}
      <form action={updateAction} className="card p-6 grid gap-5">
        <h2 className="text-lg font-bold border-b border-line pb-2">Details</h2>
        
        {updateState?.error && <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm font-bold">{updateState.error}</div>}
        {updateState?.msg && <div className="bg-success/10 text-success p-3 rounded-lg text-sm font-bold">{updateState.msg}</div>}

        <div>
          <label className="label">Assigned Person (SAVD ID) *</label>
          <input name="savdId" className="input font-mono" required defaultValue={cert.person.savdId} />
          <p className="text-xs text-mist mt-1">Current Name: {cert.person.name}</p>
        </div>

        <div>
          <label className="label">Serial Number *</label>
          <input name="serial" className="input" required defaultValue={cert.serial} />
        </div>

        <div>
          <label className="label">Competition</label>
          <select name="competitionId" className="input" defaultValue={cert.competitionId || ""}>
            <option value="">General (No specific year)</option>
            {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        
        <div>
          <label className="label">Title *</label>
          <input name="title" className="input" required defaultValue={cert.title} />
        </div>

        <button type="submit" className="btn btn-primary w-max" disabled={updatePending}>
          {updatePending ? "Saving..." : "Save Details"}
        </button>
      </form>

      {/* REPLACE IMAGE FORM */}
      <form action={uploadAction} className="card p-6 grid gap-5">
        <h2 className="text-lg font-bold border-b border-line pb-2">Replace Image</h2>

        {uploadState?.error && <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm font-bold">{uploadState.error}</div>}
        {uploadState?.msg && <div className="bg-success/10 text-success p-3 rounded-lg text-sm font-bold">{uploadState.msg}</div>}

        <div>
          <label className="label">Select New Image</label>
          <input type="file" name="file" accept="image/*" className="input" required style={{ paddingTop: 8 }} />
        </div>

        <button type="submit" className="btn btn-primary w-max" disabled={uploadPending}>
          {uploadPending ? "Uploading..." : "Upload New Image"}
        </button>
      </form>

      {/* DANGER ZONE */}
      <div className="card p-6 border-danger/20 bg-danger/5">
        <h2 className="text-lg font-bold text-danger pb-2 mb-4">Danger Zone</h2>
        <p className="text-sm text-mist mb-4">Deleting this certificate will permanently remove it from the database and cloud storage.</p>
        <button 
          onClick={handleDelete} 
          type="button" 
          className="btn w-full md:w-max bg-danger text-white hover:bg-danger/90"
        >
          Delete Certificate
        </button>
      </div>

    </div>
  );
}