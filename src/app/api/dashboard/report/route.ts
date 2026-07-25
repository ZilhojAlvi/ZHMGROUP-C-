import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/apiHelpers";
import type { SystemReport } from "@/types";

export async function GET() {
  try {
    await requireUser(["admin"]);

    const [
      totalUsers,
      totalCustomers,
      totalAgents,
      totalAdmins,
      verifiedAgents,
      pendingAgents,
      totalProperties,
      residentialCount,
      commercialCount,
      landCount,
      availableProperties,
      bookedProperties,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      completedBookings,
      rejectedBookings,
      successfulPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.user.count({ where: { role: "agent" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.profile.count({ where: { verificationStatus: "verified" } }),
      prisma.profile.count({ where: { verificationStatus: "pending" } }),
      prisma.property.count(),
      prisma.property.count({ where: { type: "residential" } }),
      prisma.property.count({ where: { type: "commercial" } }),
      prisma.property.count({ where: { type: "land" } }),
      prisma.property.count({ where: { status: "available" } }),
      prisma.property.count({ where: { status: "booked" } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "confirmed" } }),
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.booking.count({ where: { status: "cancelled" } }),
      prisma.booking.count({ where: { status: "completed" } }),
      prisma.booking.count({ where: { status: "rejected" } }),
      prisma.payment.findMany({ where: { status: "success" }, select: { amount: true, paymentDate: true } }),
    ]);

    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    const monthlyMap = new Map<string, number>();
    successfulPayments.forEach((p) => {
      const month = p.paymentDate.toLocaleString("en-US", { month: "short", year: "2-digit" });
      monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + p.amount);
    });

    const report: SystemReport = {
      generatedAt: new Date().toISOString(),
      totalUsers,
      totalCustomers,
      totalAgents,
      totalAdmins,
      verifiedAgents,
      pendingAgents,
      totalProperties,
      residentialCount,
      commercialCount,
      landCount,
      availableProperties,
      bookedProperties,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      monthlyRevenue: Array.from(monthlyMap.entries()).map(([month, revenue]) => ({ month, revenue })),
      bookingsByStatus: [
        { status: "pending", count: pendingBookings },
        { status: "confirmed", count: confirmedBookings },
        { status: "cancelled", count: cancelledBookings },
        { status: "completed", count: completedBookings },
        { status: "rejected", count: rejectedBookings },
      ],
      propertiesByType: [
        { type: "Residential", count: residentialCount },
        { type: "Commercial", count: commercialCount },
        { type: "Land / Plot", count: landCount },
      ],
    };

    return apiOk({ report });
  } catch (err) {
    if (err instanceof AuthError) return apiError(err.message, err.status);
    console.error("[GET /api/dashboard/report]", err);
    return apiError("Failed to generate report.", 500);
  }
}
