"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRegistrationAction } from "@/lib/actions/registration.actions";

export function DeleteRegistrationButton({ regId, teamName }: { regId: string; teamName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const close = () => {
    if (pending) return;
    setOpen(false);
    setError("");
  };

  const onDelete = () => {
    setError("");
    startTransition(async () => {
      try {
        const res = await deleteRegistrationAction(regId);
        if (res?.error) {
          setError(res.error);
          return;
        }
        router.push("/admin/registrations");
        router.refresh();
      } catch {
        setError("Network problem. Please check your connection and try again.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-outline-light w-full border-danger text-danger hover:bg-danger/10"
      >
        Delete registration
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: "rgba(10,28,45,0.72)" }}
        >
          <div className="w-full max-w-md rounded-2xl bg-[#faf7f0] p-7 shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Delete this registration?</h3>
            <p className="text-sm text-[#14202b] mb-1">
              <strong>{teamName}</strong> and all its members will be permanently removed.
            </p>
            <p className="text-sm text-[#5d6d7a] mb-4">No email is sent to the team. This cannot be undone.</p>

            {error ? (
              <div role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="btn btn-primary bg-danger hover:bg-danger/90"
              >
                {pending ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="btn btn-outline-light"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
