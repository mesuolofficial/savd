"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAction } from "@/lib/activityLog";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import { sanitizeHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";

export async function createAlbumAction(_prevState: any, fd: FormData) {
  const admin = await requireAdmin("gallery", "full");
  
  const title = String(fd.get("title") || "").trim();
  const description = sanitizeHtml(String(fd.get("description") || "").trim());
  const competitionId = String(fd.get("competitionId") || "") || null;
  const externalUrl = String(fd.get("externalUrl") || "").trim() || null;
  const isPublished = fd.get("isPublished") === "on";

  if (!title) return { error: "Title is required." };

  try {
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.galleryAlbum.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const album = await prisma.galleryAlbum.create({
      data: { 
        slug, 
        title, 
        description, 
        competitionId, 
        externalUrl, 
        isPublished,
        createdById: admin.id
      },
    });
    await logAction(admin, `Created gallery album "${album.title}"`);
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
  } catch (e) {
    console.error(e);
    return { error: "Failed to create album." };
  }

  // IMPORTANT: redirect() must be OUTSIDE the try/catch block
  redirect("/admin/gallery?msg=created");
}

export async function updateAlbumAction(id: string, _prevState: any, fd: FormData) {
  const admin = await requireAdmin("gallery", "full");
  
  const title = String(fd.get("title") || "").trim();
  const description = sanitizeHtml(String(fd.get("description") || "").trim());
  const competitionId = String(fd.get("competitionId") || "") || null;
  const externalUrl = String(fd.get("externalUrl") || "").trim() || null;
  const isPublished = fd.get("isPublished") === "on";

  if (!title) return { error: "Title is required." };

  try {
    const album = await prisma.galleryAlbum.update({
      where: { id },
      data: { title, description, competitionId, externalUrl, isPublished },
    });
    await logAction(admin, `Updated gallery album "${album.title}"`);
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath(`/gallery/${album.slug}`);
    return { ok: true, msg: "Album updated." };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update album." };
  }
}

export async function toggleAlbumPublishAction(id: string, isPublished: boolean) {
  const admin = await requireAdmin("gallery", "full");
  await prisma.galleryAlbum.update({ where: { id }, data: { isPublished } });
  await logAction(admin, `${isPublished ? "Published" : "Unpublished"} album ID ${id}`);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function setCoverImageAction(albumId: string, mediaId: string) {
  const admin = await requireAdmin("gallery", "full");
  const media = await prisma.galleryMedia.findUnique({ where: { id: mediaId } });
  if (!media) return;

  await prisma.galleryAlbum.update({
    where: { id: albumId },
    data: { coverImage: media.file },
  });
  await logAction(admin, `Set cover image for album ID ${albumId}`);
  revalidatePath(`/admin/gallery/${albumId}`);
  revalidatePath("/gallery");
}

export async function deleteAlbumAction(id: string) {
  const admin = await requireAdmin("gallery", "full");
  const album = await prisma.galleryAlbum.findUnique({ where: { id }, include: { media: true } });
  if (!album) return;

  for (const m of album.media) {
    await deleteUploadedFile(m.file);
  }

  await prisma.galleryAlbum.delete({ where: { id } });
  await logAction(admin, `Deleted gallery album "${album.title}" and its media`);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery?msg=deleted");
}

// FIXED: Removed .bind() logic, we will pass albumId via hidden input
export async function uploadGalleryMediaAction(fd: FormData) {
  const admin = await requireAdmin("gallery", "full");
  
  const albumId = String(fd.get("albumId"));
  const type = fd.get("type") as "PHOTO" | "VIDEO";
  const files = fd.getAll("files") as File[];
  
  if (!files || files.length === 0) return { error: "No files selected." };

  try {
    for (const file of files) {
      if (file.size === 0) continue;
      const allowed = type === "PHOTO" ? ["image/jpeg", "image/png", "image/webp"] : ["video/mp4", "video/webm"];
      const filePath = await saveUploadedFile(file, "gallery", allowed);
      await prisma.galleryMedia.create({
        data: { albumId, type, file: filePath },
      });
    }
    await logAction(admin, `Uploaded media to album ID ${albumId}`);
    revalidatePath(`/admin/gallery/${albumId}`);
    revalidatePath("/gallery");
    return { ok: true, msg: "Media uploaded successfully." };
  } catch (e) {
    console.error(e);
    return { error: "Failed to upload media." };
  }
}

export async function deleteMediaAction(mediaId: string, albumId: string) {
  const admin = await requireAdmin("gallery", "full");
  const media = await prisma.galleryMedia.findUnique({ where: { id: mediaId } });
  if (!media) return;

  await deleteUploadedFile(media.file);
  await prisma.galleryMedia.delete({ where: { id: mediaId } });
  await logAction(admin, `Deleted media from album ID ${albumId}`);
  revalidatePath(`/admin/gallery/${albumId}`);
  revalidatePath("/gallery");
}