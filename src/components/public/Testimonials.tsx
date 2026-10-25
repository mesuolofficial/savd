"use client";

import { useEffect, useRef, useState } from "react";

export type Testimonial = { id: string; text: string; name: string; role: string; context: string; photo: string | null };

const MS = 8000;
const COLORS = ["#226192", "#ef8557", "#163f63", "#5d6d7a", "#3b7fb5"];

function Avatar({ name, photo, i }: { name: string; photo: string | null; i: number }) {
  if (photo && (photo.startsWith("http") || photo.startsWith("/"))) {
    return <img src={photo} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-[#fcf8e3]" />;
  }
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold border-4 border-[#fcf8e3]" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
      {initials}
    </div>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  const n = items.length;
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [more, setMore] = useState<boolean[]>([]);
  const texts = useRef<(HTMLParagraphElement | null)[]>([]);
  const live = useRef({ i: 0, open: false });
  const x0 = useRef<number | null>(null);

  useEffect(() => { live.current = { i, open }; });

  useEffect(() => {
    if (n < 2 || open || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((v) => (v + 1) % n), MS);
    return () => clearTimeout(t);
  }, [i, open, visible, n]);

  useEffect(() => {
    const f = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);

  useEffect(() => {
    const measure = () => setMore((prev) => items.map((_, k) => {
      if (live.current.open && k === live.current.i) return prev[k] ?? false;
      const el = texts.current[k];
      return !!el && el.scrollHeight > el.clientHeight + 1;
    }));
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", measure); };
  }, [items]);

  const go = (k: number) => { setOpen(false); setI((k + n) % n); };

  return (
    <div
      className="relative max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-lg border-t-[6px] border-[#ef8557] px-5 py-8 sm:px-8 sm:py-10 text-center"
      role="region" aria-roledescription="carousel"
      onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (x0.current === null) return; const d = e.changedTouches[0].clientX - x0.current; x0.current = null; if (Math.abs(d) > 50) go(i + (d < 0 ? 1 : -1)); }}
    >
      {/* Decorative Quotes - Hidden on Mobile */}
      <div className="hidden md:block absolute top-4 left-4 text-6xl text-[#ef8557] opacity-10 font-serif leading-none select-none">“</div>
      <div className="hidden md:block absolute bottom-4 right-4 text-6xl text-[#ef8557] opacity-10 font-serif leading-none select-none">”</div>

      {n > 1 && (
        <>
          <button type="button" className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow border border-gray-100 items-center justify-center text-gray-500 hover:text-[#ef8557] z-10" onClick={() => go(i - 1)}>‹</button>
          <button type="button" className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow border border-gray-100 items-center justify-center text-gray-500 hover:text-[#ef8557] z-10" onClick={() => go(i + 1)}>›</button>
        </>
      )}

      <div className="relative overflow-hidden" aria-live="polite">
        {items.map((t, k) => (
          <article key={t.id} className={`transition-all duration-500 ease-in-out ${k === i ? "relative block opacity-100" : "absolute inset-0 opacity-0 pointer-events-none"}`}>
            <div className="flex justify-center mb-3">
              <Avatar name={t.name} photo={t.photo} i={k} />
            </div>
            
            <div className="flex justify-center text-[#D9A441] text-lg mb-3 gap-1">
              ★ ★ ★ ★ ★
            </div>

            <p 
              ref={(el) => { texts.current[k] = el; }} 
              className={`font-serif italic text-base text-gray-600 leading-relaxed mb-4 mx-auto max-w-xl ${open && k === i ? "" : "line-clamp-3"}`}
            >
              "{t.text}"
            </p>

            {k === i && (more[k] || open) ? (
              <button type="button" className="text-xs font-bold text-[#226192] uppercase tracking-wider mb-4 hover:underline" onClick={() => setOpen((o) => !o)}>
                {open ? "Read less" : "Read more"}
              </button>
            ) : null}

            <div className="mt-2">
              <h4 className="text-lg font-bold text-gray-800">{t.name}</h4>
              <p className="text-xs font-semibold text-[#ef8557] uppercase tracking-widest mt-0.5">{t.role}</p>
              <p className="text-[11px] text-gray-400 mt-1">{t.context}</p>
            </div>
          </article>
        ))}
      </div>

      {n > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {items.map((t, k) => (
            <button key={t.id} type="button" className={`h-2 rounded-full transition-all ${k === i ? "bg-[#ef8557] w-5" : "bg-gray-300 w-2"}`} onClick={() => go(k)} />
          ))}
        </div>
      )}
    </div>
  );
}