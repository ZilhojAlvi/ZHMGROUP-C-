import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema, firstZodError } from "@/lib/auth/validators";
import { generateRawToken, hashToken } from "@/lib/auth/hash";
import { sendVerificationEmail } from "@/lib/auth/email";
import { apiError, apiOk } from "@/lib/apiHelpers";
import { checkRateLimit, getClientIp } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`resend-verify:${ip}`, 5, 15 * 60 * 1000);
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

  // Always respond the same way, whether or not the account exists / is already verified.
  const genericResponse = apiOk({
    message: "If that account exists and isn't verified yet, a new verification email has been sent.",
  });

  if (!user || user.isEmailVerified) return genericResponse;

  const rawToken = generateRawToken();
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      type: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  try {
    await sendVerificationEmail(user.email, user.profile?.fname || "there", rawToken);
  } catch (err) {
    console.error("[resend-verification] failed to send email:", err);
  }

  return genericResponse;
}
