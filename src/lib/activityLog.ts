import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * FR-17 — every significant admin action goes through here.
 * Pass the admin ({ id, name }) or null for system events.
 * A logging failure is reported to the server console but never blocks the action itself.
 */
export async function logAction(admin: { id: string; name: string } | null, action: string): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { adminId: admin?.id ?? null, adminName: admin?.name ?? "System", action },
    });
  } catch (error) {
    console.error("[activityLog] failed to write:", action, error);
  }
}
