import "server-only";
import { prisma } from "@/lib/prisma";
import { createHash, randomInt } from "node:crypto";
import { OTP_TTL_MS, OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS } from "@/lib/constants";
import { sendEmail } from "@/lib/mail/brevo";
import { renderOtpEmail } from "@/lib/mail/templates";

export type OtpPurpose = "POST_REVIEW" | "MANAGE_TEAM";

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function createAndSendOtp(email: string, purpose: OtpPurpose) {
  const existing = await prisma.participantOtp.findFirst({
    where: { email, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (existing && new Date().getTime() - new Date(existing.lastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS) {
    return { ok: false, error: "Please wait before requesting a new code." };
  }

  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.participantOtp.create({
    data: { email, purpose, codeHash: hashCode(code), expiresAt, lastSentAt: new Date() },
  });

  // Send actual email
  try {
    const html = renderOtpEmail({ code, purpose });
    await sendEmail({
      to: [{ email }],
      subject: `Your SAVD Verification Code: ${code}`,
      html,
    });
  } catch (e) {
    console.error("Failed to send OTP email", e);
    return { ok: false, error: "Failed to send email. Try again." };
  }

  return { ok: true, message: "If this email is registered, a code has been sent." };
}

export async function verifyOtp(email: string, purpose: OtpPurpose, code: string) {
  const otp = await prisma.participantOtp.findFirst({
    where: { email, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { ok: false, error: "Invalid code." };
  if (otp.expiresAt < new Date()) return { ok: false, error: "Code has expired." };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, error: "Too many attempts." };

  if (otp.codeHash !== hashCode(code)) {
    await prisma.participantOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "Invalid code." };
  }

  await prisma.participantOtp.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  return { ok: true };
}