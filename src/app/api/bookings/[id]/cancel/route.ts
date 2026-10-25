import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { reason = "Customer requested cancellation" } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // PRD Section 6.3 & 16: Cancellation and Refund Rules
    // Check hours until startAt
    const now = new Date();
    const hoursUntilStart = (new Date(booking.startAt).getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hoursUntilStart >= 24) {
      refundPercent = 100; // Full refund 24+ hrs prior
    } else if (hoursUntilStart > 0) {
      refundPercent = 80; // 80% refund within 24 hours
    } else {
      refundPercent = 0; // Past check-in time
    }

    const refundAmount = Math.round(((booking.totalAmount * refundPercent) / 100) * 100) / 100;

    const updated = await prisma.$transaction(async (tx) => {
      // Update booking status
      const b = await tx.booking.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
          cancellationReason: reason,
          refundAmount,
        },
      });

      // Update payment record to reflect refund
      if (booking.payments.length > 0 && refundAmount > 0) {
        await tx.payment.update({
          where: { id: booking.payments[0].id },
          data: { status: "REFUNDED" },
        });
      }

      return b;
    });

    return NextResponse.json({
      success: true,
      message: `Booking cancelled successfully. Refund amount: ₹${refundAmount} (${refundPercent}%).`,
      booking: updated,
    });
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
