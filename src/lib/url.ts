/**
 * Turns whatever an admin typed into a safe, clickable external URL.
 * - "https://x.com/a"      -> kept
 * - "instagram.com/mes"    -> "https://instagram.com/mes"
 * - "@handle", "", "javascript:..." -> null (not linkable)
 */
export function externalUrl(raw?: string | null): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;

  if (/^https?:\/\//i.test(v)) {
    try { new URL(v); return v; } catch { return null; }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return null; // javascript:, data:, mailto: ... never linked
  if (/\s/.test(v) || !v.includes(".")) return null;

  try { return new URL(`https://${v}`).toString(); } catch { return null; }
}