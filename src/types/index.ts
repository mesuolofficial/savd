import type { AdminRole } from "@prisma/client";

/** The logged-in admin as seen by pages and actions (never contains the password hash). */
export type SessionAdmin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  readOnly: boolean;
  /** When set, this admin may only see/edit this one competition (FR-16). */
  competitionId: string | null;
};

/** State returned by the login Server Action to the login form. */
export type LoginState = {
  error?: string;
  /** ISO timestamp; present when the account is locked (drives the live countdown). */
  lockedUntil?: string;
  attemptsLeft?: number;
};

/** State returned by the competition create/edit Server Actions to the form. */
export type CompetitionFormState = { error?: string; fieldErrors?: Record<string, string> };
