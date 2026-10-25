"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { createHash, randomInt } from "node:crypto";
import { attemptLogin } from "@/lib/auth";
import { createSession, destroySession, getSession } from "@/lib/session";
import { logAction } from "@/lib/activityLog";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail/brevo";
import { renderOtpEmail } from "@/lib/mail/templates";
import { OTP_TTL_MS, OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS } from "@/lib/constants";
import type { LoginState } from "@/types";
import { saveUploadedFile } from "@/lib/upload"; // <--- Ensure yeh import hai

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

function safeNext(raw: FormDataEntryValue | null): string {
  const s = typeof raw === "string" ? raw : "";
  const ok = s.startsWith("/admin") && !s.startsWith("//") && !s.startsWith("/admin/login");
  return ok ? s : "/admin/dashboard";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  if (!rateLimit(`admin-login:${ip}`, 20, 10 * 60 * 1000).ok) {
    return { error: "Too many sign-in attempts from this network. Please wait a few minutes and try again." };
  }

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email address and your password." };

  const result = await attemptLogin(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    if (result.reason === "locked") {
      return {
        error: "Too many failed attempts. This account is temporarily locked.",
        lockedUntil: result.lockedUntil.toISOString(),
      };
    }
    if (result.reason === "inactive") return { error: "This account has been deactivated. Contact a super admin." };
    const showLeft = result.attemptsLeft !== undefined && result.attemptsLeft <= 2;
    return { error: "Incorrect email or password.", attemptsLeft: showLeft ? result.attemptsLeft : undefined };
  }

  await createSession(result.admin.id, { ip, userAgent: h.get("user-agent") });
  await logAction(result.admin, "Signed in");

  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  const session = await getSession();
  if (session) await logAction(session.admin, "Signed out");
  await destroySession();
  redirect("/admin/login");
}

// ==========================================
// FORGOT PASSWORD FLOW (OTP)
// ==========================================
const hashOtp = (code: string) => createHash("sha256").update(code).digest("hex");

// STEP 1: Request OTP
export async function requestPasswordResetAction(prevState: any, fd: FormData) {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Email is required." };

  const admin = await prisma.admin.findUnique({ where: { email } });

  // Security: Do not reveal if email exists
  if (!admin) return { success: "If an account with that email exists, an OTP has been sent." };

  const recentOtp = await prisma.adminResetOtp.findFirst({
    where: { adminId: admin.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp && Date.now() - recentOtp.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
    return { error: "Please wait a minute before requesting a new code." };
  }

  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.adminResetOtp.create({
    data: { adminId: admin.id, codeHash: hashOtp(code), expiresAt, attempts: 0, lastSentAt: new Date() },
  });

  const html = renderOtpEmail({ code, purpose: "ADMIN_RESET" });
  await sendEmail({
    to: [{ email: admin.email, name: admin.name }],
    subject: `SAVD Admin Password Reset Code`,
    html,
  });

  return { success: "OTP sent! Check your email.", email };
}

// STEP 2: Verify OTP (Without changing password yet)
export async function verifyOtpOnlyAction(prevState: any, fd: FormData) {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const code = String(fd.get("code") || "").trim();

  if (!email || !code) return { error: "Email and OTP are required." };

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return { error: "Invalid request." };

  const otpRecord = await prisma.adminResetOtp.findFirst({
    where: { adminId: admin.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) return { error: "No active OTP found. Please request a new one." };
  if (otpRecord.expiresAt < new Date()) return { error: "OTP has expired. Please request a new one." };
  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) return { error: "Too many failed attempts. Please request a new code." };

  if (otpRecord.codeHash !== hashOtp(code)) {
    await prisma.adminResetOtp.update({ where: { id: otpRecord.id }, data: { attempts: { increment: 1 } } });
    return { error: "Incorrect OTP." };
  }

  // Success: Return code and email so the frontend can move to Step 3
  return { success: true, email, code };
}

// STEP 3: Set New Password
export async function resetPasswordAction(prevState: any, fd: FormData) {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const code = String(fd.get("code") || "").trim();
  const newPassword = String(fd.get("password") || "");

  if (!email || !code || !newPassword) return { error: "All fields are required." };
  if (newPassword.length < 12) return { error: "Password must be at least 12 characters long." };

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return { error: "Invalid request." };

  const otpRecord = await prisma.adminResetOtp.findFirst({
    where: { adminId: admin.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) return { error: "No active OTP found. Please request a new one." };
  if (otpRecord.expiresAt < new Date()) return { error: "OTP has expired. Please request a new one." };
  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) return { error: "Too many failed attempts. Please request a new code." };

  // Double check OTP (safety)
  if (otpRecord.codeHash !== hashOtp(code)) {
    await prisma.adminResetOtp.update({ where: { id: otpRecord.id }, data: { attempts: { increment: 1 } } });
    return { error: "Incorrect OTP." };
  }

  const passwordHash = await hash(newPassword, 12);

  await prisma.$transaction([
    prisma.admin.update({ where: { id: admin.id }, data: { passwordHash, tempPasswordEnc: null } }),
    prisma.adminResetOtp.update({ where: { id: otpRecord.id }, data: { usedAt: new Date() } }),
    prisma.adminSession.deleteMany({ where: { adminId: admin.id } }), // Force logout everywhere
  ]);

  await logAction({ id: admin.id, name: admin.name }, "Reset password via OTP");
  return { success: "Password reset successfully. You can now sign in." };
}

// ==========================================
// CHANGE PASSWORD (LOGGED IN USER)
// ==========================================
export async function changePasswordAction(prevState: any, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const current = String(fd.get("currentPassword") || "");
  const newPass = String(fd.get("newPassword") || "");
  const confirm = String(fd.get("confirmPassword") || "");

  if (newPass !== confirm) return { error: "New passwords do not match." };
  if (newPass.length < 12) return { error: "Password must be at least 12 characters." };

  const admin = await prisma.admin.findUnique({ where: { id: session.admin.id } });
  if (!admin) return { error: "Admin not found." };

  const valid = await compare(current, admin.passwordHash);
  if (!valid) return { error: "Incorrect current password." };

  const passwordHash = await hash(newPass, 12);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash },
  });

  await logAction(session.admin, "Changed own password");
  return { success: "Password updated successfully." };
}

// ... (existing code)

export async function updateAdminAvatarAction(prevState: any, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const file = fd.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "Please select an image." };

  try {
    const filePath = await saveUploadedFile(file, "admins", ["image/jpeg", "image/png", "image/webp"]);
    
    await prisma.admin.update({
      where: { id: session.admin.id },
      data: { avatar: filePath },
    });

    await logAction(session.admin, "Updated profile avatar");
    return { success: "Profile picture updated successfully." };
  } catch (e) {
    return { error: "Failed to upload image." };
  }
}