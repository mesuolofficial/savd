/**
 * SAVD transactional email templates.
 * - Fixed Dark Mode using Gradient Hack (prevents Gmail/Mobile from inverting colors).
 * - Backgrounds are locked to Ivory, Text is locked to Dark Ink.
 */

export type RosterMember = {
  name: string;
  role: "Leader" | "Member";
  department?: string | null;
  studentId?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type MailContact = { email?: string | null; phone?: string | null };

export type ApplicationType = "sponsor" | "partner" | "ambassador";

const DRIP_IMAGE_URL =
  process.env.DRIP_IMAGE_URL ||
  "https://gjd8eotbf4.ufs.sh/f/GBzgshtk9YMvKiwr0khh4XqDkyL70rxiPQZovFUBYVTA5lnI";

const K = {
  abyss: "#0F2F4B", deep: "#163F63", tide: "#1F5280", sig: "#226192", aqua: "#8EC1E8",
  coral: "#EF8557", gold: "#D9A441", por: "#EAE6DE", ivo: "#F6F3EC", ink: "#14202B",
  mist: "#5D6D7A", line: "#D8D2C6", ok: "#1F9D6B", bad: "#D64545", warn: "#B7791F",
} as const;

const HF = "font-family:'Barlow Condensed','Arial Narrow',Arial,sans-serif;";
const BF = "font-family:'Barlow',Helvetica,Arial,sans-serif;";

/* ------------------------------------------------------------------ helpers */

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function esc(v: unknown): string {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
}

const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br>");
const firstName = (n: string) => (n || "").trim().split(/\s+/)[0] || "there";

export function siteUrl(): string {
  const raw = process.env.SITE_URL;
  if (!raw && process.env.NODE_ENV === "production") {
    console.error("[mail] SITE_URL is not set — email links will point to localhost.");
  }
  return (raw || "http://localhost:3000").replace(/\/+$/, "");
}

const pill = (text: string, color: string) =>
  `<span style="display:inline-block;padding:5px 14px;border-radius:999px;background:${color};color:#fff;${BF}font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase">${esc(text)}</span>`;

/** Paragraph. Fixed color to prevent dark mode inversion. */
const p = (html: string) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${K.ink} !important;">${html}</p>`;

const b = (v: unknown) => `<b>${esc(v)}</b>`;

const label = (text: string) =>
  `<div style="${HF}font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${K.sig};font-weight:700;margin:0 0 8px">${esc(text)}</div>`;

function tiles(items: [string, string, string?][]) {
  const cells = items
    .map(
      (x, i) =>
        `<td valign="top" style="padding:14px 16px;${i ? `border-left:1px solid ${K.line};` : ""}"><div style="${BF}font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${K.mist};font-weight:700">${esc(x[0])}</div><div style="${BF}font-size:15px;font-weight:700;color:${x[2] || K.abyss} !important;margin-top:4px">${esc(x[1])}</div></td>`,
    )
    .join("");
  // Gradient hack for white cards
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;background:${K.ivo};background-image:linear-gradient(#ffffff, #ffffff);border:1px solid ${K.line};border-radius:12px"><tr>${cells}</tr></table>`;
}

function steps(items: string[]) {
  const rows = items
    .map(
      (t, i) =>
        `<tr><td width="40" valign="top" style="padding:6px 0"><div style="width:28px;height:28px;border-radius:14px;background:${K.abyss};color:${K.aqua};${HF}font-size:16px;font-weight:700;text-align:center;line-height:28px">${i + 1}</div></td><td style="padding:6px 0;font-size:14.5px;line-height:1.6;color:${K.ink} !important;">${esc(t)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 20px">${rows}</table>`;
}

function roster(list: RosterMember[], admin = false) {
  if (!list.length) return "";
  const rows = list
    .map((m, i) => {
      const leader = m.role === "Leader";
      const sub = [m.department, m.studentId ? `Student ID ${m.studentId}` : ""].filter(Boolean).map(esc).join(" · ");
      const contact = admin ? [m.email, m.phone].filter(Boolean).map(esc).join(" · ") : "";
      return `<tr><td style="padding:13px 16px;${i ? `border-top:1px solid ${K.por};` : ""}"><span style="${BF}font-size:15px;font-weight:700;color:${K.ink} !important;">${esc(m.name)}</span> <span style="display:inline-block;margin-left:6px;padding:2px 9px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;${BF}background:${leader ? K.coral : "#DCEBF6"};color:${leader ? K.ink : K.sig}">${m.role}</span>${sub ? `<div style="${BF}font-size:13px;color:${K.mist} !important;margin-top:3px">${sub}</div>` : ""}${contact ? `<div style="${BF}font-size:13px;color:${K.mist} !important;margin-top:2px">${contact}</div>` : ""}</td></tr>`;
    })
    .join("");
  // Gradient hack for white roster card
  return `<div style="margin:24px 0 8px">${label(`Team roster · ${list.length} ${list.length === 1 ? "member" : "members"}`)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${K.ivo};background-image:linear-gradient(#ffffff, #ffffff);border:1px solid ${K.line};border-radius:12px;border-collapse:separate;overflow:hidden">${rows}</table><div style="height:20px;line-height:20px;font-size:0">&nbsp;</div>`;
}

const note = (color: string, html: string) =>
  // Gradient hack for white note card
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr><td style="background:${K.ivo};background-image:linear-gradient(#ffffff, #ffffff);border-left:4px solid ${color};border-radius:6px;padding:14px 16px;font-size:14.5px;line-height:1.65;color:${K.ink} !important;">${html}</td></tr></table>`;

const cta = (text: string, href: string, color: string = K.coral) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px"><tr><td style="background:${color};border-radius:10px"><a href="${esc(href)}" style="display:inline-block;padding:14px 30px;${HF}font-size:18px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${K.ink};text-decoration:none">${esc(text)} &rarr;</a></td></tr></table>`;

function contactLine(c?: MailContact) {
  const email = c?.email || process.env.MAIL_FROM_EMAIL || "";
  const phone = c?.phone || "";
  return { email, phone };
}

function contactNote(c?: MailContact) {
  const { email, phone } = contactLine(c);
  const parts = [email ? `<b>${esc(email)}</b>` : "", phone ? `<b>${esc(phone)}</b>` : ""].filter(Boolean);
  return parts.length ? parts.join(" or ") : "the organizers through the website";
}

/* ------------------------------------------------------------------ layout */

type Base = {
  pre: string;
  eyebrow: string;
  title: string;
  pill?: string;
  tone?: string;
  body: string;
  contact?: MailContact;
};

function renderBase(o: Base) {
  const tone = o.tone || K.coral;
  const { email, phone } = contactLine(o.contact);
  const foot = [email ? esc(email) : "", phone ? esc(phone) : ""].filter(Boolean).join(" &nbsp;·&nbsp; ");
  
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root { color-scheme: light only; supported-color-schemes: light; }
    /* Gmail dark mode specific overrides */
    [data-ogsc] .bg-ivory { background-color: ${K.ivo} !important; background-image: linear-gradient(${K.ivo}, ${K.ivo}) !important; }
    [data-ogsc] .text-ink { color: ${K.ink} !important; }
    [data-ogsc] .bg-white { background-color: #ffffff !important; background-image: linear-gradient(#ffffff, #ffffff) !important; }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:${K.por};"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(o.pre)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${K.por};"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;border-radius:16px;overflow:hidden;background:${K.ivo};background-image:linear-gradient(${K.ivo}, ${K.ivo});border:1px solid ${K.line};">

<tr><td height="4" bgcolor="${tone}" style="height:4px;line-height:4px;font-size:0;background:${tone};">&nbsp;</td></tr>

<tr><td bgcolor="${K.abyss}" style="background:${K.abyss};padding:20px 32px;border-bottom:1px solid ${K.tide};"><table role="presentation" width="100%"><tr><td style="${HF}font-size:28px;font-weight:700;letter-spacing:1.5px;color:#fff;">SAVD <span style="font-size:13px;color:${K.aqua};letter-spacing:1px;${BF}font-weight:600">&#9656; MES</span></td><td align="right" style="${BF}font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:${K.aqua};">University of Lahore</td></tr></table></td></tr>

<tr><td bgcolor="${K.deep}" style="background:${K.deep};padding:34px 32px 30px;"><div style="${BF}font-size:12px;font-weight:700;letter-spacing:2.6px;text-transform:uppercase;color:${K.aqua};margin-bottom:10px">${esc(o.eyebrow)}</div><h1 style="margin:0;${HF}font-size:40px;line-height:1.05;font-weight:700;color:#fff;text-transform:uppercase;">${esc(o.title)}</h1>${o.pill ? `<div style="margin-top:16px">${o.pill}</div>` : ""}</td></tr>

<!-- Gradient Hack applied to Drip GIF Container -->
<tr><td bgcolor="${K.ivo}" style="background:${K.ivo};background-image:linear-gradient(${K.ivo}, ${K.ivo});padding:0;line-height:0;font-size:0;"><img src="${esc(DRIP_IMAGE_URL)}" width="620" alt="" style="display:block;width:100%;height:auto;margin-top:-1px;border:0;background:${K.ivo};"></td></tr>

<!-- Gradient Hack applied to Body Container -->
<tr><td bgcolor="${K.ivo}" style="padding:12px 32px 32px;background:${K.ivo};background-image:linear-gradient(${K.ivo}, ${K.ivo});${BF}color:${K.ink};">${o.body}</td></tr>

<tr><td bgcolor="${K.abyss}" style="background:${K.abyss};padding:26px 32px;text-align:center;"><div style="${HF}font-size:20px;font-weight:700;letter-spacing:1.5px;color:#fff;">SAVD <span style="color:${K.aqua}">&#9656;</span> MES</div><div style="${BF}font-size:12px;color:${K.aqua};margin-top:4px;">Pakistan’s National Submersible Autonomous Vehicle Design Competition</div><div style="${BF}font-size:12px;color:${K.por};margin-top:14px;line-height:1.8;">${foot ? `${foot}<br>` : ""}Mechanical Engineering Society, University of Lahore</div><div style="${BF}font-size:11px;color:#8FA6BA;margin-top:14px;">This is an automated message. For any questions, please contact the organizers using the details above.</div></td></tr>

</table></td></tr></table></body></html>`;
}

/* ----------------------------------------------------------- registrations */

export function renderRegistrationReceived(p_: {
  isLeader: boolean;
  recipientName: string;
  teamName: string;
  competitionTitle: string;
  competitionSlug: string;
  siteUrl: string;
  leaderName: string;
  members?: RosterMember[];
  contact?: MailContact;
}) {
  const first = firstName(p_.recipientName);
  const who = p_.isLeader
    ? `You registered the team as <b>team leader</b>.`
    : `${b(p_.leaderName)} registered the team and you are listed as a <b>team member</b>.`;
  const body =
    p(`Hi ${b(first)},`) +
    p(`We’ve received the registration of ${b(p_.teamName)} for ${b(p_.competitionTitle)}. ${who}`) +
    tiles([["Team", p_.teamName], ["Competition", p_.competitionTitle], ["Status", "Pending", K.warn]]) +
    roster(p_.members || []) +
    label("What happens next") +
    steps([
      "The organizers review your team’s registration.",
      "You’ll get an email, addressed to you, once it is approved.",
      "No action is needed from you right now.",
    ]) +
    cta("View competition", `${p_.siteUrl}/competitions/${encodeURIComponent(p_.competitionSlug)}`);
  return renderBase({
    pre: `Your registration for ${p_.competitionTitle} has been received.`,
    eyebrow: "Registration received",
    title: `You’re in, ${first}.`,
    pill: pill("Pending review", K.warn),
    body,
    contact: p_.contact,
  });
}

export function renderRegistrationStatus(p_: {
  teamName: string;
  competitionTitle: string;
  status: "APPROVED" | "REJECTED" | "WITHDRAWN";
  recipientName: string;
  leaderName: string;
  siteUrl: string;
  competitionSlug: string;
  members?: RosterMember[];
  contact?: MailContact;
}) {
  const first = firstName(p_.recipientName);
  const compUrl = `${p_.siteUrl}/competitions/${encodeURIComponent(p_.competitionSlug)}`;
  const contactHref = contactLine(p_.contact).email ? `mailto:${contactLine(p_.contact).email}` : `${p_.siteUrl}/contact`;

  if (p_.status === "APPROVED") {
    return renderBase({
      pre: `${p_.teamName} is approved for ${p_.competitionTitle}.`,
      eyebrow: "Registration update",
      title: `You’re approved, ${first}!`,
      pill: pill("Approved", K.ok),
      tone: K.ok,
      contact: p_.contact,
      body:
        p(`Hi ${b(first)},`) +
        p(`Great news. ${b(p_.teamName)} has been <b>approved</b> and is officially part of ${b(p_.competitionTitle)}. Congratulations to you and your teammates.`) +
        roster(p_.members || []) +
        note(K.ok, "Keep this email. The organizers will share the schedule, venue and technical briefing with your team soon.") +
        cta("View competition", compUrl),
    });
  }

  if (p_.status === "WITHDRAWN") {
    return renderBase({
      pre: `${p_.teamName} has been withdrawn from ${p_.competitionTitle}.`,
      eyebrow: "Registration update",
      title: "Team withdrawn",
      pill: pill("Withdrawn", K.mist),
      tone: K.mist,
      contact: p_.contact,
      body:
        p(`Hi ${b(first)},`) +
        p(`This is to let you know that your team ${b(p_.teamName)} has been <b>withdrawn from ${esc(p_.competitionTitle)}</b>.`) +
        note(K.warn, `<b>Think this is a mistake, or want more updates?</b><br>Please contact the organizers at ${contactNote(p_.contact)} and we’ll help you right away.`) +
        cta("Contact organizers", contactHref),
    });
  }

  return renderBase({
    pre: `An update on your registration for ${p_.competitionTitle}.`,
    eyebrow: "Registration update",
    title: "Registration update",
    pill: pill("Not approved", K.bad),
    tone: K.bad,
    contact: p_.contact,
    body:
      p(`Hi ${b(first)},`) +
      p(`Thank you for registering ${b(p_.teamName)} for ${b(p_.competitionTitle)}. Unfortunately, your team could not be accepted for this edition.`) +
      note(K.bad, `If you believe this is a mistake, or want to know more, please contact the organizers at ${contactNote(p_.contact)}.`) +
      cta("Contact organizers", contactHref),
  });
}

export function renderAdminNewRegistration(p_: {
  teamName: string;
  competitionTitle: string;
  leaderName: string;
  leaderEmail: string;
  leaderWhatsapp: string;
  leaderUniversity: string;
  teamSize: number;
  submittedAt: string;
  adminUrl: string;
  members?: RosterMember[];
}) {
  const body =
    p(`${b(p_.teamName)} has just registered for ${b(p_.competitionTitle)}.`) +
    tiles([["Competition", p_.competitionTitle], ["Team size", `${p_.teamSize} ${p_.teamSize === 1 ? "member" : "members"}`], ["Submitted", p_.submittedAt]]) +
    tiles([["University", p_.leaderUniversity], ["Leader", p_.leaderName], ["Leader WhatsApp", p_.leaderWhatsapp]]) +
    roster(p_.members || [], true) +
    cta("Review in admin", p_.adminUrl);
  return renderBase({
    pre: `New team registered: ${p_.teamName}`,
    eyebrow: "Admin alert",
    title: "New team registered",
    tone: K.aqua,
    body,
  });
}

/* ------------------------------------------------- sponsor / partner / ambassador */

const APP_LABEL: Record<ApplicationType, string> = {
  sponsor: "sponsor",
  partner: "partner society",
  ambassador: "campus ambassador",
};

export function renderApplicationReceived(p_: {
  type: ApplicationType;
  recipientName: string;
  organization: string;
  siteUrl: string;
  contact?: MailContact;
}) {
  const first = firstName(p_.recipientName);
  const what = APP_LABEL[p_.type];
  const body =
    p(`Hi ${b(first)},`) +
    p(`Thank you for your interest in supporting <b>SAVD</b>. We’ve received the application of ${b(p_.organization)} as a <b>${esc(what)}</b>.`) +
    tiles([["Application", what.replace(/^./, (c) => c.toUpperCase())], ["Name", p_.organization], ["Status", "Under review", K.warn]]) +
    label("What happens next") +
    steps(["Our team reviews your application.", "We’ll email you the decision, along with the next steps."]) +
    note(K.sig, `Questions in the meantime? Contact us at ${contactNote(p_.contact)}.`);
  return renderBase({
    pre: `We’ve received your ${what} application.`,
    eyebrow: "Application received",
    title: `Thank you, ${first}!`,
    pill: pill("Under review", K.warn),
    body,
    contact: p_.contact,
  });
}

export function renderApplicationStatus(p_: {
  type: ApplicationType;
  status: "APPROVED" | "REJECTED";
  recipientName: string;
  organization: string;
  referralCode?: string | null;
  siteUrl: string;
  contact?: MailContact;
}) {
  const first = firstName(p_.recipientName);
  const what = APP_LABEL[p_.type];

  if (p_.status === "APPROVED") {
    const code = p_.referralCode
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0"><tr><td align="center" style="background:${K.ivo};background-image:linear-gradient(#ffffff, #ffffff);border:2px dashed ${K.gold};border-radius:14px;padding:22px"><div style="${BF}font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${K.mist};font-weight:700">Your referral code</div><div style="font-family:'JetBrains Mono',Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:6px;color:${K.sig};margin-top:6px">${esc(p_.referralCode)}</div><div style="${BF}font-size:12px;color:${K.mist};margin-top:6px">Share it with teams so their registrations count toward you.</div></td></tr></table>`
      : "";
    return renderBase({
      pre: `Your ${what} application has been approved.`,
      eyebrow: "Application update",
      title: `Welcome aboard, ${first}!`,
      pill: pill("Approved", K.ok),
      tone: K.ok,
      contact: p_.contact,
      body:
        p(`Hi ${b(first)},`) +
        p(`We’re delighted to tell you that the application of ${b(p_.organization)} as a <b>${esc(what)}</b> has been <b>approved</b>. Welcome to the SAVD family.`) +
        code +
        note(K.ok, `We’ll be in touch with the next steps. Questions? Contact ${contactNote(p_.contact)}.`) +
        cta("Visit SAVD", p_.siteUrl),
    });
  }

  return renderBase({
    pre: `An update on your ${what} application.`,
    eyebrow: "Application update",
    title: "Application update",
    pill: pill("Not approved", K.bad),
    tone: K.bad,
    contact: p_.contact,
    body:
      p(`Hi ${b(first)},`) +
      p(`Thank you for applying as a <b>${esc(what)}</b> with ${b(p_.organization)}. After review, we’re unable to take the application forward at this time.`) +
      note(K.bad, `If you’d like to know more, please contact us at ${contactNote(p_.contact)}.`) +
      cta("Visit SAVD", p_.siteUrl),
  });
}

export function renderAdminNewApplication(p_: { type: string; name: string; email: string; phone: string; institution?: string; adminUrl: string }) {
  const rows: [string, string][] = [["Name", p_.name], ["Email", p_.email]];
  if (p_.phone) rows.push(["Phone", p_.phone]);
  if (p_.institution) rows.push(["Institution", p_.institution]);
  const table = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:${K.ivo};background-image:linear-gradient(#ffffff, #ffffff);border:1px solid ${K.line};border-radius:12px;border-collapse:separate">${rows
    .map(
      ([k, v], i) =>
        `<tr><td style="padding:12px 16px;${i ? `border-top:1px solid ${K.por};` : ""}${BF}font-size:14.5px;color:${K.ink} !important;"><span style="color:${K.mist};font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700">${esc(k)}</span><br><b>${esc(v)}</b></td></tr>`,
    )
    .join("")}</table>`;
  return renderBase({
    pre: `New ${p_.type} application from ${p_.name}`,
    eyebrow: "Admin alert",
    title: `New ${p_.type} application`,
    tone: K.aqua,
    body: p("A new application has been submitted and needs your review.") + table + cta("Review in admin", p_.adminUrl),
  });
}

/* ------------------------------------------------------------------ results */

export function renderResultCongratulations(p_: {
  recipientName: string;
  isLeader: boolean;
  teamName: string;
  competitionTitle: string;
  position: string;
  medal: string;
  siteUrl: string;
  competitionSlug: string;
  contact?: MailContact;
}) {
  const first = firstName(p_.recipientName);
  const emoji = p_.medal === "GOLD" ? "🥇" : p_.medal === "SILVER" ? "🥈" : p_.medal === "BRONZE" ? "🥉" : "🏆";
  const lead = p_.isLeader
    ? `As <b>team leader</b>, you guided ${b(p_.teamName)} to a remarkable result at ${b(p_.competitionTitle)}.`
    : `Along with your team, ${b(p_.teamName)}, you achieved a remarkable result at ${b(p_.competitionTitle)}.`;
  const medal = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0"><tr><td align="center" style="background:${K.ivo};background-image:linear-gradient(#ffffff, #ffffff);border:2px dashed ${K.gold};border-radius:14px;padding:26px"><div style="font-size:52px;line-height:1">${emoji}</div><div style="${BF}font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:${K.mist};font-weight:700;margin-top:10px">Position awarded</div><div style="${HF}font-size:36px;font-weight:700;color:${K.abyss} !important;text-transform:uppercase;margin-top:2px">${esc(p_.position)}</div><div style="${BF}font-size:14px;color:${K.mist} !important;margin-top:2px">${esc(p_.teamName)} · ${esc(p_.competitionTitle)}</div></td></tr></table>`;
  return renderBase({
    pre: `${p_.teamName} placed ${p_.position} at ${p_.competitionTitle}.`,
    eyebrow: "Official result",
    title: `Congratulations, ${first}!`,
    tone: K.gold,
    contact: p_.contact,
    body:
      p(`Hi ${b(first)},`) +
      p(`${lead} The entire organizing team is proud of you and your teammates.`) +
      medal +
      p("Your hard work, dedication and engineering have truly paid off. Well done!") +
      cta("View official results", `${p_.siteUrl}/competitions/${encodeURIComponent(p_.competitionSlug)}/results`),
  });
}

/* ------------------------------------- unchanged flows (re-skinned, same signatures) */

export function renderCertificateReady(p_: { name: string; title: string; serial: string; siteUrl: string }) {
  const first = firstName(p_.name);
  return renderBase({
    pre: `Your certificate for ${p_.title} is ready.`,
    eyebrow: "Certificate",
    title: "Your certificate is ready",
    tone: K.gold,
    body:
      p(`Dear ${b(first)},`) +
      p(`Congratulations! Your certificate for ${b(p_.title)} has been officially issued and is now available for download.`) +
      tiles([["Serial number", p_.serial, K.sig]]) +
      p("You can view, verify and download your certificate from our public portal.") +
      cta("View & download certificate", `${p_.siteUrl}/certificates/verify?q=${encodeURIComponent(p_.serial)}`),
  });
}

export function renderReviewSubmitted(p_: { name: string; title: string; siteUrl: string }) {
  return renderBase({
    pre: "We’ve received your review.",
    eyebrow: "Review",
    title: "Review received",
    body:
      p(`Dear ${b(firstName(p_.name))},`) +
      p(`Thank you for sharing your experience! We have received your review for ${b(p_.title)}.`) +
      p("Our team will review it shortly. Once approved, it will be published on our website and you will receive another email.") +
      cta("View all reviews", `${p_.siteUrl}/reviews`),
  });
}

export function renderReviewPublished(p_: { name: string; title: string; reviewUrl: string }) {
  return renderBase({
    pre: "Your review is now live.",
    eyebrow: "Review",
    title: "Your review is live!",
    tone: K.ok,
    body:
      p(`Dear ${b(firstName(p_.name))},`) +
      p(`Great news! Your review for ${b(p_.title)} has been approved and is now published on our website.`) +
      cta("View your review", p_.reviewUrl),
  });
}

export function renderReviewReply(p_: { name: string; title: string; replyText: string; reviewUrl: string }) {
  return renderBase({
    pre: "The SAVD team replied to your review.",
    eyebrow: "Review",
    title: "New reply to your review",
    body:
      p(`Dear ${b(firstName(p_.name))},`) +
      p(`The SAVD team has replied to your review for ${b(p_.title)}.`) +
      note(K.coral, `<i>“${nl2br(p_.replyText)}”</i>`) +
      cta("View reply", p_.reviewUrl),
  });
}

export function renderOtpEmail(p_: { code: string; purpose: string }) {
  const purposeText =
    p_.purpose === "POST_REVIEW" ? "Post a review"
    : p_.purpose === "MANAGE_TEAM" ? "Manage your team"
    : p_.purpose === "ADMIN_RESET" ? "Reset admin password"
    : "Verify your email";
  const code = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td align="center" style="background:${K.ivo};background-image:linear-gradient(#ffffff, #ffffff);border:1px dashed ${K.line};border-radius:12px;padding:24px"><span style="font-family:'JetBrains Mono',Consolas,monospace;font-size:36px;font-weight:700;letter-spacing:8px;color:${K.sig}">${esc(p_.code)}</span></td></tr></table>`;
  return renderBase({
    pre: `Your SAVD verification code is ${p_.code}.`,
    eyebrow: "Verification",
    title: "Verification code",
    body:
      p(`You requested a code for: ${b(purposeText)}`) +
      p("Enter the following 6-digit code to verify your email. This code expires in 10 minutes.") +
      code +
      p("If you didn’t request this, you can safely ignore this email."),
  });
}

export function renderContactAcknowledgement(p_: { name: string; subject: string; message: string }) {
  return renderBase({
    pre: "We’ve received your message.",
    eyebrow: "Contact",
    title: "We’ve received your message",
    body:
      p(`Dear ${b(firstName(p_.name))},`) +
      p(`Thank you for reaching out to SAVD. We have received your message regarding ${b(p_.subject)} and our team will get back to you shortly.`) +
      note(K.sig, `<i style="color:${K.mist}">“${nl2br(p_.message)}”</i>`) +
      p("Best regards,<br>The SAVD Team"),
  });
}

export function renderAdminNewContactMessage(p_: { name: string; email: string; subject: string; adminUrl: string }) {
  const rows: [string, string][] = [["Name", p_.name], ["Email", p_.email], ["Subject", p_.subject]];
  const table = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:${K.ivo};background-image:linear-gradient(#ffffff, #ffffff);border:1px solid ${K.line};border-radius:12px;border-collapse:separate">${rows
    .map(
      ([k, v], i) =>
        `<tr><td style="padding:12px 16px;${i ? `border-top:1px solid ${K.por};` : ""}${BF}font-size:14.5px;color:${K.ink} !important;"><span style="color:${K.mist};font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700">${esc(k)}</span><br><b>${esc(v)}</b></td></tr>`,
    )
    .join("")}</table>`;
  return renderBase({
    pre: `New contact message from ${p_.name}`,
    eyebrow: "Admin alert",
    title: "New contact message",
    tone: K.aqua,
    body: p("You have received a new message from the website contact form.") + table + cta("View message", p_.adminUrl),
  });
}