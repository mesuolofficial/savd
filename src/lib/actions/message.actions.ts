"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import { sendEmail, adminAlertEmails } from "@/lib/mail/brevo";
import { renderContactAcknowledgement, renderAdminNewContactMessage } from "@/lib/mail/templates";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function submitContactMessage(prevState: any, fd: FormData) {
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const subject = String(fd.get("subject") || "").trim();
  const message = String(fd.get("message") || "").trim();
  const file = fd.get("image") as File | null;

  if (!name || !email || !subject || !message) return { error: "All fields are required." };

  let imagePath = null;
  if (file && file.size > 0) {
    try { imagePath = await saveUploadedFile(file, "messages", ["image/jpeg", "image/png", "image/gif", "image/webp"]); }
    catch (e) { return { error: (e as Error).message }; }
  }

  try {
    await prisma.contactMessage.create({
      data: { name, email, subject, message, imageFile: imagePath },
    });

    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    
    // 1. Send Acknowledgement to User
    await sendEmail({
      to: [{ email, name }],
      subject: `We received your message: ${subject}`,
      html: renderContactAcknowledgement({ name, subject, message }),
    });

    // 2. Send Alert to Admins
    const admins = adminAlertEmails();
    if (admins.length > 0) {
      await sendEmail({
        to: admins.map(e => ({ email: e })),
        subject: `New Contact Message: ${subject}`,
        html: renderAdminNewContactMessage({ name, email, subject, adminUrl: `${siteUrl}/admin/messages` }),
      });
    }

    return { ok: true, msg: "Your message has been sent successfully. We'll get back to you soon!" };
  } catch (e) {
    console.error(e);
    return { error: "Failed to send message. Please try again." };
  }
}

export async function updateMessageStatusAction(id: string, status: "READ" | "REPLIED" | "UNREAD") {
  await requireAdmin("messages", "full");
  await prisma.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
}

export async function deleteMessageAction(id: string) {
  const admin = await requireAdmin("messages", "full");
  const msg = await prisma.contactMessage.findUnique({ where: { id } });
  if (!msg) return;

  if (msg.imageFile) await deleteUploadedFile(msg.imageFile);
  await prisma.contactMessage.delete({ where: { id } });
  await logAction(admin, `Deleted contact message from ${msg.email}`);
  
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}