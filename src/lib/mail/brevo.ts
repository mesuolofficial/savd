import "server-only";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

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

/**
 * FR-23 — all transactional email goes through this.
 * Failures are logged (never thrown) so a broken Brevo call can never
 * roll back a successful registration.
 */
export async function sendEmail(args: SendArgs): Promise<SendResult> {
  if (!args.to.length) return { ok: false, error: "No recipients" };

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

  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: args.to.map((r) => (r.name ? { email: r.email, name: r.name } : { email: r.email })),
        subject: args.subject,
        htmlContent: args.html,
        ...(args.replyTo ? { replyTo: { email: args.replyTo.email, name: args.replyTo.name } } : {}),
        ...(args.tags ? { tags: args.tags } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[brevo] ${res.status} for "${args.subject}":`, body.slice(0, 500));
      return { ok: false, error: `Brevo returned ${res.status}` };
    }

    const json = (await res.json().catch(() => ({}))) as { messageId?: string };
    return { ok: true, messageId: json.messageId ?? "" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    console.error(`[brevo] send failed for "${args.subject}":`, msg);
    return { ok: false, error: msg };
  }
}

/** FR-23 — the two addresses that get every admin alert. */
export function adminAlertEmails(): string[] {
  const raw = process.env.ADMIN_ALERT_EMAILS || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}