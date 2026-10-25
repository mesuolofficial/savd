import type { AdminRole } from "@prisma/client";

// Kept free of server-only imports so proxy.ts and client components can use it.

export const SESSION_COOKIE = "savd_admin_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours, absolute

// FR-24 — lockout policy
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// FR-21 / FR-24 — participant & admin OTP policy (used from Phase 3 onward)
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

export const SITE_TIMEZONE = "Asia/Karachi";

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  EVENT_MANAGER: "Event Manager",
  CERTIFICATE_MANAGER: "Certificate Manager",
  REGISTRATION_REVIEWER: "Registration Reviewer",
  CONTENT_MANAGER: "Content Manager",
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Full access, including admin accounts, activity log and settings.",
  EVENT_MANAGER: "Runs the competition day to day: competitions, registrations, teams, results, progress, archives.",
  CERTIFICATE_MANAGER: "Issues and manages certificates and the people directory.",
  REGISTRATION_REVIEWER: "Reviews incoming team registrations.",
  CONTENT_MANAGER: "Runs public content: gallery, reviews, messages, sponsors, push notifications.",
};
