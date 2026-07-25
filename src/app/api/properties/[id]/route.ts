import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { propertyUpdateSchema, firstZodError } from "@/lib/auth/validators";
import { mapProperty, propertyInputToPrisma } from "@/lib/mappers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return apiError("Property not found.", 404);
    return apiOk({ property: mapProperty(property) });
  } catch (err) {
    console.error("[GET /api/properties/:id]", err);
    return apiError("Failed to load property.", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser(["agent", "admin"]);
    const { id } = await params;

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return apiError("Property not found.", 404);
    if (current.role !== "admin" && existing.agentId !== current.id) {
      return apiError("You may only update properties you own.", 403);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }
    const parsed = propertyUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

    const mergedForConversion = { ...existing, ...parsed.data, amenities: parsed.data.amenities };
    const data = propertyInputToPrisma({
      ...mergedForConversion,
      agentId: existing.agentId,
      amenities: parsed.data.amenities ?? {
        parkingSpace: existing.parkingSpace,
        furnished: existing.furnished,
        petFriendly: existing.petFriendly,
        pool: existing.pool,
        gym: existing.gym,
        security: existing.security,
        elevator: existing.elevator,
        internet: existing.internet,
      },
    });

    const property = await prisma.property.update({ where: { id }, data });
    await logActivity({ userId: current.id, action: "property.updated", metadata: { propertyId: id } });

    return apiOk({ property: mapProperty(property) });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[PUT /api/properties/:id]", err);
    return apiError("Failed to update property.", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser(["agent", "admin"]);
    const { id } = await params;

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return apiError("Property not found.", 404);
    if (current.role !== "admin" && existing.agentId !== current.id) {
      return apiError("You may only delete properties you own.", 403);
    }

    await prisma.property.delete({ where: { id } });
    await logActivity({ userId: current.id, action: "property.deleted", metadata: { propertyId: id } });

    return apiOk({ message: "Property deleted." });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[DELETE /api/properties/:id]", err);
    return apiError("Failed to delete property.", 500);
  }
}
