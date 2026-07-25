import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/apiHelpers";
import { mapUser } from "@/lib/mappers";

export async function GET() {
  try {
    await requireUser(["admin"]);
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: "desc" },
    });
    return apiOk({ users: users.map(mapUser) });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[GET /api/users]", err);
    return apiError("Failed to load users.", 500);
  }
}
