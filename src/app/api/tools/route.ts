import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/apiHelpers";

export async function GET() {
  try {
    const tools = await prisma.maintenanceTool.findMany({ orderBy: { toolName: "asc" } });
    return apiOk({
      tools: tools.map((t) => ({
        toolId: t.id,
        toolName: t.toolName,
        category: t.category,
        workingRate: t.workingRate,
        availability: t.availability,
      })),
    });
  } catch (err) {
    console.error("[GET /api/tools]", err);
    return apiError("Failed to load tools.", 500);
  }
}
