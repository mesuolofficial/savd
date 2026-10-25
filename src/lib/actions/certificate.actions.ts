"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import { sendEmail } from "@/lib/mail/brevo";
import { renderCertificateReady } from "@/lib/mail/templates";

// --- SINGLE ADD ---
export async function addCertificateAction(prevState: any, fd: FormData) {
  const admin = await requireAdmin("certificates", "full");
  const savdId = String(fd.get("savdId") || "").trim();
  const serial = String(fd.get("serial") || "").trim();
  const title = String(fd.get("title") || "Certificate of Participation").trim();
  const competitionId = String(fd.get("competitionId") || "") || null;
  const file = fd.get("file") as File | null;

  if (!savdId || !serial) return { error: "SAVD ID and Serial Number are required." };
  if (!file || file.size === 0) return { error: "Certificate image is required." };

  const person = await prisma.person.findUnique({ where: { savdId } });
  if (!person) return { error: `Person with SAVD ID "${savdId}" not found.` };

  const existingSerial = await prisma.certificate.findUnique({ where: { serial } });
  if (existingSerial) return { error: `Serial number "${serial}" is already in use.` };

  let filePath = "";
  
  try { 
    filePath = await saveUploadedFile(file, "certificates", ["image/jpeg", "image/png", "image/webp"], serial);
  } catch (e) { 
    return { error: (e as Error).message }; 
  }

  try {
    await prisma.certificate.create({
      data: { 
        personId: person.id, 
        competitionId, 
        serial, 
        title, 
        file: filePath, 
        thumb: filePath, // Same Cloud URL for thumbnail
        issueDate: new Date() 
      },
    });
    await logAction(admin, `Added certificate ${serial} for ${person.name}`);
    revalidatePath("/admin/certificates");
    return { ok: true, msg: "Certificate uploaded successfully." };
  } catch (e) { 
    console.error("DB Error:", e);
    return { error: "Database error while saving certificate." }; 
  }
}

// --- UPDATE/REPLACE IMAGE ---
export async function uploadCertificateImageAction(id: string, _prevState: any, fd: FormData) {
  const admin = await requireAdmin("certificates", "full");
  const file = fd.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Image is required." };

  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) return { error: "Certificate not found." };

  try {
    if (cert.file) await deleteUploadedFile(cert.file);

    const filePath = await saveUploadedFile(file, "certificates", ["image/jpeg", "image/png", "image/webp"], cert.serial);
    
    await prisma.certificate.update({ 
      where: { id }, 
      data: { file: filePath, thumb: filePath } 
    });
    
    await logAction(admin, `Replaced image for certificate ${cert.serial}`);
    revalidatePath("/admin/certificates");
    revalidatePath(`/admin/certificates/${id}/edit`);
    return { ok: true, msg: "Image updated successfully." };
  } catch (e) { 
    return { error: (e as Error).message }; 
  }
}

// --- UPDATE DETAILS (Including Person Change) ---
export async function updateCertificateAction(id: string, _prevState: any, fd: FormData) {
  const admin = await requireAdmin("certificates", "full");
  const savdId = String(fd.get("savdId") || "").trim();
  const serial = String(fd.get("serial") || "").trim();
  const title = String(fd.get("title") || "").trim();
  const competitionId = String(fd.get("competitionId") || "") || null;

  // Check if new SAVD ID exists
  const person = await prisma.person.findUnique({ where: { savdId } });
  if (!person) return { error: `Person with SAVD ID "${savdId}" not found.` };

  try {
    const cert = await prisma.certificate.update({
      where: { id },
      data: { 
        personId: person.id, // Update person
        serial, 
        title, 
        competitionId 
      },
    });
    await logAction(admin, `Updated certificate ${cert.serial} (Assigned to: ${person.name})`);
    revalidatePath("/admin/certificates");
    revalidatePath(`/admin/certificates/${id}/edit`);
    return { ok: true, msg: "Certificate details updated." };
  } catch (e) {
    return { error: "Failed to update. Serial might be duplicate." };
  }
}

