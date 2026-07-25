import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { bookingCreateSchema, firstZodError } from "@/lib/auth/validators";
import { mapBooking } from "@/lib/mappers";
import type { Prisma } from "@prisma/client";

/** Customers see their own bookings, agents see bookings on their properties, admins see all. */
export async function GET() {
  try {
    const current = await requireUser();

    const where: Prisma.BookingWhereInput =
      current.role === "admin"
        ? {}
        : current.role === "agent"
        ? { agentId: current.id }
        : { customerId: current.id };

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { bookingDate: "desc" },
    });
    return apiOk({ bookings: bookings.map(mapBooking) });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[GET /api/bookings]", err);
    return apiError("Failed to load bookings.", 500);
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
    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

    const property = await prisma.property.findUnique({ where: { id: parsed.data.propertyId } });
    if (!property) return apiError("Property not found.", 404);
    if (property.status !== "available") {
      return apiError("This property is no longer available for booking.", 409);
    }

    const booking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        customerId: current.id,
        agentId: property.agentId,
        moveInDate: new Date(parsed.data.moveInDate),
        status: "pending",
        totalAmount: property.price,
        notes: parsed.data.notes,
      },
    });

    await prisma.notification.create({
      data: {
        userId: property.agentId,
        type: "info",
        title: "New booking request",
        message: `A customer has requested to book "${property.title}".`,
      },
    });

    await logActivity({ userId: current.id, action: "booking.created", metadata: { bookingId: booking.id } });

    return apiOk({ booking: mapBooking(booking) }, 201);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[POST /api/bookings]", err);
    return apiError("Failed to create booking.", 500);
  }
}
