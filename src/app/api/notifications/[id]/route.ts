import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/apiHelpers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser();
    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== current.id) {
      return apiError("Notification not found.", 404);
    }

    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return apiOk({ message: "Notification marked as read." });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[PATCH /api/notifications/:id]", err);
    return apiError("Failed to update notification.", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser();
    const { id } = await params;

    await prisma.notification.deleteMany({ where: { id, userId: current.id } });
    return apiOk({ message: "Notification dismissed." });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[DELETE /api/notifications/:id]", err);
    return apiError("Failed to dismiss notification.", 500);
  }
}