// --- DELETE CERTIFICATE ---
export async function deleteCertificateAction(id: string) {
  const admin = await requireAdmin("certificates", "full");
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) return { error: "Certificate not found." };

  try {
    if (cert.file) await deleteUploadedFile(cert.file);
    await prisma.certificate.delete({ where: { id } });
    await logAction(admin, `Deleted certificate ${cert.serial}`);
    revalidatePath("/admin/certificates");
    return { ok: true };
  } catch (e) {
    return { error: "Failed to delete certificate." };
  }
}

// --- SEND NOTIFICATIONS ---
export async function notifyCertificateAction(scope: "ALL" | "PENDING" | "SELECTED", ids: string[] = []) {
  const admin = await requireAdmin("certificates", "full");
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const whereClause: any = { file: { not: null } };
  
  if (scope === "PENDING") whereClause.notifiedAt = null; 
  else if (scope === "SELECTED") whereClause.id = { in: ids };

  const certs = await prisma.certificate.findMany({
    where: whereClause,
    include: { person: true },
  });

  if (certs.length === 0) return { error: "No certificates found matching your request." };

  let sent = 0;
  const errors: string[] = [];
  const sentIds: string[] = [];

  for (const c of certs) {
    if (!c.person.email) continue;
    const html = renderCertificateReady({ name: c.person.name, title: c.title, serial: c.serial, siteUrl });
    const res = await sendEmail({ to: [{ email: c.person.email, name: c.person.name }], subject: `Your Certificate is Ready — ${c.title}`, html });
    if (res.ok) { sent++; sentIds.push(c.id); } 
    else { errors.push(`Failed for ${c.person.email}`); }
  }

  if (sentIds.length > 0) {
    await prisma.certificate.updateMany({ where: { id: { in: sentIds } }, data: { notifiedAt: new Date() } });
  }

  await logAction(admin, `Sent ${sent} certificate notifications (${scope})`);
  revalidatePath("/admin/certificates/notify");
  return { ok: true, sent, errors };
}

// 👇 YEH NAYA FUNCTION ADD KIYA GAYA HAI
export async function bulkAddCertificatesAction(prevState: any, formData: FormData) {
  const admin = await requireAdmin("certificates", "full");
  
  const competitionId = String(formData.get("competitionId") || "") || null;
  const title = String(formData.get("title") || "Certificate");
  const issueDateStr = String(formData.get("issueDate") || "");
  const csv = String(formData.get("csv") || "");

  if (!csv) return { error: "CSV data is empty." };

  const lines = csv.split("\n").map(l => l.trim()).filter(Boolean);
  let successCount = 0;
  let errors: string[] = [];

  for (const line of lines) {
    // Expecting: SAVD-0001, Ali Khan, MES-2608-0099
    const [savdId, _name, serial] = line.split(",").map(s => s.trim());
    
    if (!savdId || !serial) {
      errors.push(`Invalid line: ${line}`);
      continue;
    }

    try {
      const person = await prisma.person.findUnique({ where: { savdId } });
      if (!person) {
        errors.push(`Person with SAVD ID ${savdId} not found.`);
        continue;
      }

      await prisma.certificate.create({
        data: {
          personId: person.id,
          competitionId,
          serial,
          title,
          issueDate: issueDateStr ? new Date(issueDateStr) : null,
        }
      });
      successCount++;
    } catch (e: any) {
      if (e.code === 'P2002') {
        errors.push(`Serial ${serial} already exists.`);
      } else {
        errors.push(`Failed to add serial ${serial}.`);
      }
    }
  }

  if (errors.length > 0) {
    return { error: `Added ${successCount} certs. Errors: ${errors.join(" | ")}` };
  }

  await logAction(admin, `Bulk added ${successCount} certificates.`);
  revalidatePath("/admin/certificates");
  return { msg: `Successfully added ${successCount} certificates.` };
}