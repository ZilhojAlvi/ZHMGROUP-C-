import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { mapUser } from "@/lib/mappers";
import { updateProfileSchema, userActiveSchema, firstZodError } from "@/lib/auth/validators";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser();
    const { id } = await params;

    if (current.role !== "admin" && current.id !== id) {
      return apiError("You can only view your own profile.", 403);
    }

    const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
    if (!user) return apiError("User not found.", 404);

    return apiOk({ user: mapUser(user) });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[GET /api/users/:id]", err);
    return apiError("Failed to load user.", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser();
    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }

    // Admins may (de)activate any account.
    if (current.role === "admin" && body && typeof body === "object" && "isActive" in body) {
      const parsed = userActiveSchema.safeParse(body);
      if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

      const user = await prisma.user.update({
        where: { id },
        data: { isActive: parsed.data.isActive },
        include: { profile: true },
      });
      await logActivity({
        userId: current.id,
        action: "admin.user_active_toggled",
        metadata: { targetUserId: id, isActive: parsed.data.isActive },
      });
      return apiOk({ user: mapUser(user) });
    }

    // Otherwise, users may only update their own profile fields.
    if (current.id !== id) {
      return apiError("You can only update your own profile.", 403);
    }

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

    const user = await prisma.user.update({
      where: { id },
      data: {
        profile: {
          update: {
            ...(parsed.data.fname !== undefined ? { fname: parsed.data.fname } : {}),
            ...(parsed.data.lname !== undefined ? { lname: parsed.data.lname } : {}),
            ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
            ...(parsed.data.avatarUrl !== undefined ? { avatarUrl: parsed.data.avatarUrl } : {}),
            ...(parsed.data.agency !== undefined ? { agency: parsed.data.agency } : {}),
          },
        },
      },
      include: { profile: true },
    });

    await logActivity({ userId: current.id, action: "user.profile_updated" });

    return apiOk({ user: mapUser(user) });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[PATCH /api/users/:id]", err);
    return apiError("Failed to update user.", 500);
  }
}
