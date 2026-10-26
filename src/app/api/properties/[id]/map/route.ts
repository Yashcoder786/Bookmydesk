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
    const currentUserId = searchParams.get("userId") || undefined;

    const parts = dateStr.split("-").map(Number);
    const y = parts[0] || new Date().getUTCFullYear();
    const m = (parts[1] !== undefined ? parts[1] : new Date().getUTCMonth() + 1) - 1;
    const d = parts[2] !== undefined ? parts[2] : new Date().getUTCDate();

    let startAt: Date;
    let endAt: Date;

    if (plan === "MONTH") {
      startAt = new Date(Date.UTC(y, m, d, 0, 0, 0));
      endAt = new Date(startAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      // Day pass: covers the entire date boundary so any booking on this date is captured
      startAt = new Date(Date.UTC(y, m, d, 0, 0, 0));
      endAt = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));
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
