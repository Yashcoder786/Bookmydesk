import { NextRequest, NextResponse } from "next/server";
import { createTemporaryHold, cleanExpiredHolds } from "@/lib/availability";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inventoryItemId, startAt, endAt, userId = "usr_customer_1" } = body;

    if (!inventoryItemId || !startAt || !endAt) {
      return NextResponse.json(
        { success: false, error: "Missing required hold parameters" },
        { status: 400 }
      );
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    // Call atomic hold creator
    const hold = await createTemporaryHold(userId, inventoryItemId, startDate, endDate, 5);

    return NextResponse.json({
      success: true,
      message: "5-minute temporary hold acquired successfully",
      hold: {
        id: hold.id,
        inventoryItemId: hold.inventoryItemId,
        startAt: hold.startAt,
        endAt: hold.endAt,
        expiresAt: hold.expiresAt,
        durationSeconds: 300,
      },
    });
  } catch (error: any) {
    console.error("Hold acquisition error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to hold seat" },
      { status: 409 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const holdId = searchParams.get("holdId");
    const userId = searchParams.get("userId") || "usr_customer_1";

    if (holdId) {
      await prisma.inventoryHold.updateMany({
        where: { id: holdId, userId },
        data: { status: "RELEASED" },
      });
    }

    await cleanExpiredHolds();

    return NextResponse.json({ success: true, message: "Hold released successfully" });
  } catch (error: any) {
    console.error("Hold release error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to release hold" },
      { status: 500 }
    );
  }
}
