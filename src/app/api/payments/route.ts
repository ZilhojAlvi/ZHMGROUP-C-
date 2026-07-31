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
/**
 * Processes a (simulated) payment for a booking.
 *
 * - card / bank_transfer / mobile_wallet: these can't realistically move the
 *   full property price, so only a booking deposit is charged. The customer
 *   picks the deposit percentage (1-10%) client-side, but the value is
 *   clamped and re-validated server-side before the amount is computed —
 *   never trusted as-is from the client. The buyer/tenant must then complete
 *   the full agreement and remaining balance by `agreementDate`.
 * - cash: no online charge at all. The property is held for 7 days; if
 *   nobody follows up by then, the booking auto-cancels (see GET handler).
 *
 * Swap the simulated verification for a real payment gateway webhook in
 * production (e.g. Stripe) without changing this route's contract.
 */
const MIN_DEPOSIT_PERCENT = 1;
const MAX_DEPOSIT_PERCENT = 10;
const DEFAULT_DEPOSIT_PERCENT = 10;
const CASH_HOLD_DAYS = 7;
const MIN_AGREEMENT_DAYS = 3;
const MAX_AGREEMENT_DAYS = 90;

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

    const { method } = parsed.data;

    // ---- Cash on visit: no online charge, just a time-limited hold. ----
    if (method === "cash") {
      const expiresAt = new Date(Date.now() + CASH_HOLD_DAYS * 24 * 60 * 60 * 1000);
      const transactionRef = `HOLD-${Math.floor(1000000 + Math.random() * 8999999)}`;

      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          customerId: current.id,
          amount: 0,
          method,
          status: "pending",
          transactionRef,
        },
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: { expiresAt },
      });
      await prisma.property.update({
        where: { id: booking.propertyId },
        data: { status: "under_review" },
      });
      await prisma.notification.create({
        data: {
          userId: booking.agentId,
          type: "info",
          title: "Cash-on-visit booking held",
          message: `A customer reserved a property for cash payment on visit. Contact them within ${CASH_HOLD_DAYS} days or the hold expires automatically.`,
        },
      });

      await logActivity({
        userId: current.id,
        action: "payment.cash_hold_created",
        metadata: { paymentId: payment.id, bookingId: booking.id },
      });

      return apiOk({ payment: mapPayment(payment) }, 201);
    }

    // ---- Card / bank transfer / mobile wallet: 1-10% deposit + agreement date. ----
    // Never trust the client's number as-is — clamp it into the allowed range.
    const requestedPercent = parsed.data.depositPercent ?? DEFAULT_DEPOSIT_PERCENT;
    const depositPercent = Math.min(
      MAX_DEPOSIT_PERCENT,
      Math.max(MIN_DEPOSIT_PERCENT, Math.round(requestedPercent))
    );

    if (!parsed.data.agreementDate) {
      return apiError("Please choose an agreement completion date.", 422);
    }
    const agreementDate = new Date(parsed.data.agreementDate);
    if (Number.isNaN(agreementDate.getTime())) {
      return apiError("Invalid agreement date.", 422);
    }
    const now = Date.now();
    const minDate = new Date(now + MIN_AGREEMENT_DAYS * 24 * 60 * 60 * 1000);
    const maxDate = new Date(now + MAX_AGREEMENT_DAYS * 24 * 60 * 60 * 1000);
    if (agreementDate < minDate || agreementDate > maxDate) {
      return apiError(
        `Agreement date must be between ${MIN_AGREEMENT_DAYS} and ${MAX_AGREEMENT_DAYS} days from today.`,
        422
      );
    }

    const depositAmount = Math.round((booking.totalAmount * depositPercent) / 100);
    const status = Math.random() < 0.9 ? "success" : "failed";
    const transactionRef = `TXN-${Math.floor(1000000 + Math.random() * 8999999)}`;

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        customerId: current.id,
        amount: depositAmount,
        method,
        status,
        transactionRef,
      },
    });

    if (status === "success") {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "confirmed",
          depositAmount,
          depositPercent,
          agreementDate,
        },
      });
      await prisma.property.update({ where: { id: booking.propertyId }, data: { status: "booked" } });
      await prisma.notification.create({
        data: {
          userId: booking.agentId,
          type: "success",
          title: "Booking deposit received",
          message: `A ${depositPercent}% deposit was paid for a booking on your property. Agreement due by ${agreementDate.toDateString()}.`,
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
