import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { bookingStatusSchema, firstZodError } from "@/lib/auth/validators";
import { mapBooking } from "@/lib/mappers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return apiError("Booking not found.", 404);

    const isParticipant = booking.customerId === current.id || booking.agentId === current.id;
    if (current.role !== "admin" && !isParticipant) {
      return apiError("You do not have access to this booking.", 403);
    }

    return apiOk({ booking: mapBooking(booking) });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[GET /api/bookings/:id]", err);
    return apiError("Failed to load booking.", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const current = await requireUser();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return apiError("Booking not found.", 404);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }
    const parsed = bookingStatusSchema.safeParse(body);
    if (!parsed.success) return apiError(firstZodError(parsed.error), 422);
    const { status } = parsed.data;

    const isOwningAgent = booking.agentId === current.id;
    const isOwningCustomer = booking.customerId === current.id;

    if (current.role === "customer") {
      if (!isOwningCustomer || status !== "cancelled") {
        return apiError("Customers may only cancel their own bookings.", 403);
      }
    } else if (current.role === "agent") {
      if (!isOwningAgent || !["confirmed", "rejected", "cancelled", "completed"].includes(status)) {
        return apiError("Agents may only update the status of bookings on their own properties.", 403);
      }
    } // admin may set any status

    const updated = await prisma.booking.update({ where: { id }, data: { status } });

    if (status === "confirmed") {
      await prisma.property.update({ where: { id: booking.propertyId }, data: { status: "booked" } });
    }
    if (status === "cancelled" || status === "rejected") {
      await prisma.property
        .update({ where: { id: booking.propertyId }, data: { status: "available" } })
        .catch(() => undefined);
    }

    await prisma.notification.create({
      data: {
        userId: current.role === "agent" ? booking.customerId : booking.agentId,
        type: status === "confirmed" ? "success" : status === "rejected" ? "error" : "info",
        title: `Booking ${status}`,
        message: `Your booking has been updated to "${status}".`,
      },
    });

    await logActivity({ userId: current.id, action: "booking.status_changed", metadata: { bookingId: id, status } });

    return apiOk({ booking: mapBooking(updated) });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[PATCH /api/bookings/:id]", err);
    return apiError("Failed to update booking.", 500);
  }
}
