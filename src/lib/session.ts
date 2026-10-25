import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/constants";
import type { SessionAdmin } from "@/types";

/**
 * Server-side sessions (FR-24).
 *  - The browser holds an opaque random token in an httpOnly cookie.
 *  - The database stores only the SHA-256 of that token (a DB leak can't be replayed).
 *  - A fresh token is issued on every login (session-ID regeneration).
 *  - Deactivating an admin ends their sessions immediately (getSession re-checks isActive).
 */

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(adminId: string, meta: { ip?: string | null; userAgent?: string | null } = {}) {
  const jar = await cookies();

  // Regenerate: drop whatever session this browser presented, plus any expired ones.
  const old = jar.get(SESSION_COOKIE)?.value;
  if (old) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(old) } });
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.adminSession.create({
    data: {
      tokenHash: hashToken(token),
      adminId,
      expiresAt,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent?.slice(0, 300) ?? null,
    },
  });

  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** The current admin, or null. Memoised per request, so calling it many times is free. */
export const getSession = cache(async (): Promise<{ sessionId: string; admin: SessionAdmin } | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true },
  });
  if (!session || session.expiresAt <= new Date() || !session.admin.isActive) return null;

  const a = session.admin;
  return {
    sessionId: session.id,
    admin: { id: a.id, name: a.name, email: a.email, role: a.role, readOnly: a.readOnly, competitionId: a.competitionId },
  };
});

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}

/** Force-logout an admin everywhere (password change, deactivation, "unlock & reset"). */
export async function destroyAllSessionsFor(adminId: string) {
  await prisma.adminSession.deleteMany({ where: { adminId } });
}
