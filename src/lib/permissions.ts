import type { AdminRole } from "@prisma/client";
import type { SessionAdmin } from "@/types";

/**
 * Role -> module access matrix. This is the single source of truth for
 * SAVD_DESIGN_LAYOUT_SPEC.md §C2. Entries the requirements do NOT specify
 * (marked † in the spec) are flagged below — changing one is a one-line edit.
 */

export const MODULES = [
  "dashboard",
  "competitions",
  "registrations",
  "teams",
  "results",
  "progress",
  "people",
  "certificates",
  "archives",
  "gallery",
  "reviews",
  "messages",
  "universities",
  "sponsors",
  "push",
  "admins",
  "activity-log",
  "settings",
  "apk",
] as const;

export type AdminModule = (typeof MODULES)[number];
export type Access = "full" | "view";

const everything = Object.fromEntries(MODULES.map((m) => [m, "full"])) as Record<AdminModule, Access>;

const MATRIX: Record<AdminRole, Partial<Record<AdminModule, Access>>> = {
  SUPER_ADMIN: everything,

  EVENT_MANAGER: {
    dashboard: "full",
    competitions: "full",
    registrations: "full",
    teams: "full",
    results: "full",
    progress: "full",
    archives: "full",
    people: "full", //        †
    certificates: "view", //  †
    gallery: "view", //       † (can link albums from the archive editor; cannot create/upload)
    reviews: "full", //       †
    messages: "full", //      †
    universities: "full", //  †
  },

  CERTIFICATE_MANAGER: {
    dashboard: "full",
    certificates: "full",
    people: "full", // †
  },

  REGISTRATION_REVIEWER: {
    dashboard: "full",
    registrations: "full", // downgraded to "view" when the account has readOnly = true
  },

  CONTENT_MANAGER: {
    dashboard: "full",
    gallery: "full",
    push: "full",
    reviews: "full", //   †
    messages: "full", //  †
    sponsors: "full", //  †
    apk: "full", //       (LATER)
  },
};

/** What can this admin do in this module? null = no access at all. */
export function getAccess(admin: Pick<SessionAdmin, "role" | "readOnly">, module: AdminModule): Access | null {
  const base = MATRIX[admin.role]?.[module] ?? null;
  if (!base) return null;
  // View-only accounts (FR-3) never get write access. Super admins are exempt.
  if (admin.readOnly && admin.role !== "SUPER_ADMIN") return "view";
  return base;
}

export const canView = (a: Pick<SessionAdmin, "role" | "readOnly">, m: AdminModule) => getAccess(a, m) !== null;
export const canEdit = (a: Pick<SessionAdmin, "role" | "readOnly">, m: AdminModule) => getAccess(a, m) === "full";

/** Prisma `where` fragment that limits queries to the admin's scoped competition, if any. */
export function competitionScope(admin: Pick<SessionAdmin, "competitionId">): { competitionId?: string } {
  return admin.competitionId ? { competitionId: admin.competitionId } : {};
}
