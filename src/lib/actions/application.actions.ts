"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { saveUploadedFile } from "@/lib/upload";
import { sendEmail, adminAlertEmails } from "@/lib/mail/brevo";
import { renderAdminNewApplication } from "@/lib/mail/templates";

export async function submitApplicationAction(fd: FormData) {
  const type = fd.get("type") as "sponsor" | "partner" | "ambassador";
  const name = String(fd.get("name") || "");
  const email = String(fd.get("email") || "");
  const phone = String(fd.get("phone") || "");
  const institution = String(fd.get("institution") || "");
  
  if (!name || !email) return { error: "Name and email are required." };

  try {
    if (type === "sponsor") {
      await prisma.sponsor.create({
        data: {
          name,
          websiteUrl: String(fd.get("website") || ""),
          contactName: String(fd.get("contactName") || ""),
          contactEmail: email,
          contactPhone: phone,
          message: String(fd.get("message") || ""),
          status: "PENDING",
        },
      });
    } else if (type === "partner") {
      let logoWithBg = null;
      let logoTransparent = null;
      
      const fileBg = fd.get("logoWithBg") as File | null;
      if (fileBg && fileBg.size > 0) logoWithBg = await saveUploadedFile(fileBg, "partners");
      
      const fileTrans = fd.get("logoTransparent") as File | null;
      if (fileTrans && fileTrans.size > 0) logoTransparent = await saveUploadedFile(fileTrans, "partners");

      const code = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) + Math.floor(Math.random() * 100);
      
      await prisma.partner.create({
        data: {
          name,
          type: "SOCIETY",
          institution,
          campus: String(fd.get("campus") || ""),
          city: String(fd.get("city") || ""),
          socialMediaUrl: String(fd.get("socialMediaUrl") || ""),
          advisorName: String(fd.get("advisorName") || ""),
          advisorEmail: String(fd.get("advisorEmail") || ""),
          advisorPhone: String(fd.get("advisorPhone") || ""),
          presidentName: String(fd.get("presidentName") || ""),
          presidentEmail: String(fd.get("presidentEmail") || ""),
          presidentPhone: String(fd.get("presidentPhone") || ""),
          presidentSocial: String(fd.get("presidentSocial") || ""),
          contactName: String(fd.get("contactName") || ""),
          contactDesignation: String(fd.get("contactDesignation") || ""),
          contactEmail: email,
          contactPhone: phone,
          logoWithBg,
          logoTransparent,
          additionalInfo: String(fd.get("additionalInfo") || ""),
          submittedBy: String(fd.get("submittedBy") || ""),
          submittedByDesignation: String(fd.get("submittedByDesignation") || ""),
          referralCode: code,
          status: "PENDING",
        },
      });
    } else {
      const code = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) + Math.floor(Math.random() * 100);
      await prisma.partner.create({
        data: {
          name,
          type: "AMBASSADOR",
          institution,
          contactName: name,
          contactEmail: email,
          contactPhone: phone,
          additionalInfo: String(fd.get("message") || ""),
          referralCode: code,
          status: "PENDING",
        },
      });
    }

    // SEND ADMIN ALERT EMAIL
    const admins = adminAlertEmails();
    if (admins.length) {
      const siteUrl = process.env.SITE_URL || "http://localhost:3000";
      const html = renderAdminNewApplication({
        type: type.toUpperCase(),
        name,
        email,
        phone,
        institution,
        adminUrl: `${siteUrl}/admin/applications`,
      });
      await sendEmail({
        to: admins.map((e) => ({ email: e })),
        subject: `New ${type} Application: ${name}`,
        html,
      });
    }

    revalidatePath("/sponsors");
    return { ok: true };
  } catch (e) {
    console.error("Application error:", e);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function updateApplicationStatusAction(fd: FormData) {
  const admin = await requireAdmin("sponsors", "full");
  const id = String(fd.get("id"));
  const type = String(fd.get("type"));
  const status = fd.get("status") as "APPROVED" | "REJECTED";

  if (type === "sponsor") {
    await prisma.sponsor.update({ where: { id }, data: { status } });
  } else {
    await prisma.partner.update({ where: { id }, data: { status } });
  }

  await logAction(admin, `Marked ${type} application ${id} as ${status}`);
  revalidatePath("/admin/applications");
  revalidatePath("/sponsors");
}