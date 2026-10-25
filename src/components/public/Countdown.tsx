"use client";
import { useNow } from "@/hooks/useNow";

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ targetIso, footer }: { targetIso: string; footer: string }) {
  const now = useNow(); // 0 until hydrated, so server and client HTML match
  let s = now ? Math.max(0, Math.floor((Date.parse(targetIso) - now) / 1000)) : 0;
  const parts = ([["Days", 86400], ["Hours", 3600], ["Minutes", 60], ["Seconds", 1]] as const).map(([label, v]) => {
    const n = Math.floor(s / v); s -= n * v; return [label, pad(n)] as const;
  });
  return (
    <div className="cdb"><div>
      <div className="cg">{parts.map(([label, v]) => (<div key={label}><b>{v}</b><span>{label}</span></div>))}</div>
      <p>{footer}</p>
    </div></div>
  );
}
