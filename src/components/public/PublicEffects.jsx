"use client";
// Sections "drop in" on scroll + stat count-up.
// Uses a MutationObserver so content that streams in later (loading.tsx / Suspense)
// is picked up too, not just what exists when the layout mounts.
// NOTE: never write inline styles/attributes onto server-rendered nodes here, and wait a
// moment before touching classes, otherwise React reports a hydration mismatch.
// (stagger delays live in public.css as .rv:nth-child rules.)
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const find = (scope, sel) => [
  ...(scope.matches && scope.matches(sel) ? [scope] : []),
  ...scope.querySelectorAll(sel),
];

export function PublicEffects() {
  const path = usePathname();

  useEffect(() => {
    const root = document.querySelector(".pub");
    if (!root) return;

    const seenRv = new WeakSet();
    const seenGrid = new WeakSet();

    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );

    const co = new IntersectionObserver(
      (es, o) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          o.unobserve(e.target);
          e.target.querySelectorAll("[data-n]").forEach((b) => {
            const n = +b.dataset.n;
            if (!n) return;
            let i = 0;
            b.textContent = "0";
            const t = setInterval(() => {
              b.textContent = ++i;
              if (i >= n) clearInterval(t);
            }, 900 / n);
          });
        }),
      { threshold: 0.4 }
    );

    const scan = (scope) => {
      find(scope, ".rv").forEach((el) => {
        if (seenRv.has(el) || el.classList.contains("in")) return;
        seenRv.add(el);
        io.observe(el);
      });
      find(scope, ".stats .grid").forEach((g) => {
        if (seenGrid.has(g)) return;
        seenGrid.add(g);
        co.observe(g);
      });
    };

    // Queue nodes and process them after a short delay so React finishes hydrating first.
    const queue = new Set();
    let timer = null;
    const flush = () => {
      timer = null;
      queue.forEach((n) => n.isConnected && scan(n));
      queue.clear();
    };
    const enqueue = (n) => {
      queue.add(n);
      if (!timer) timer = setTimeout(flush, 250);
    };

    enqueue(root); // whatever is already in the DOM

    const mo = new MutationObserver((muts) => {
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) enqueue(n); // content that streamed in later
        })
      );
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      if (timer) clearTimeout(timer);
      io.disconnect();
      co.disconnect();
      mo.disconnect();
    };
  }, [path]);

  return null;
}