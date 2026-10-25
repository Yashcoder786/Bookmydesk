import prisma from "./prisma";
import { SeatStatus, FloorDTO, InventoryItemDTO, ZoneDTO } from "./types";

/**
 * Releases expired inventory holds where expiresAt <= now
 */
export async function cleanExpiredHolds(): Promise<number> {
  const now = new Date();
  const result = await prisma.inventoryHold.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    data: {
      status: "EXPIRED",
    },
  });
  return result.count;
}

/**
 * Checks if a specific inventory item is available for interval [startAt, endAt)
 * Uses strict overlap logic: existing_start < req_end AND existing_end > req_start
 */
export async function checkItemAvailability(
  inventoryItemId: string,
  startAt: Date,
  endAt: Date,
  currentUserId?: string
): Promise<{ available: boolean; reason?: string; status: SeatStatus }> {
  await cleanExpiredHolds();

  // 1. Check if the item itself is marked as maintenance or blocked
  const item = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItemId },
    select: { activeStatus: true },
  });

  if (!item) {
    return { available: false, reason: "Item not found", status: "BLOCKED" };
  }

  if (item.activeStatus === "MAINTENANCE") {
    return { available: false, reason: "Item under maintenance", status: "MAINTENANCE" };
  }
  if (item.activeStatus === "BLOCKED") {
    return { available: false, reason: "Item blocked by operator", status: "BLOCKED" };
  }

  // 2. Check partner availability blocks
  const overlappingBlock = await prisma.availabilityBlock.findFirst({
    where: {
      inventoryItemId,
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (overlappingBlock) {
    return { available: false, reason: overlappingBlock.reason, status: "BLOCKED" };
  }

  // 3. Check active confirmed / checked-in bookings
  const overlappingBooking = await prisma.bookingItem.findFirst({
    where: {
      inventoryItemId,
      booking: {
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    },
    include: {
      booking: {
        select: { id: true, status: true },
      },
    },
  });

  if (overlappingBooking) {
    return {
      available: false,
      reason: `Already booked (Booking ${overlappingBooking.booking.id})`,
      status: "BOOKED",
    };
  }

  // 4. Check active unexpired holds
  const activeHold = await prisma.inventoryHold.findFirst({
    where: {
      inventoryItemId,
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (activeHold) {
    // If the hold belongs to the current user, it is selectable/held by them
    if (currentUserId && activeHold.userId === currentUserId) {
      return { available: true, status: "SELECTED" };
    }
    return { available: false, reason: "Currently held by another customer", status: "HELD" };
  }

  return { available: true, status: "AVAILABLE" };
}

/**
 * Returns full property floors & zones with real-time calculated seat status
 * for the given time interval
 */
export async function getPropertySeatMapWithStatus(
  propertyId: string,
  startAt: Date,
  endAt: Date,
  currentUserId?: string
): Promise<FloorDTO[]> {
  await cleanExpiredHolds();

  const now = new Date();

  // Fetch all floors, zones, and items
  const floors = await prisma.floor.findMany({
    where: { propertyId },
    orderBy: { sortOrder: "asc" },
    include: {
      zones: {
        include: {
          items: {
            include: {
              holds: {
                where: {
                  status: "ACTIVE",
                  expiresAt: { gt: now },
                  startAt: { lt: endAt },
                  endAt: { gt: startAt },
                },
              },
              bookings: {
                where: {
                  booking: {
                    status: { in: ["CONFIRMED", "CHECKED_IN"] },
                    startAt: { lt: endAt },
                    endAt: { gt: startAt },
                  },
                },
              },
              blocks: {
                where: {
                  startAt: { lt: endAt },
                  endAt: { gt: startAt },
                },
              },
            },
          },
        },
      },
    },
  });

  // Fetch property rate plans for price display on seat drawer
  const ratePlans = await prisma.ratePlan.findMany({
    where: { propertyId },
  });

  const priceMap: Record<string, { day?: number; month?: number }> = {};
  for (const rp of ratePlans) {
    if (!priceMap[rp.inventoryType]) priceMap[rp.inventoryType] = {};
    if (rp.billingUnit === "DAY") priceMap[rp.inventoryType].day = rp.price;
    if (rp.billingUnit === "MONTH") priceMap[rp.inventoryType].month = rp.price;
  }

  return floors.map((floor) => {
    return {
      id: floor.id,
      name: floor.name,
      floorNumber: floor.floorNumber,
      sortOrder: floor.sortOrder,
      zones: floor.zones.map((zone) => {
        return {
          id: zone.id,
          name: zone.name,
          type: zone.type,
          colorCode: zone.colorCode,
          items: zone.items.map((item) => {
            let status: SeatStatus = "AVAILABLE";
            let holdExpiresAt: string | null = null;

            if (item.activeStatus === "MAINTENANCE") {
              status = "MAINTENANCE";
            } else if (item.activeStatus === "BLOCKED" || item.blocks.length > 0) {
              status = "BLOCKED";
            } else if (item.bookings.length > 0) {
              status = "BOOKED";
            } else if (item.holds.length > 0) {
              const hold = item.holds[0];
              if (currentUserId && hold.userId === currentUserId) {
                status = "SELECTED";
              } else {
                status = "HELD";
              }
              holdExpiresAt = hold.expiresAt.toISOString();
            }

            let featuresList: string[] = [];
            try {
              featuresList = JSON.parse(item.features);
            } catch {
              featuresList = [];
            }

            const prices = priceMap[item.type] || {};

            return {
              id: item.id,
              zoneId: zone.id,
              zoneName: zone.name,
              zoneType: zone.type,
              zoneColor: zone.colorCode,
              code: item.code,
              name: item.name,
              type: item.type as any,
              capacity: item.capacity,
              features: featuresList,
              mapX: item.mapX,
              mapY: item.mapY,
              width: item.width,
              height: item.height,
              activeStatus: item.activeStatus,
              status,
              holdExpiresAt,
              pricePerDay: prices.day,
              pricePerMonth: prices.month,
            };
          }),
        };
      }),
    };
  });
}

/**
 * Creates a 5-minute atomic checkout hold
 */
export async function createTemporaryHold(
  userId: string,
  inventoryItemId: string,
  startAt: Date,
  endAt: Date,
  holdMinutes = 5
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Clean existing expired holds
    await tx.inventoryHold.updateMany({
      where: { status: "ACTIVE", expiresAt: { lte: new Date() } },
      data: { status: "EXPIRED" },
    });

    // 2. Check if already booked
    const booked = await tx.bookingItem.findFirst({
      where: {
        inventoryItemId,
        booking: {
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      },
    });

    if (booked) {
      throw new Error("This workspace asset has already been booked for the requested period.");
    }

    // 3. Check if active hold exists by another user
    const existingHold = await tx.inventoryHold.findFirst({
      where: {
        inventoryItemId,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });

    if (existingHold && existingHold.userId !== userId) {
      throw new Error("This workspace asset is currently held by another customer.");
    }

    // 4. Release any older holds by this user on this asset
    await tx.inventoryHold.updateMany({
      where: {
        userId,
        inventoryItemId,
        status: "ACTIVE",
      },
      data: { status: "RELEASED" },
    });

    // 5. Create new hold with 5-minute expiry
    const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);
    return await tx.inventoryHold.create({
      data: {
        userId,
        inventoryItemId,
        startAt,
        endAt,
        expiresAt,
        status: "ACTIVE",
      },
    });
  });
}
