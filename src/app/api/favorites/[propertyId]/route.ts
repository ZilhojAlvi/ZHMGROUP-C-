import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";

interface Params {
  params: Promise<{ propertyId: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser();
    const { propertyId } = await params;

    await prisma.favorite.deleteMany({ where: { userId: current.id, propertyId } });
    await logActivity({ userId: current.id, action: "favorite.removed", metadata: { propertyId } });

    return apiOk({ message: "Removed from favorites." });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[DELETE /api/favorites/:propertyId]", err);
    return apiError("Failed to remove favorite.", 500);
  }
}
