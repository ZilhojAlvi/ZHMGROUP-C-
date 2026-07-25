import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { Role } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  // Fail loudly in production if the secret was never configured.
  throw new Error("JWT_SECRET environment variable is not set.");
}

// Fallback only used for local dev convenience; always set JWT_SECRET in .env.
const secretKey = new TextEncoder().encode(JWT_SECRET || "dev-only-insecure-secret-change-me");

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionTokenPayload extends JWTPayload {
  sub: string; // userId
  sid: string; // session id (for server-side revocation)
  role: Role;
  email: string;
}

export async function signSessionToken(payload: SessionTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(secretKey);
}

export async function verifySessionToken(
  token: string
): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as SessionTokenPayload;
  } catch {
    return null;
  }
}

/** Signs a short-lived, single-purpose token (email verification / password reset). */
export async function signPurposeToken(
  userId: string,
  purpose: "email_verify" | "password_reset",
  ttlSeconds: number
): Promise<string> {
  return new SignJWT({ sub: userId, purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secretKey);
}

export async function verifyPurposeToken(
  token: string,
  purpose: "email_verify" | "password_reset"
): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.purpose !== purpose || typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
