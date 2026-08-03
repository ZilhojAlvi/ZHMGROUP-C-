import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema, firstZodError } from "@/lib/auth/validators";
import { signSessionToken, ACCESS_TOKEN_TTL_SECONDS } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/cookies";
import { hashToken } from "@/lib/auth/hash";
import { apiError, logActivity } from "@/lib/apiHelpers";
import { checkRateLimit, getClientIp } from "@/lib/auth/rateLimit";
import { mapUser } from "@/lib/mappers";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
  if (!rl.allowed) {
    return apiError("Too many login attempts. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body.", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(firstZodError(parsed.error), 422);
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });

  // Constant-shape error to avoid leaking whether the email exists.
  const genericError = "Incorrect email or password.";

  if (!user) {
    return apiError(genericError, 401);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return apiError(
      "This account is temporarily locked due to repeated failed login attempts. Please try again later or reset your password.",
      423
    );
  }

  if (!user.isActive) {
    return apiError("This account has been deactivated. Contact an administrator.", 403);
  }

  if (!user.passwordHash) {
    // Account was created via "Sign in with Google" — it has no password.
    return apiError(
      "This account uses Google Sign-In. Please continue with Google instead of a password.",
      401
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);

  if (!validPassword) {
    const failedCount = user.failedLoginCount + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: failedCount,
        lockedUntil:
          failedCount >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS) : undefined,
      },
    });
    await logActivity({ userId: user.id, action: "auth.login_failed", ipAddress: ip });
    return apiError(genericError, 401);
  }

 if (!user.isEmailVerified) {
    return apiError(
      "Please verify your email address before logging in. Check your inbox for the verification link.",
      403,
      { code: "EMAIL_NOT_VERIFIED" }
    );
  }

  // Reset failed-attempt counter on success.
  if (user.failedLoginCount > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }

  const sessionId = randomUUID();
  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      tokenHash: hashToken(sessionId + user.id),
      userAgent: req.headers.get("user-agent") || undefined,
      ipAddress: ip,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000),
    },
  });

  const token = await signSessionToken({
    sub: user.id,
    sid: session.id,
    role: user.role,
    email: user.email,
  });

  await logActivity({ userId: user.id, action: "auth.login_success", ipAddress: ip });

  const res = NextResponse.json({ user: mapUser(user) }, { status: 200 });
  setSessionCookie(res, token);
  return res;
}
