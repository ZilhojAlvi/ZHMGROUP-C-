import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailSchema, firstZodError } from "@/lib/auth/validators";
import { hashToken } from "@/lib/auth/hash";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body.", 400);
  }

  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

  const tokenHash = hashToken(parsed.data.token);
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });

  if (!record || record.type !== "EMAIL_VERIFY" || record.usedAt || record.expiresAt < new Date()) {
    return apiError("This verification link is invalid or has expired.", 400);
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { isEmailVerified: true } }),
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  await logActivity({ userId: record.userId, action: "auth.email_verified" });

  return apiOk({ message: "Email verified successfully. You can now log in." });
}
