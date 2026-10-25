import "server-only";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/activityLog";
import { LOCKOUT_MS, MAX_LOGIN_ATTEMPTS } from "@/lib/constants";
import { getAccess, type Access, type AdminModule } from "@/lib/permissions";

export const hashPassword = (plain: string) => hash(plain, 12);

// Used so that "no such email" costs the same time as "wrong password"
// (stops attackers learning which emails are real by measuring response time).
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= hash("savd-timing-equaliser", 12));

export type LoginResult =
  | { ok: true; admin: { id: string; name: string } }
  | { ok: false; reason: "invalid"; attemptsLeft?: number }
  | { ok: false; reason: "locked"; lockedUntil: Date }
  | { ok: false; reason: "inactive" };

/**
 * FR-24: bcrypt check + 5 failures => 15-minute lock. While locked, even the
 * CORRECT password is refused. The failure counter is incremented atomically in
 * the database, so parallel guesses can't sneak past the limit.
 */
export async function attemptLogin(rawEmail: string, password: string): Promise<LoginResult> {
  const email = rawEmail.trim().toLowerCase();
  const now = new Date();
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) {
    await compare(password, await getDummyHash());
    return { ok: false, reason: "invalid" };
  }

  if (admin.lockedUntil && admin.lockedUntil > now) {
    return { ok: false, reason: "locked", lockedUntil: admin.lockedUntil };
  }

  const valid = await compare(password, admin.passwordHash);

  if (!valid) {
    const { failedAttempts } = await prisma.admin.update({
      where: { id: admin.id },
      data: { failedAttempts: { increment: 1 } },
      select: { failedAttempts: true },
    });

    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date(now.getTime() + LOCKOUT_MS);
      await prisma.admin.update({ where: { id: admin.id }, data: { failedAttempts: 0, lockedUntil } });
      await logAction(admin, `Account locked for ${LOCKOUT_MS / 60000} minutes after ${MAX_LOGIN_ATTEMPTS} failed sign-in attempts`);
      return { ok: false, reason: "locked", lockedUntil };
    }
    return { ok: false, reason: "invalid", attemptsLeft: MAX_LOGIN_ATTEMPTS - failedAttempts };
  }

  // Password was right — only now do we reveal that the account is switched off.
  if (!admin.isActive) return { ok: false, reason: "inactive" };

  await prisma.admin.update({
    where: { id: admin.id },
    data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: now },
  });
  return { ok: true, admin: { id: admin.id, name: admin.name } };
}

/**
 * Guard for every admin page and Server Action (FR-24: "every admin page, with no
 * exceptions, checks authentication AND role"). Layouts are not re-run on every
 * client navigation, so this must be called by each page — the layout alone is not a guard.
 */
export async function requireAdmin(module: AdminModule, need: Access = "view") {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const access = getAccess(session.admin, module);
  if (!access || (need === "full" && access !== "full")) redirect("/admin/dashboard?denied=1");

  return session.admin;
}
