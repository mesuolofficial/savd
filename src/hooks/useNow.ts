"use client";
import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
};

/**
 * Current time in ms, ticking once a second. Returns 0 during server rendering and
 * hydration so the server and client HTML always match (no hydration warnings);
 * components should show a neutral placeholder while this is 0.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribe, () => Math.floor(Date.now() / 1000) * 1000, () => 0);
}
