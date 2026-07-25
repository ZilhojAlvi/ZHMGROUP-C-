import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { propertySchema, firstZodError } from "@/lib/auth/validators";
import { mapProperty, propertyInputToPrisma } from "@/lib/mappers";
import type { Prisma } from "@prisma/client";

/** Public listing endpoint with the same filter set as the original PropertyService.search(). */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const where: Prisma.PropertyWhereInput = {};

    const keyword = sp.get("keyword");
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { city: { contains: keyword, mode: "insensitive" } },
        { address: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
      ];
    }

    const type = sp.get("type");
    if (type && type !== "all") where.type = type as "residential" | "commercial" | "land";

    const purpose = sp.get("purpose");
    if (purpose && purpose !== "all") where.purpose = purpose as "sale" | "rent";

    const city = sp.get("city");
    if (city) where.city = { equals: city, mode: "insensitive" };

    const status = sp.get("status");
    if (status && status !== "all")
      where.status = status as "available" | "booked" | "under_review" | "sold" | "inactive";

    const agentId = sp.get("agentId");
    if (agentId) where.agentId = agentId;

    const minPrice = sp.get("minPrice");
    const maxPrice = sp.get("maxPrice");
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      };
    }

    const minSquareFeet = sp.get("minSquareFeet");
    if (minSquareFeet) where.squareFeet = { gte: Number(minSquareFeet) };

    const minBeds = sp.get("minBeds");
    if (minBeds) where.bedrooms = { gte: Number(minBeds) };

    const minBaths = sp.get("minBaths");
    if (minBaths) where.bathrooms = { gte: Number(minBaths) };

    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };
    switch (sp.get("sortBy")) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "size_desc":
        orderBy = { squareFeet: "desc" };
        break;
    }

    const properties = await prisma.property.findMany({ where, orderBy });
    return apiOk({ properties: properties.map(mapProperty) });
  } catch (err) {
    console.error("[GET /api/properties]", err);
    return apiError("Failed to load properties.", 500);
  }
}

/** Agents and admins may create new listings. */
export async function POST(req: NextRequest) {
  try {
    const current = await requireUser(["agent", "admin"]);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }

    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

    const data = propertyInputToPrisma({ ...parsed.data, agentId: current.id });
    const property = await prisma.property.create({ data });

    if (current.role === "agent") {
      await prisma.profile.update({
        where: { userId: current.id },
        data: { propertiesListed: { increment: 1 } },
      });
    }

    await logActivity({ userId: current.id, action: "property.created", metadata: { propertyId: property.id } });

    return apiOk({ property: mapProperty(property) }, 201);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[POST /api/properties]", err);
    return apiError("Failed to create property.", 500);
  }
}
