import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passCode } = body;

    if (!passCode) {
      return NextResponse.json({ success: false, error: "Pass code is required" }, { status: 400 });
    }

    // Try finding by Booking ID or ref
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: passCode }, { bookingRef: passCode }],
      },
      include: {
        property: true,
        items: {
          include: {
            inventoryItem: {
              include: { zone: true },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Invalid booking pass or reference" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ success: false, error: "This booking was cancelled and is invalid for check-in." }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CHECKED_IN",
        checkedInAt: new Date(),
      },
      include: {
        property: true,
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Customer ${booking.guestName} successfully checked in to ${booking.items[0]?.inventoryItem?.code || "Workspace"}!`,
      booking: updated,
    });
  } catch (error: any) {
    console.error("Partner check-in error:", error);
    return NextResponse.json({ success: false, error: error.message || "Check-in failed" }, { status: 500 });
  }
}
