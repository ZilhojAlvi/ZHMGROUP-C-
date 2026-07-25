import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema, firstZodError } from "@/lib/auth/validators";
import { hashToken } from "@/lib/auth/hash";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { checkRateLimit, getClientIp } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) return apiError("Too many requests. Please try again later.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body.", 400);
  }
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

  const tokenHash = hashToken(parsed.data.token);
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });

  if (!record || record.type !== "PASSWORD_RESET" || record.usedAt || record.expiresAt < new Date()) {
    return apiError("This reset link is invalid or has expired. Please request a new one.", 400);
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, failedLoginCount: 0, lockedUntil: null },
    }),
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Revoke all existing sessions so a stolen session can't survive a password reset.
    prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await logActivity({ userId: record.userId, action: "auth.password_reset_completed", ipAddress: ip });

  return apiOk({ message: "Password reset successfully. You can now log in with your new password." });
}
