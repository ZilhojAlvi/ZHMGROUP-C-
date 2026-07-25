import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { agentVerifySchema, firstZodError } from "@/lib/auth/validators";
import { mapUser } from "@/lib/mappers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser(["admin"]);
    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }
    const parsed = agentVerifySchema.safeParse(body);
    if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

    const target = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
    if (!target || target.role !== "agent") return apiError("Agent not found.", 404);

    const user = await prisma.user.update({
      where: { id },
      data: {
        profile: {
          update: { verificationStatus: parsed.data.approve ? "verified" : "rejected" },
        },
      },
      include: { profile: true },
    });

    await logActivity({
      userId: current.id,
      action: "admin.agent_verification",
      metadata: { targetUserId: id, approve: parsed.data.approve },
    });

    await prisma.notification.create({
      data: {
        userId: id,
        type: parsed.data.approve ? "success" : "warning",
        title: parsed.data.approve ? "Agent account verified" : "Agent verification rejected",
        message: parsed.data.approve
          ? "Your agent account has been verified. You can now list properties."
          : "Your agent verification was rejected. Please contact support for details.",
      },
    });

    return apiOk({ user: mapUser(user) });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[PATCH /api/users/:id/verify-agent]", err);
    return apiError("Failed to update agent verification.", 500);
  }
}
