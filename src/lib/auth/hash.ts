import { createHash, randomBytes } from "crypto";

/** Generates a cryptographically random URL-safe token (used for email verification / reset links). */
export function generateRawToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** SHA-256 hashes a token so raw secrets are never persisted in the database. */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
