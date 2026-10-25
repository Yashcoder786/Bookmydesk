import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        partner: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
        ratePlans: true,
        floors: {
          orderBy: { sortOrder: "asc" },
          include: {
            zones: {
              include: {
                items: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    let gallery: string[] = [];
    try {
      gallery = JSON.parse(property.galleryImages);
    } catch {
      gallery = [property.coverImage];
    }

    return NextResponse.json({
      success: true,
      property: {
        ...property,
        galleryImages: gallery,
        amenities: property.amenities.map((a) => ({
          id: a.amenity.id,
          name: a.amenity.name,
          icon: a.amenity.icon,
          category: a.amenity.category,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching property details:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch property" },
      { status: 500 }
    );
  }
}
