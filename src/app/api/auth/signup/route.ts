import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signupSchema, firstZodError } from "@/lib/auth/validators";
import { generateRawToken, hashToken } from "@/lib/auth/hash";
import { sendVerificationEmail } from "@/lib/auth/email";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { checkRateLimit, getClientIp } from "@/lib/auth/rateLimit";
import { mapUser } from "@/lib/mappers";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`signup:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return apiError("Too many signup attempts. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body.", 400);
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(firstZodError(parsed.error), 422);
  }
  const { fname, lname, email, password, phone, role, licenceNumber, agency } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return apiError("An account with that email already exists.", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      isEmailVerified: false,
      profile: {
        create: {
          fname,
          lname,
          phone: phone || null,
          ...(role === "agent"
            ? {
                licenceNumber: licenceNumber || `LIC-${Date.now().toString(36).toUpperCase()}`,
                agency: agency || "Independent",
                verificationStatus: "pending",
                rating: 0,
                propertiesListed: 0,
              }
            : {}),
        },
      },
    },
    include: { profile: true },
  });

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
    await sendVerificationEmail(user.email, fname, rawToken);
  } catch (err) {
    console.error("[signup] failed to send verification email:", err);
  }

  await logActivity({ userId: user.id, action: "user.signup", ipAddress: ip, metadata: { role } });

  return apiOk(
    {
      message: "Account created. Please check your email to verify your address before logging in.",
      user: mapUser(user),
    },
    201
  );
}
