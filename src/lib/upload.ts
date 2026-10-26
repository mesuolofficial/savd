import "server-only";
import { UTApi } from "uploadthing/server";
import { randomBytes } from "node:crypto";
import { inspect } from "node:util";

const utapi = new UTApi();

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/** Build a readable one-line message; UploadThing hides the real reason in .cause / .data. */
function describeError(error: any): string {
  const bits = [
    error?.message,
    error?.code,
    error?.cause?.message,
    error?.cause?.code,
    error?.cause?.status,
    typeof error?.data === "object" ? JSON.stringify(error.data) : error?.data,
  ].filter((x) => x !== undefined && x !== null && x !== "");
  return bits.length ? bits.join(" | ") : `${error?.name || "Error"} (no details)`;
}

export async function saveUploadedFile(
  file: File,
  folder: string = "general",
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  customName?: string
): Promise<string> {
  if (!file || file.size === 0) throw new Error("No file provided");

  if (file.size > 10 * 1024 * 1024) throw new Error("File must be under 10MB");

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
  }

  const ext = EXT_BY_TYPE[file.type] || (file.name.includes(".") ? file.name.split(".").pop()!.replace(/[^a-zA-Z0-9]/g, "") : "") || "bin";
  const baseName = customName
    ? customName.replace(/[^a-zA-Z0-9-]/g, "")
    : `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const safeFolder = folder.replace(/[^a-zA-Z0-9-]/g, "-");
  const filename = `${safeFolder}-${baseName}.${ext}`;

  try {
    const bytes = await file.arrayBuffer();
    const safeFile = new File([new Uint8Array(bytes)], filename, { type: file.type });

    const uploadResult = await utapi.uploadFiles(safeFile);

    if (uploadResult.error) {
      console.error("❌ UPLOADTHING API ERROR:\n", inspect(uploadResult.error, { depth: 8 }));
      throw uploadResult.error;
    }

    return uploadResult.data.url;
  } catch (error: any) {
    console.error(
      `❌ UPLOADTHING CRASH for ${filename} (${file.type}, ${file.size} bytes):\n`,
      inspect(error, { depth: 8 })
    );
    throw new Error(describeError(error));
  }
}

export async function deleteUploadedFile(fileUrl: string | null | undefined) {
  if (!fileUrl) return;
  try {
    const key = fileUrl.split("/").pop();
    if (key) await utapi.deleteFiles(key);
  } catch (error) {
    console.log(`[UploadThing Delete Error]`, error);
  }
}
