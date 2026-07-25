import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema, firstZodError } from "@/lib/auth/validators";
import { generateRawToken, hashToken } from "@/lib/auth/hash";
import { sendPasswordResetEmail } from "@/lib/auth/email";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { checkRateLimit, getClientIp } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) return apiError("Too many requests. Please try again later.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body.", 400);
  }
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { profile: true },
  });

  // Always return the same generic message, whether or not the account exists,
  // so the endpoint cannot be used to enumerate registered emails.
  const genericResponse = apiOk({
    message: "If an account with that email exists, a password reset link has been sent.",
  });

  if (!user) return genericResponse;

  const rawToken = generateRawToken();
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  try {
    await sendPasswordResetEmail(user.email, user.profile?.fname || "there", rawToken);
  } catch (err) {
    console.error("[forgot-password] failed to send email:", err);
  }

  await logActivity({ userId: user.id, action: "auth.password_reset_requested", ipAddress: ip });

  return genericResponse;
}
