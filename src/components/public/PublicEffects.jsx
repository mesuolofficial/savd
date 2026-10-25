"use client";
// Sections "drop in" on scroll + stat count-up. Re-runs on every route change.
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PublicEffects() {
  const path = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    document.querySelectorAll(".pub .rv").forEach((e, i) => { e.style.transitionDelay = (i % 3) * 0.12 + "s"; io.observe(e); });
    const co = new IntersectionObserver((es, o) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      o.unobserve(e.target);
      e.target.querySelectorAll("[data-n]").forEach((b) => {
        const n = +b.dataset.n; if (!n) return;
        let i = 0; b.textContent = "0";
        const t = setInterval(() => { b.textContent = ++i; if (i >= n) clearInterval(t); }, 900 / n);
      });
    }), { threshold: 0.4 });
    document.querySelectorAll(".pub .stats .grid").forEach((g) => co.observe(g));
    return () => { io.disconnect(); co.disconnect(); };
  }, [path]);
  return null;
}
