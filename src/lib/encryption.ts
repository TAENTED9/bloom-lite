import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV is recommended for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Derives a stable 32-byte key from the ENCRYPTION_KEY env var.
 * Using sha256 keeps the AES-256 key exactly 32 bytes regardless of the
 * length of the configured secret.
 */
function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error("ENCRYPTION_KEY must be set and at least 32 characters long");
  }
  return createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a UTF-8 string with AES-256-GCM.
 * Returns "iv:authTag:ciphertext", each part base64-encoded.
 */
export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

/**
 * Reverses {@link encrypt}. Throws if the payload is malformed or tampered with.
 */
export function decrypt(encrypted: string): string {
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format");
  }
  const [ivB64, authTagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted payload components");
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
