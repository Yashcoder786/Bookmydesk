import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPropertySeatMapWithStatus } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);

    // Resolve property id if slug provided
    const property = await prisma.property.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, name: true, openingHours: true },
    });

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const plan = searchParams.get("plan") || "DAY";
    const currentUserId = searchParams.get("userId") || "usr_customer_1";

    const baseDate = new Date(dateStr);
    let startAt: Date;
    let endAt: Date;

    if (plan === "MONTH") {
      // PRD Section 8.3 & 20.1: Rolling 30 days starting from requested start date
      startAt = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0);
      endAt = new Date(startAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      // Day pass: standard working day 08:00 to 20:00
      startAt = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 8, 0, 0);
      endAt = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 20, 0, 0);
    }

    const floors = await getPropertySeatMapWithStatus(
      property.id,
      startAt,
      endAt,
      currentUserId
    );

    return NextResponse.json({
      success: true,
      propertyId: property.id,
      propertyName: property.name,
      plan,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      floors,
    });
  } catch (error: any) {
    console.error("Error generating seat map:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load interactive seat map" },
      { status: 500 }
    );
  }
}
