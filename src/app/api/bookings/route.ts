import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanExpiredHolds } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await cleanExpiredHolds();

    const body = await request.json();
    const {
      propertyId,
      inventoryItemId,
      bookingPlan = "DAY",
      startAt,
      endAt,
      guestName = "Yash Salvi",
      guestEmail = "yash.salvi@example.com",
      guestPhone = "+91 98765 43210",
      userId = "usr_customer_1",
      paymentMethod = "MOCK_UPI",
    } = body;

    if (!propertyId || !inventoryItemId || !startAt || !endAt) {
      return NextResponse.json(
        { success: false, error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    // Run atomic booking transaction
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Check if overlapping booking exists
      const existingBooking = await tx.bookingItem.findFirst({
        where: {
          inventoryItemId,
          booking: {
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
            startAt: { lt: endDate },
            endAt: { gt: startDate },
          },
        },
      });

      if (existingBooking) {
        throw new Error("Seat was confirmed by another customer. Double booking prevented.");
      }

      // 2. Fetch inventory item and property rate plans to compute price
      const item = await tx.inventoryItem.findUnique({
        where: { id: inventoryItemId },
        include: { zone: true },
      });

      if (!item) {
        throw new Error("Inventory asset not found.");
      }

      const ratePlan = await tx.ratePlan.findFirst({
        where: {
          propertyId,
          inventoryType: item.type,
          billingUnit: bookingPlan,
        },
      });

      const basePrice = ratePlan ? ratePlan.price : bookingPlan === "MONTH" ? 7999 : 499;
      const discountPercent = ratePlan ? ratePlan.discountPercent : 0;
      const discountAmount = (basePrice * discountPercent) / 100;
      const discountedSubtotal = basePrice - discountAmount;
      const taxAmount = Math.round(discountedSubtotal * 0.18 * 100) / 100; // 18% GST
      const totalAmount = Math.round((discountedSubtotal + taxAmount) * 100) / 100;

      // 3. Mark any existing hold by this user as CONVERTED
      await tx.inventoryHold.updateMany({
        where: {
          userId,
          inventoryItemId,
          status: "ACTIVE",
        },
        data: { status: "CONVERTED" },
      });

      // 4. Generate unique readable booking ID e.g. CW-10482
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const bookingId = `CW-${randomNum}`;
      const bookingRef = `BK-${Date.now()}-${item.code}`;

      const qrPayload = JSON.stringify({
        bookingId,
        ref: bookingRef,
        item: item.code,
        guest: guestName,
        plan: bookingPlan,
        validFrom: startDate.toISOString(),
      });

      const newBooking = await tx.booking.create({
        data: {
          id: bookingId,
          bookingRef,
          userId,
          propertyId,
          bookingPlan,
          startAt: startDate,
          endAt: endDate,
          status: "CONFIRMED",
          guestName,
          guestEmail,
          guestPhone,
          subtotal: discountedSubtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          currency: "INR",
          checkInQrData: qrPayload,
          items: {
            create: [
              {
                inventoryItemId: item.id,
                unitPrice: basePrice,
                itemSnapshot: JSON.stringify({
                  code: item.code,
                  name: item.name,
                  type: item.type,
                  zone: item.zone.name,
                }),
              },
            ],
          },
          payments: {
            create: [
              {
                provider: "SIMULATED",
                providerRef: `TXN_${Date.now()}_MOCK`,
                amount: totalAmount,
                status: "SUCCESS",
                paymentMethod,
                idempotencyKey: `IDEMP_${bookingRef}`,
              },
            ],
          },
        },
        include: {
          property: true,
          items: {
            include: {
              inventoryItem: true,
            },
          },
          payments: true,
        },
      });

      return newBooking;
    });

    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to confirm booking" },
      { status: 409 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "usr_customer_1";
    const status = searchParams.get("status");

    const whereClause: any = { userId };
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        property: true,
        items: {
          include: {
            inventoryItem: {
              include: { zone: true },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load bookings" },
      { status: 500 }
    );
  }
}
