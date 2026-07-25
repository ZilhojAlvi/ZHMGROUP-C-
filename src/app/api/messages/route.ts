import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { messageCreateSchema, firstZodError } from "@/lib/auth/validators";

/** Lists messages sent or received by the current user, optionally filtered by the other party. */
export async function GET(req: NextRequest) {
  try {
    const current = await requireUser();
    const withUserId = req.nextUrl.searchParams.get("with");

    const messages = await prisma.message.findMany({
      where: {
        AND: [
          { OR: [{ senderId: current.id }, { receiverId: current.id }] },
          withUserId ? { OR: [{ senderId: withUserId }, { receiverId: withUserId }] } : {},
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    return apiOk({
      messages: messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        propertyId: m.propertyId,
        content: m.content,
        isRead: m.isRead,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[GET /api/messages]", err);
    return apiError("Failed to load messages.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const current = await requireUser();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }
    const parsed = messageCreateSchema.safeParse(body);
    if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

    const receiver = await prisma.user.findUnique({ where: { id: parsed.data.receiverId } });
    if (!receiver) return apiError("Recipient not found.", 404);

    const message = await prisma.message.create({
      data: {
        senderId: current.id,
        receiverId: parsed.data.receiverId,
        propertyId: parsed.data.propertyId,
        content: parsed.data.content,
      },
    });

    await prisma.notification.create({
      data: {
        userId: parsed.data.receiverId,
        type: "info",
        title: "New message",
        message: "You have a new message.",
      },
    });

    await logActivity({ userId: current.id, action: "message.sent" });

    return apiOk(
      {
        message: {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          propertyId: message.propertyId,
          content: message.content,
          isRead: message.isRead,
          createdAt: message.createdAt.toISOString(),
        },
      },
      201
    );
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[POST /api/messages]", err);
    return apiError("Failed to send message.", 500);
  }
}
