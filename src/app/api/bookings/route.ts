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
      guestName,
      guestEmail,
      guestPhone = "+91 98765 43210",
      userId,
      paymentMethod = "MOCK_UPI",
    } = body;

    if (!propertyId || !inventoryItemId || !startAt || !endAt) {
      return NextResponse.json(
        { success: false, error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const effectiveEmail = (guestEmail || "guest@bookmydesk.in").trim().toLowerCase();
    const effectiveName = guestName || effectiveEmail.split("@")[0];

    // Ensure user exists in database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          { email: effectiveEmail },
        ],
      },
    });

    if (!user) {
      const generatedId = userId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      user = await prisma.user.create({
        data: {
          id: generatedId,
          email: effectiveEmail,
          name: effectiveName,
          phone: guestPhone || "+91 98765 43210",
          role: "CUSTOMER",
        },
      });
    }

    const effectiveUserId = user.id;

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
        guest: effectiveName,
        plan: bookingPlan,
        validFrom: startDate.toISOString(),
      });

      const newBooking = await tx.booking.create({
        data: {
          id: bookingId,
          bookingRef,
          userId: effectiveUserId,
          propertyId,
          bookingPlan,
          startAt: startDate,
          endAt: endDate,
          status: "CONFIRMED",
          guestName: effectiveName,
          guestEmail: effectiveEmail,
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
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const status = searchParams.get("status");
    const all = searchParams.get("all");
    const role = searchParams.get("role");

    const whereClause: any = {};

    // If requested for Admin portal (all=true or role=ADMIN), return all bookings across the platform
    if (all === "true" || role === "ADMIN") {
      if (status && status !== "ALL") {
        whereClause.status = status;
      }
    } else {
      // Strictly enforce account isolation for customer views: if user is not logged in, return empty
      if (!userId && !email) {
        return NextResponse.json({ success: true, count: 0, bookings: [] });
      }

      const userFilters: any[] = [];
      if (userId) userFilters.push({ userId });
      if (email) userFilters.push({ guestEmail: email.trim().toLowerCase() });

      whereClause.OR = userFilters;
      if (status && status !== "ALL") {
        whereClause.status = status;
      }
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
