"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin progress bar at the very top. Starts the instant a internal link is clicked
 * and finishes when the new page has arrived, so the user always sees "something is happening".
 */
function Bar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [pct, setPct] = useState(0);
  const [visible, setVisible] = useState(false);

  const active = useRef(false);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hide = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (trickle.current) clearInterval(trickle.current);
    if (safety.current) clearTimeout(safety.current);
    if (hide.current) clearTimeout(hide.current);
  };

  const finish = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    clearTimers();
    setPct(100);
    hide.current = setTimeout(() => {
      setVisible(false);
      setPct(0);
    }, 300);
  }, []);

  const start = useCallback(() => {
    clearTimers();
    active.current = true;
    setVisible(true);
    setPct(8);
    trickle.current = setInterval(() => setPct((p) => (p < 90 ? p + (90 - p) * 0.1 : p)), 200);
    safety.current = setTimeout(finish, 15000); // never get stuck
  }, [finish]);

  // New page arrived
  useEffect(() => {
    finish();
  }, [pathname, search, finish]);

  // Any internal link click starts the bar
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, [start]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 3,
        width: `${pct}%`,
        background: "#EF8557",
        boxShadow: "0 0 10px rgba(239,133,87,.7)",
        opacity: visible ? 1 : 0,
        transition: pct === 0 ? "none" : "width .2s ease-out, opacity .3s ease .1s",
        zIndex: 2000,
        pointerEvents: "none",
      }}
    />
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
