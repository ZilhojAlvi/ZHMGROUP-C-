import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyGoogleIdToken } from "@/lib/auth/google";
import { signSessionToken, ACCESS_TOKEN_TTL_SECONDS } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/cookies";
import { hashToken } from "@/lib/auth/hash";
import { apiError, logActivity } from "@/lib/apiHelpers";
import { checkRateLimit, getClientIp } from "@/lib/auth/rateLimit";
import { mapUser } from "@/lib/mappers";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`google-login:${ip}`, 20, 15 * 60 * 1000);
  if (!rl.allowed) {
    return apiError("Too many attempts. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body.", 400);
  }

  const credential = (body as { credential?: string } | null)?.credential;
  if (!credential || typeof credential !== "string") {
    return apiError("Missing Google credential.", 422);
  }

  // Verifies the token against Google's servers — this is what guarantees
  // the account is a real, Google-verified Gmail/Google account and not a
  // forged request.
  const profile = await verifyGoogleIdToken(credential);
  if (!profile) {
    return apiError("Could not verify this Google account. Please try again.", 401);
  }

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.googleId }, { email: profile.email }] },
    include: { profile: true },
  });

  if (user) {
    if (!user.isActive) {
      return apiError("This account has been deactivated. Contact an administrator.", 403);
    }
    // Existing email/password account signing in with Google for the first
    // time — link it, and upgrade isEmailVerified since Google already
    // verified this address.
    if (!user.googleId || !user.isEmailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.googleId, isEmailVerified: true },
        include: { profile: true },
      });
    }
  } else {
    // Brand-new account — created directly as verified since Google already
    // confirmed the email for us. No password is set (passwordHash: null),
    // so this account can only ever sign in via Google.
    user = await prisma.user.create({
      data: {
        email: profile.email,
        googleId: profile.googleId,
        role: "customer",
        isEmailVerified: true,
        profile: {
          create: {
            fname: profile.fname,
            lname: profile.lname,
            avatarUrl: profile.avatarUrl,
          },
        },
      },
      include: { profile: true },
    });
    await logActivity({ userId: user.id, action: "user.signup_google", ipAddress: ip });
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

  await logActivity({ userId: user.id, action: "auth.login_success_google", ipAddress: ip });

  const res = NextResponse.json({ user: mapUser(user) }, { status: 200 });
  setSessionCookie(res, token);
  return res;
}
