import { Fragment } from "react";

/** First letters of the first two meaningful words */
export function initials(name: string): string {
  const w = name.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((x) => x && !["of", "the", "and", "for"].includes(x.toLowerCase()));
  return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] ?? "?").slice(0, 2)).toUpperCase();
}

/** Endless horizontal scroller with constant speed */
export function Marquee({ items, label }: { items: React.ReactNode[]; label: string }) {
  if (!items.length) return null;
  
  // We repeat the items so that we have at least 12 items. This ensures the marquee covers wide screens properly.
  const repeatCount = Math.max(12, items.length);
  const half = Array.from({ length: repeatCount }, (_, i) => items[i % items.length]);
  
  // Calculate duration to keep speed CONSTANT.
  // We use 4 seconds per item. So if we have 10 items (half=12), duration = 48s.
  // If we have 50 items, duration = 200s. 
  // This means the speed is always exactly 1 item per 4 seconds.
  const duration = repeatCount * 4;

  return (
    <div className="mq" role="group" aria-label={label}>
      <div style={{ animationDuration: `${duration}s` }}>
        {half.map((n, i) => <Fragment key={`a${i}`}>{n}</Fragment>)}
        <span aria-hidden="true" style={{ display: "contents" }}>{half.map((n, i) => <Fragment key={`b${i}`}>{n}</Fragment>)}</span>
      </div>
    </div>
  );
}