import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser(["customer"]);
    const { id } = await params;

    const existing = await prisma.savedSearch.findUnique({ where: { id } });
    if (!existing) return apiError("Saved search not found.", 404);
    if (existing.userId !== current.id) {
      return apiError("You may only delete your own saved searches.", 403);
    }

    await prisma.savedSearch.delete({ where: { id } });
    await logActivity({ userId: current.id, action: "savedSearch.deleted", metadata: { savedSearchId: id } });

    return apiOk({ deleted: true });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[DELETE /api/saved-searches/:id]", err);
    return apiError("Failed to delete saved search.", 500);
  }
}
