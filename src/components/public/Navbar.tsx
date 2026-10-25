"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["Home", "/"], 
  ["Competitions", "/competitions"], 
  ["Archives", "/archives"], 
  ["Gallery", "/gallery"],
  ["Certificates", "/certificates"], 
  ["Reviews", "/reviews"], 
  ["Teams", "/teams"], 
  ["People", "/people"],
  ["Sponsors", "/sponsors"], 
  ["Contact", "/contact"]
] as const;

export function Navbar({ ctaLabel, ctaHref }: { ctaLabel: string; ctaHref: string }) {
  const p = usePathname();
  const [open, setOpen] = useState(false);
  const on = (h: string) => (h === "/" ? p === "/" : p.startsWith(h));
  
  return (
    <nav>
      <div
        className="wrap"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 16,
          width: "100%",
          maxWidth: "none",
          margin: 0,
          padding: "0 32px",
          boxSizing: "border-box",
        }}
      >
        
        {/* LEFT: LOGOS */}
        <Link className="logo" href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/brand/logo.png" alt="SAVD" style={{ height: 40, objectFit: "contain" }} />
          <img 
            src="/images/brand/uol-logo.png" 
            alt="University of Lahore" 
            className="hidden sm:block"
            style={{ height: 35, objectFit: "contain", borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: 12 }} 
          />
          <div style={{ display: "flex", alignItems: "baseline", fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: ".04em", color: "#fff" }}>
            SAVD 
            <small className="hidden sm:inline" style={{ fontSize: ".7rem", fontWeight: 600, color: "var(--glow)", marginLeft: 6, fontFamily: "var(--font-sans)" }}>
              ▸ MES
            </small>
          </div>
        </Link>

        {/* CENTER: LINKS (middle grid column "1fr" centers them) */}
        <ul
          className="hidden lg:flex"
          style={{
            justifyContent: "center",
            margin: 0,
            padding: 0,
            gap: 20,
            listStyle: "none",
            whiteSpace: "nowrap",
          }}
        >
          {LINKS.map(([l, h]) => (
            <li key={h}><Link href={h} className={on(h) ? "on" : undefined}>{l}</Link></li>
          ))}
        </ul>

        {/* RIGHT: CTA & MENU */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifySelf: "end" }}>
          <Link className="btn b1 hidden sm:flex" style={{ height: 40, padding: "0 18px", fontSize: ".9rem" }} href={ctaHref}>{ctaLabel}</Link>
          <button type="button" className="burger lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? "✕" : "☰"}</button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`mnav${open ? " open" : ""}`} onClick={() => setOpen(false)}>
        {LINKS.map(([l, h]) => (<Link key={h} href={h} className={on(h) ? "on" : undefined}>{l}</Link>))}
        <Link className="btn b1" href={ctaHref}>{ctaLabel}</Link>
      </div>
    </nav>
  );
}