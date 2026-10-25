import { SITE_TIMEZONE } from "@/lib/constants";

const base = { timeZone: SITE_TIMEZONE } as const;

export function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", { ...base, day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

export function formatDateTime(d: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    ...base, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

/** "10–11 August 2026" (same month) / "30 Aug – 2 September 2026" / single day. */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = new Date(start);
  const e = new Date(end);
  const part = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { ...base, ...o }).format(d);
  const sameDay = part(s, { dateStyle: "short" }) === part(e, { dateStyle: "short" });
  if (sameDay) return formatDate(s);
  const sameMonth = part(s, { month: "numeric", year: "numeric" }) === part(e, { month: "numeric", year: "numeric" });
  if (sameMonth) return `${part(s, { day: "numeric" })}–${formatDate(e)}`;
  return `${part(s, { day: "numeric", month: "long" })} – ${formatDate(e)}`;
}

export const formatCount = (n: number) => new Intl.NumberFormat("en-US").format(n);

/** Admin forms use <input type="datetime-local">; what is typed there is Pakistan time (UTC+5, no DST). */
export function parseKarachi(local: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const d = new Date(`${local}:00+05:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toKarachiInput(d: Date | string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: SITE_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(d)).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
