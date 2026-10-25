"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { sendEmail } from "@/lib/mail/brevo";
import { renderReviewSubmitted, renderReviewPublished, renderReviewReply } from "@/lib/mail/templates";
import { reviewSchema } from "@/lib/validators/review.schema";

export async function submitReviewAction(email: string, fd: FormData) {
  const raw = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid data." };

  const person = await prisma.person.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (!person) return { error: "Person not found." };

  const comp = await prisma.competition.findUnique({ where: { id: parsed.data.competitionId } });
  if (!comp) return { error: "Competition not found." };

  try {
    await prisma.review.create({
      data: { competitionId: comp.id, personId: person.id, role: parsed.data.role as any, text: parsed.data.text, status: "PENDING" },
    });

    if (person.email) {
      const html = renderReviewSubmitted({ name: person.name, title: comp.title, siteUrl: process.env.SITE_URL || "http://localhost:3000" });
      await sendEmail({ to: [{ email: person.email, name: person.name }], subject: "Review Received — SAVD", html });
    }

    return { ok: true, msg: "Review submitted for approval." };
  } catch (e) {
    return { error: "Database error." };
  }
}

export async function updateReviewStatusAction(id: string, status: "PUBLISHED" | "PENDING") {
  const admin = await requireAdmin("reviews", "full");
  const review = await prisma.review.update({
    where: { id },
    data: { status, publishedAt: status === "PUBLISHED" ? new Date() : null },
    include: { person: true, competition: true },
  });

  if (status === "PUBLISHED" && review.person.email) {
    const html = renderReviewPublished({ name: review.person.name, title: review.competition.title, reviewUrl: `${process.env.SITE_URL}/reviews#review-${review.id}` });
    await sendEmail({ to: [{ email: review.person.email, name: review.person.name }], subject: "Your Review is Live — SAVD", html });
  }

  await logAction(admin, `Marked review ${id} as ${status}`);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

export async function replyToReviewAction(id: string, fd: FormData) {
  const admin = await requireAdmin("reviews", "full");
  const message = String(fd.get("message") || "").trim();
  if (!message) return { error: "Message is required." };

  const reply = await prisma.reviewReply.create({
    data: { reviewId: id, adminId: admin.id, message },
    include: { review: { include: { person: true, competition: true } } },
  });

  const { review } = reply;
  if (review.person.email) {
    const html = renderReviewReply({ name: review.person.name, title: review.competition.title, replyText: message, reviewUrl: `${process.env.SITE_URL}/reviews#review-${review.id}` });
    await sendEmail({ to: [{ email: review.person.email, name: review.person.name }], subject: "New Reply to Your Review — SAVD", html });
  }

  await logAction(admin, `Replied to review ${id}`);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  return { ok: true };
}

export async function deleteReviewAction(id: string) {
  const admin = await requireAdmin("reviews", "full");
  await prisma.review.delete({ where: { id } });
  await logAction(admin, `Deleted review ${id}`);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}