import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  id: 1, siteTitle: "SAVD", adminEmail: null as string | null, contactPhone: null as string | null,
  contactAddress: "University of Lahore, 1-Km Raiwind Road, Lahore, Pakistan" as string | null,
  facebookUrl: null as string | null, instagramUrl: null as string | null, twitterUrl: null as string | null,
  maintenanceMode: false, globalRegistrationOpen: true,
  sponsorOpen: true, partnerOpen: true, ambassadorOpen: true, // 👈 YEH 3 FIELDS ADD KAREIN
};

/** Site-wide settings (FR-18). Falls back to defaults on a fresh database. */
export const getSettings = cache(async () => {
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return row ? { ...DEFAULTS, ...row } : DEFAULTS;
});