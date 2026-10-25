import "server-only";
import { UTApi } from "uploadthing/server";
import { randomBytes } from "node:crypto";

const utapi = new UTApi();

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

  const ext = file.name.split(".").pop() || "jpg";
  const baseName = customName 
    ? customName.replace(/[^a-zA-Z0-9-]/g, "") 
    : `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const filename = `${folder}-${baseName}.${ext}`;

  try {
    const bytes = await file.arrayBuffer();
    // Buffer fix for Next.js Server Actions
    const safeFile = new File([new Uint8Array(bytes)], filename, { type: file.type });
    
    const uploadResult = await utapi.uploadFiles(safeFile);

    if (uploadResult.error) {
      // THIS LOGS THE REAL ERROR
      console.error("❌ UPLOADTHING API ERROR:", uploadResult.error);
      throw new Error(uploadResult.error.message || "UploadThing rejected the file.");
    }
    
    return uploadResult.data.url;
  } catch (error: any) {
    console.error("❌ UPLOADTHING CRASH:", error);
    throw new Error(error.message || "Failed to upload file to cloud storage.");
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