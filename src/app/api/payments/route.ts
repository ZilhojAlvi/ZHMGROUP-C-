import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk, logActivity } from "@/lib/apiHelpers";
import { paymentCreateSchema, firstZodError } from "@/lib/auth/validators";
import { mapPayment } from "@/lib/mappers";
import type { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const current = await requireUser();
    const where: Prisma.PaymentWhereInput = current.role === "admin" ? {} : { customerId: current.id };
    const payments = await prisma.payment.findMany({ where, orderBy: { paymentDate: "desc" } });
    return apiOk({ payments: payments.map(mapPayment) });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[GET /api/payments]", err);
    return apiError("Failed to load payments.", 500);
  }
}

/**
 * Processes a (simulated) payment for a booking, mirroring the original
 * PaymentSimulator UX: a ~90% success rate, gated on booking ownership.
 * Swap the simulated verification for a real payment gateway webhook in
 * production (e.g. Stripe) without changing this route's contract.
 */
export async function POST(req: NextRequest) {
  try {
    const current = await requireUser(["customer"]);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }
    const parsed = paymentCreateSchema.safeParse(body);
    if (!parsed.success) return apiError(firstZodError(parsed.error), 422);

    const booking = await prisma.booking.findUnique({ where: { id: parsed.data.bookingId } });
    if (!booking) return apiError("Booking not found.", 404);
    if (booking.customerId !== current.id) {
      return apiError("You may only pay for your own bookings.", 403);
    }

    const status = Math.random() < 0.9 ? "success" : "failed";
    const transactionRef = `TXN-${Math.floor(1000000 + Math.random() * 8999999)}`;

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        customerId: current.id,
        amount: parsed.data.amount,
        method: parsed.data.method,
        status,
        transactionRef,
      },
    });

    if (status === "success") {
      await prisma.booking.update({ where: { id: booking.id }, data: { status: "confirmed" } });
      await prisma.property.update({ where: { id: booking.propertyId }, data: { status: "booked" } });
      await prisma.notification.create({
        data: {
          userId: booking.agentId,
          type: "success",
          title: "Payment received",
          message: `Payment confirmed for a booking on your property.`,
        },
      });
    }

    await logActivity({
      userId: current.id,
      action: "payment.processed",
      metadata: { paymentId: payment.id, status },
    });

    return apiOk({ payment: mapPayment(payment) }, 201);
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[POST /api/payments]", err);
    return apiError("Failed to process payment.", 500);
  }
}
