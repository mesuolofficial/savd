/** Instant skeleton shown by loading.tsx while a page is being fetched. */
export function PageLoading({ variant }: { variant: "public" | "admin" }) {
  if (variant === "admin") {
    return (
      <div role="status" aria-live="polite" aria-label="Loading page" className="animate-pulse">
        <div className="mb-6 h-9 w-64 rounded-lg bg-[#d8d2c6]/70" />
        <div className="mb-6 flex gap-2">
          <div className="h-10 w-28 rounded-lg bg-[#d8d2c6]/70" />
          <div className="h-10 w-24 rounded-lg bg-[#d8d2c6]/70" />
          <div className="h-10 w-24 rounded-lg bg-[#d8d2c6]/70" />
        </div>
        <div className="rounded-2xl border border-[#d8d2c6] bg-white/50 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-3 h-12 rounded-lg bg-[#d8d2c6]/50 last:mb-0" />
          ))}
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" aria-label="Loading page">
      <header className="ph dk">
        <div className="wrap animate-pulse" style={{ display: "grid", gap: 14, justifyItems: "center" }}>
          <div className="h-3 w-32 rounded bg-white/25" />
          <div className="h-10 w-72 max-w-full rounded-lg bg-white/25" />
          <div className="h-4 w-56 max-w-full rounded bg-white/20" />
        </div>
      </header>
      <section className="pg">
        <div className="wrap animate-pulse" style={{ display: "grid", gap: 16 }}>
          <div className="h-6 w-1/3 rounded bg-[#d8d2c6]/70" />
          <div className="h-4 w-full rounded bg-[#d8d2c6]/50" />
          <div className="h-4 w-5/6 rounded bg-[#d8d2c6]/50" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-40 rounded-2xl bg-[#d8d2c6]/50" />
            <div className="h-40 rounded-2xl bg-[#d8d2c6]/50" />
            <div className="h-40 rounded-2xl bg-[#d8d2c6]/50" />
          </div>
        </div>
      </section>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
