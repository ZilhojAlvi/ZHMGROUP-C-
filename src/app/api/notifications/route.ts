import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/apiHelpers";

export async function GET() {
  try {
    const current = await requireUser();
    const notifications = await prisma.notification.findMany({
      where: { userId: current.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return apiOk({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        timestamp: n.createdAt.getTime(),
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[GET /api/notifications]", err);
    return apiError("Failed to load notifications.", 500);
  }
}

export async function POST() {
  try {
    const current = await requireUser();
    await prisma.notification.updateMany({
      where: { userId: current.id, isRead: false },
      data: { isRead: true },
    });
    return apiOk({ message: "All notifications marked as read." });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[POST /api/notifications]", err);
    return apiError("Failed to update notifications.", 500);
  }
}
