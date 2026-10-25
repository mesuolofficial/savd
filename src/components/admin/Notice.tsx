export function Notice({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`mb-4 rounded-lg border px-4 py-3 text-sm ${kind === "error" ? "border-danger/30 bg-danger/10" : "border-success/30 bg-success/10"}`}>
      {children}
    </div>
  );
}
