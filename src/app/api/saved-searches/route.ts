import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { savedSearchCreateSchema, firstZodError } from "@/lib/auth/validators";
import { mapSavedSearch } from "@/lib/mappers";
import { propertyMatchesFilters } from "@/lib/savedSearchMatch";
import type { PropertyFilters } from "@/types";

/** Lists the current customer's saved searches, along with a live match count for each. */
export async function GET() {
  try {
    const current = await requireUser(["customer"]);

    const [savedSearches, properties] = await Promise.all([
      prisma.savedSearch.findMany({ where: { userId: current.id }, orderBy: { createdAt: "desc" } }),
      prisma.property.findMany({ where: { status: "available" } }),
    ]);

    const withCounts = savedSearches.map((s) => ({
      ...mapSavedSearch(s),
      matchCount: properties.filter((p) => propertyMatchesFilters(p, s.filters as unknown as PropertyFilters)).length,
    }));

    return apiOk({ savedSearches: withCounts });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[GET /api/saved-searches]", err);
    return apiError("Failed to load saved searches.", 500);
  }
}

/** Saves the current filter set so the customer gets alerted about new matching listings. */
export async function POST(req: NextRequest) {
  try {
    const current = await requireUser(["customer"]);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }
    const parsed = savedSearchCreateSchema.safeParse(body);
    if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

    const existingCount = await prisma.savedSearch.count({ where: { userId: current.id } });
    if (existingCount >= 20) {
      return apiError("You've reached the limit of 20 saved searches. Delete one to add another.", 422);
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: current.id,
        name: parsed.data.name,
        filters: parsed.data.filters as Prisma.InputJsonValue,
      },
    });

    await logActivity({ userId: current.id, action: "savedSearch.created", metadata: { savedSearchId: savedSearch.id } });

    return apiOk({ savedSearch: mapSavedSearch(savedSearch) }, 201);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[POST /api/saved-searches]", err);
    return apiError("Failed to save search.", 500);
  }
}
