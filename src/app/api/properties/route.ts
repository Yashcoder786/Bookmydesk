import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const locality = searchParams.get("locality");
    const search = searchParams.get("q");
    const inventoryType = searchParams.get("inventoryType");
    const plan = searchParams.get("plan") || "DAY";

    const whereClause: any = {
      status: "PUBLISHED",
    };

    if (city && city !== "ALL") {
      whereClause.city = { contains: city };
    }

    if (locality) {
      whereClause.locality = { contains: locality };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { locality: { contains: search } },
        { city: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
        ratePlans: true,
        floors: {
          include: {
            zones: {
              include: {
                items: {
                  where: { activeStatus: "ACTIVE" },
                },
              },
            },
          },
        },
      },
      orderBy: { rating: "desc" },
    });

    const formatted = properties.map((prop) => {
      let priceStartingDay = 499;
      let priceStartingMonth = 7999;

      const dayRates = prop.ratePlans
        .filter((r) => r.billingUnit === "DAY")
        .map((r) => r.price);
      if (dayRates.length > 0) priceStartingDay = Math.min(...dayRates);

      const monthRates = prop.ratePlans
        .filter((r) => r.billingUnit === "MONTH")
        .map((r) => r.price);
      if (monthRates.length > 0) priceStartingMonth = Math.min(...monthRates);

      let totalActiveDesks = 0;
      for (const f of prop.floors) {
        for (const z of f.zones) {
          totalActiveDesks += z.items.length;
        }
      }

      return {
        id: prop.id,
        name: prop.name,
        slug: prop.slug,
        tagline: prop.tagline,
        description: prop.description,
        address: prop.address,
        city: prop.city,
        locality: prop.locality,
        landmark: prop.landmark,
        openingHours: prop.openingHours,
        status: prop.status,
        coverImage: prop.coverImage,
        rating: prop.rating,
        reviewCount: prop.reviewCount,
        amenities: prop.amenities.map((a) => ({
          id: a.amenity.id,
          name: a.amenity.name,
          icon: a.amenity.icon,
        })),
        priceStartingDay,
        priceStartingMonth,
        availableHotDesksCount: totalActiveDesks,
      };
    });

    return NextResponse.json({ success: true, count: formatted.length, properties: formatted });
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
