import "server-only";
import { getSettings } from "@/lib/settings";
import type { MailContact } from "@/lib/mail/templates";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const TIMEOUT_MS = 10_000;

export type Recipient = { email: string; name?: string };

export type SendArgs = {
  to: Recipient[];
  subject: string;
  html: string;
  replyTo?: Recipient;
  tags?: string[];
};

export type SendResult = { ok: true; messageId: string } | { ok: false; error: string };

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`[brevo] Missing required env var: ${name}`);
  return v;
}

/** Plain-text twin of the HTML (better deliverability, and readable in text-only clients). */
function htmlToText(html: string): string {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<(br|\/p|\/div|\/tr|\/h1|\/table)\s*\/?>/gi, "\n")
    .replace(/<\/td>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&rarr;/g, "->")
    .replace(/&middot;/g, "·")
    .replace(/&#9656;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The same address is never mailed twice in one send. */
function dedupe(list: Recipient[]): Recipient[] {
  const seen = new Set<string>();
  return list.filter((r) => {
    const k = r.email.trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * FR-23 — all transactional email goes through this.
 * Failures are logged (never thrown) so a broken Brevo call can never
 * roll back a successful registration. One retry on network errors, 429 and 5xx.
 */
export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const to = dedupe(args.to);
  if (!to.length) return { ok: false, error: "No recipients" };

  let apiKey: string, fromEmail: string, fromName: string;
  try {
    apiKey = env("BREVO_API_KEY");
    fromEmail = env("MAIL_FROM_EMAIL");
    fromName = process.env.MAIL_FROM_NAME || "SAVD";
  } catch (e) {
    const msg = e instanceof Error ? e.message : "env error";
    console.error(msg);
    return { ok: false, error: msg };
  }

  const payload = JSON.stringify({
    sender: { name: fromName, email: fromEmail },
    to: to.map((r) => (r.name ? { email: r.email, name: r.name } : { email: r.email })),
    subject: args.subject,
    htmlContent: args.html,
    textContent: htmlToText(args.html),
    ...(args.replyTo ? { replyTo: args.replyTo.name ? { email: args.replyTo.email, name: args.replyTo.name } : { email: args.replyTo.email } } : {}),
    ...(args.tags ? { tags: args.tags } : {}),
  });

  let lastError = "Unknown error";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(BREVO_URL, {
        method: "POST",
        headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
        body: payload,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (res.ok) {
        const json = (await res.json().catch(() => ({}))) as { messageId?: string };
        return { ok: true, messageId: json.messageId ?? "" };
      }

      const body = await res.text().catch(() => "");
      lastError = `Brevo returned ${res.status}`;
      console.error(`[brevo] ${res.status} for "${args.subject}" (attempt ${attempt}):`, body.slice(0, 500));
      if (!(res.status === 429 || res.status >= 500)) break; // 4xx other than 429 will not succeed on retry
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Network error";
      console.error(`[brevo] send failed for "${args.subject}" (attempt ${attempt}):`, lastError);
    }
    if (attempt === 1) await sleep(800);
  }
  return { ok: false, error: lastError };
}

/** FR-23 — the addresses that get every admin alert. */
export function adminAlertEmails(): string[] {
  const list = (process.env.ADMIN_ALERT_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!list.length) console.warn("[brevo] ADMIN_ALERT_EMAILS is empty — admin alerts are not being sent.");
  return list;
}

/** Contact details shown in email footers and in the "withdrawn" / "rejected" mails (from Site Settings). */
export async function getMailContact(): Promise<MailContact> {
  try {
    const s = await getSettings();
    return { email: s.adminEmail || process.env.MAIL_FROM_EMAIL || null, phone: s.contactPhone || null };
  } catch {
    return { email: process.env.MAIL_FROM_EMAIL || null, phone: null };
  }
}
