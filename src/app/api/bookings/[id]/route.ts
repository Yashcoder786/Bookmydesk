import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingRef: id }],
      },
      include: {
        property: {
          include: {
            amenities: {
              include: { amenity: true },
            },
          },
        },
        items: {
          include: {
            inventoryItem: {
              include: { zone: true },
            },
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Error fetching booking pass:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load booking" },
      { status: 500 }
    );
  }
}
