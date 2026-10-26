"use client";

import { useEffect, useState } from "react";

type Item = { id: string; type: string; file: string };

/**
 * Prototype media grid. Tapping a photo opens it large (full view) on a dark backdrop.
 * Tap/click anywhere (or press Esc) to close. Videos stay inline with their own controls.
 */
export function TeamMediaGallery({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // no background scroll while open
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <style>{`
        @keyframes tmFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tmZoom { from { opacity: 0; transform: scale(.92) } to { opacity: 1; transform: scale(1) } }
      `}</style>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((m) =>
          m.type === "PHOTO" ? (
            <button
              key={m.id}
              type="button"
              onClick={() => setOpen(m.file)}
              aria-label="View full image"
              className="block w-full rounded-lg overflow-hidden border border-line"
              style={{ cursor: "zoom-in", padding: 0, background: "none" }}
            >
              <img src={m.file} alt="Prototype" className="w-full h-48 sm:h-32 object-cover hover:scale-105 transition-transform" />
            </button>
          ) : (
            <div key={m.id} className="rounded-lg overflow-hidden border border-line">
              <video src={m.file} className="w-full h-48 sm:h-32 object-cover" controls />
            </div>
          )
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full image"
          onClick={() => setOpen(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, background: "rgba(8,20,32,.9)", cursor: "zoom-out", animation: "tmFade .2s ease-out",
          }}
        >
          <img
            src={open}
            alt="Prototype full view"
            style={{
              maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12,
              boxShadow: "0 30px 80px rgba(0,0,0,.6)", animation: "tmZoom .25s cubic-bezier(.2,.9,.3,1.1)",
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: "absolute", top: 14, right: 14, width: 38, height: 38, borderRadius: 999, background: "#ffffff22",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, lineHeight: 1,
            }}
          >
            ×
          </span>
        </div>
      )}
    </>
  );
}
