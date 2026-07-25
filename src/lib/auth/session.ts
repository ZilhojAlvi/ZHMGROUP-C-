import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types";
import { SESSION_COOKIE_NAME } from "./cookies";
import { verifySessionToken } from "./jwt";

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  sessionId: string;
}

/**
 * Resolves the authenticated user for the current request from the
 * httpOnly session cookie. Verifies the JWT signature/expiry AND checks
 * that the corresponding server-side Session row hasn't been revoked
 * (e.g. by logout), so logout / "sign out everywhere" takes effect
 * immediately even though the JWT itself would still be valid.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sid },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (!session.user || !session.user.isActive) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    isActive: session.user.isActive,
    isEmailVerified: session.user.isEmailVerified,
    sessionId: session.id,
  };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Throws AuthError(401) if not authenticated, or AuthError(403) if role not permitted. */
export async function requireUser(allowedRoles?: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Authentication required.", 401);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError("You do not have permission to perform this action.", 403);
  }
  return user;
}
