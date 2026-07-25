import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { mapProperty } from "@/lib/mappers";

export async function GET() {
  try {
    const current = await requireUser();
    const favorites = await prisma.favorite.findMany({
      where: { userId: current.id },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });
    return apiOk({
      properties: favorites.map((f) => mapProperty(f.property)),
      propertyIds: favorites.map((f) => f.propertyId),
    });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[GET /api/favorites]", err);
    return apiError("Failed to load favorites.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const current = await requireUser(["customer"]);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }
    const propertyId = (body as { propertyId?: string })?.propertyId;
    if (!propertyId) return apiError("propertyId is required.", 422);

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return apiError("Property not found.", 404);

    const favorite = await prisma.favorite.upsert({
      where: { userId_propertyId: { userId: current.id, propertyId } },
      create: { userId: current.id, propertyId },
      update: {},
    });

    await logActivity({ userId: current.id, action: "favorite.added", metadata: { propertyId } });

    return apiOk({ favoriteId: favorite.id }, 201);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[POST /api/favorites]", err);
    return apiError("Failed to add favorite.", 500);
  }
}
