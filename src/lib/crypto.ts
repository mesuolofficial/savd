import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const secret = process.env.APP_SECRET;

if (!secret) {
  console.warn("WARNING: APP_SECRET is not set. Admin temp passwords cannot be encrypted securely.");
}

// Derive a 32-byte key from the secret
const getKey = () => {
  const s = secret || "fallback-insecure-secret-please-set-app-secret";
  return scryptSync(s, "savd-salt", 32);
};

export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(hash: string): string {
  try {
    const [ivHex, authTagHex, encryptedHex] = hash.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    
    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted, undefined, "utf8") + decipher.final("utf8");
  } catch (e) {
    return "";
  }
}

export function generateTempPassword(): string {
  // Generate a readable 12-char password (e.g., x8F2-k9Lm-3Qpz)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) pwd += "-";
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}