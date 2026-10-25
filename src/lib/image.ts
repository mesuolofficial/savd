import "server-only";
import sharp from "sharp";
import { join } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";

export async function generateThumbnail(buffer: Buffer, folder: string, filename: string) {
  const uploadDir = join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  
  const thumbName = `thumb-${filename}`;
  const thumbPath = join(uploadDir, thumbName);

  // Resize to max 400px width/height, convert to jpeg/webp for compression
  await sharp(buffer)
    .resize({ width: 400, height: 400, fit: "inside" })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);

  return `/uploads/${folder}/${thumbName}`;
}