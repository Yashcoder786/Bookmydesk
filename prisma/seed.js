const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Co-Working Space Booking Platform database...");

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.inventoryHold.deleteMany();
  await prisma.availabilityBlock.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.ratePlan.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.property.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create Users: Customer, Partner, Admin
  const customer = await prisma.user.create({
    data: {
      id: "usr_customer_1",
      email: "yash.salvi@example.com",
      name: "Yash Salvi",
      phone: "+91 98765 43210",
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const partnerUser = await prisma.user.create({
    data: {
      id: "usr_partner_1",
      email: "partner@innov8work.com",
      name: "Innov8 Workspaces Management",
      phone: "+91 91234 56789",
      role: "PARTNER",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: "usr_admin_1",
      email: "admin@bookmydesk.in",
      name: "Platform Administrator",
      phone: "+91 99999 88888",
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  });

  const partnerProfile = await prisma.partnerProfile.create({
    data: {
      userId: partnerUser.id,
      businessName: "Innov8 Workspaces Pvt Ltd",
      contactPhone: "+91 91234 56789",
      verificationStatus: "APPROVED",
      gstin: "27AABCI9988C1Z4",
    },
  });

  // Create Amenities
  const amenitiesList = [
    { name: "High-Speed Wi-Fi", icon: "Wifi", category: "Work" },
    { name: "Free Artisan Coffee & Tea", icon: "Coffee", category: "Leisure" },
    { name: "Ergonomic Chairs", icon: "Armchair", category: "Comfort" },
    { name: "Air Conditioned", icon: "Wind", category: "Comfort" },
    { name: "Phone Booths", icon: "PhoneCall", category: "Work" },
    { name: "Power Sockets", icon: "Zap", category: "Utilities" },
    { name: "Laser Printing", icon: "Printer", category: "Utilities" },
    { name: "Meeting Rooms", icon: "Users", category: "Work" },
  ];

  const amenityRecords = {};
  for (const am of amenitiesList) {
    const record = await prisma.amenity.create({ data: am });
    amenityRecords[am.name] = record.id;
  }

  // PROPERTY 1: Innov8 Hub - Bandra (Exact match to screenshot!)
  const propBandra = await prisma.property.create({
    data: {
      id: "prop_innov8_bandra",
      partnerId: partnerProfile.id,
      name: "Innov8 Hub - Bandra",
      slug: "innov8-hub-bandra",
      tagline: "A vibrant coworking space with high-speed wifi and free coffee.",
      description:
        "A vibrant coworking space with high-speed wifi and free coffee. Located in the heart of Bandra West, Mumbai, close to trendy cafes, metro connectivity, and creative studios.",
      address: "Bandra West, Mumbai",
      city: "Mumbai",
      locality: "Bandra West",
      landmark: "Near Linking Road",
      latitude: 19.0596,
      longitude: 72.8295,
      openingHours: "08:00 AM - 09:00 PM (Everyday)",
      status: "PUBLISHED",
      coverImage: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80",
      galleryImages: JSON.stringify([
        "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.9,
      reviewCount: 38,
    },
  });

  // Attach amenities
  for (const name of [
    "High-Speed Wi-Fi",
    "Free Artisan Coffee & Tea",
    "Ergonomic Chairs",
    "Air Conditioned",
    "Power Sockets",
  ]) {
    await prisma.propertyAmenity.create({
      data: {
        propertyId: propBandra.id,
        amenityId: amenityRecords[name],
      },
    });
  }

  // Rate plans for Bandra: ₹500/day for Desks, ₹1,200/day for Cabins
  await prisma.ratePlan.createMany({
    data: [
      { propertyId: propBandra.id, inventoryType: "HOT_DESK", billingUnit: "DAY", price: 500, discountPercent: 0 },
      { propertyId: propBandra.id, inventoryType: "HOT_DESK", billingUnit: "MONTH", price: 8500, discountPercent: 10 },
      { propertyId: propBandra.id, inventoryType: "PRIVATE_CABIN", billingUnit: "DAY", price: 1200, discountPercent: 0 },
      { propertyId: propBandra.id, inventoryType: "PRIVATE_CABIN", billingUnit: "MONTH", price: 22000, discountPercent: 10 },
    ],
  });

  // Floor
  const floorBandra = await prisma.floor.create({
    data: {
      propertyId: propBandra.id,
      name: "Main Floor",
      floorNumber: 1,
      sortOrder: 1,
    },
  });

  const zoneBandra = await prisma.zone.create({
    data: {
      floorId: floorBandra.id,
      name: "Workspace Units",
      type: "OPEN_DESK",
      colorCode: "#2563eb",
    },
  });

  // Create exactly 8 Desks (Desk-1 to Desk-8) at ₹500/day
  const createdUnits = {};
  for (let i = 1; i <= 8; i++) {
    const code = `Desk-${i}`;
    const inv = await prisma.inventoryItem.create({
      data: {
        zoneId: zoneBandra.id,
        code,
        name: code,
        type: "HOT_DESK",
        capacity: 1,
        features: JSON.stringify(["High-Speed Wi-Fi", "Ergonomic Chair", "Power Socket", "Free Coffee"]),
        mapX: ((i - 1) % 6) * 120 + 20,
        mapY: Math.floor((i - 1) / 6) * 120 + 20,
        width: 110,
        height: 100,
        activeStatus: "ACTIVE",
      },
    });
    createdUnits[code] = inv;
  }

  // Create 3 Cabins: Cabin-1 (Reserved), Cabin-2 (₹1,200/day), Cabin-3 (₹1,200/day)
  for (let i = 1; i <= 3; i++) {
    const code = `Cabin-${i}`;
    const inv = await prisma.inventoryItem.create({
      data: {
        zoneId: zoneBandra.id,
        code,
        name: code,
        type: "PRIVATE_CABIN",
        capacity: 4,
        features: JSON.stringify(["Private Glass Cabin", "4 Ergonomic Seats", "Whiteboard", "High-Speed Wi-Fi"]),
        mapX: (i - 1) * 240 + 20,
        mapY: 260,
        width: 220,
        height: 100,
        activeStatus: "ACTIVE",
      },
    });
    createdUnits[code] = inv;
  }

  // PROPERTY 2: Innov8 Hub — Andheri East, Mumbai
  const propAndheri = await prisma.property.create({
    data: {
      id: "prop_innov8_andheri",
      partnerId: partnerProfile.id,
      name: "Innov8 Hub — Andheri East",
      slug: "innov8-hub-andheri-east",
      tagline: "Premium productivity hub 3 mins from Western Express Highway Metro",
      description: "Designed for focused professionals, creators, and rapidly growing teams in MIDC Andheri East.",
      address: "MIDC, Andheri East, Mumbai",
      city: "Mumbai",
      locality: "Andheri East",
      landmark: "Near WEH Metro",
      latitude: 19.1171,
      longitude: 72.8687,
      openingHours: "08:00 AM - 09:00 PM",
      status: "PUBLISHED",
      coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
      galleryImages: JSON.stringify([
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.88,
      reviewCount: 42,
    },
  });

  await prisma.ratePlan.createMany({
    data: [
      { propertyId: propAndheri.id, inventoryType: "HOT_DESK", billingUnit: "DAY", price: 500, discountPercent: 0 },
      { propertyId: propAndheri.id, inventoryType: "HOT_DESK", billingUnit: "MONTH", price: 8000, discountPercent: 10 },
      { propertyId: propAndheri.id, inventoryType: "PRIVATE_CABIN", billingUnit: "DAY", price: 1200, discountPercent: 0 },
      { propertyId: propAndheri.id, inventoryType: "PRIVATE_CABIN", billingUnit: "MONTH", price: 24000, discountPercent: 10 },
    ],
  });

  const floorAndheri = await prisma.floor.create({
    data: {
      propertyId: propAndheri.id,
      name: "Main Floor",
      floorNumber: 1,
      sortOrder: 1,
    },
  });

  const zoneAndheri = await prisma.zone.create({
    data: {
      floorId: floorAndheri.id,
      name: "Workspace Units",
      type: "OPEN_DESK",
      colorCode: "#2563eb",
    },
  });

  for (let i = 1; i <= 8; i++) {
    await prisma.inventoryItem.create({
      data: {
        zoneId: zoneAndheri.id,
        code: `Desk-${i}`,
        name: `Desk-${i}`,
        type: "HOT_DESK",
        capacity: 1,
        features: JSON.stringify(["High-Speed Wi-Fi", "Ergonomic Chair", "Power Socket"]),
        mapX: ((i - 1) % 6) * 120 + 20,
        mapY: Math.floor((i - 1) / 6) * 120 + 20,
        width: 110,
        height: 100,
        activeStatus: "ACTIVE",
      },
    });
  }

  for (let i = 1; i <= 3; i++) {
    await prisma.inventoryItem.create({
      data: {
        zoneId: zoneAndheri.id,
        code: `Cabin-${i}`,
        name: `Cabin-${i}`,
        type: "PRIVATE_CABIN",
        capacity: 4,
        features: JSON.stringify(["Private Glass Cabin", "4 Ergonomic Seats"]),
        mapX: (i - 1) * 240 + 20,
        mapY: 260,
        width: 220,
        height: 100,
        activeStatus: "ACTIVE",
      },
    });
  }

  // PROPERTY 3: WeCreate Studio — Koramangala
  const propKoramangala = await prisma.property.create({
    data: {
      id: "prop_wecreate_blr",
      partnerId: partnerProfile.id,
      name: "WeCreate Studio - Koramangala",
      slug: "wecreate-studio-koramangala-bengaluru",
      tagline: "Vibrant startup hub with rooftop brew bar in Bangalore's tech heart",
      description: "Surrounded by top coffee shops and venture hubs in Koramangala 4th Block.",
      address: "Koramangala, Bengaluru",
      city: "Bengaluru",
      locality: "Koramangala",
      landmark: "Near Sony World Signal",
      latitude: 12.9352,
      longitude: 77.6245,
      openingHours: "24 Hours (7 Days)",
      status: "PUBLISHED",
      coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
      galleryImages: JSON.stringify([
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.82,
      reviewCount: 37,
    },
  });

  await prisma.ratePlan.createMany({
    data: [
      { propertyId: propKoramangala.id, inventoryType: "HOT_DESK", billingUnit: "DAY", price: 500, discountPercent: 0 },
      { propertyId: propKoramangala.id, inventoryType: "HOT_DESK", billingUnit: "MONTH", price: 7500, discountPercent: 10 },
      { propertyId: propKoramangala.id, inventoryType: "PRIVATE_CABIN", billingUnit: "DAY", price: 1200, discountPercent: 0 },
      { propertyId: propKoramangala.id, inventoryType: "PRIVATE_CABIN", billingUnit: "MONTH", price: 21000, discountPercent: 10 },
    ],
  });

  const floorBLR = await prisma.floor.create({
    data: {
      propertyId: propKoramangala.id,
      name: "Main Floor",
      floorNumber: 1,
      sortOrder: 1,
    },
  });

  const zoneBLR = await prisma.zone.create({
    data: {
      floorId: floorBLR.id,
      name: "Workspace Units",
      type: "OPEN_DESK",
      colorCode: "#2563eb",
    },
  });

  for (let i = 1; i <= 8; i++) {
    await prisma.inventoryItem.create({
      data: {
        zoneId: zoneBLR.id,
        code: `Desk-${i}`,
        name: `Desk-${i}`,
        type: "HOT_DESK",
        capacity: 1,
        features: JSON.stringify(["High-Speed Wi-Fi", "Ergonomic Chair", "Power Socket"]),
        mapX: ((i - 1) % 6) * 120 + 20,
        mapY: Math.floor((i - 1) / 6) * 120 + 20,
        width: 110,
        height: 100,
        activeStatus: "ACTIVE",
      },
    });
  }

  for (let i = 1; i <= 3; i++) {
    await prisma.inventoryItem.create({
      data: {
        zoneId: zoneBLR.id,
        code: `Cabin-${i}`,
        name: `Cabin-${i}`,
        type: "PRIVATE_CABIN",
        capacity: 4,
        features: JSON.stringify(["Private Glass Cabin", "4 Ergonomic Seats"]),
        mapX: (i - 1) * 240 + 20,
        mapY: 260,
        width: 220,
        height: 100,
        activeStatus: "ACTIVE",
      },
    });
  }

  // Create an active reservation for Cabin-1 for the screenshot dates (so Cabin-1 shows "Reserved" in gray!)
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days reservation

  await prisma.booking.create({
    data: {
      id: "CW-10024",
      bookingRef: "BK-CABIN1-RESERVED",
      userId: customer.id,
      propertyId: propBandra.id,
      bookingPlan: "DAY",
      startAt: startDate,
      endAt: endDate,
      status: "CONFIRMED",
      guestName: "Priya Sharma",
      guestEmail: "priya.sharma@example.com",
      guestPhone: "+91 98200 12345",
      subtotal: 1200,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 1200,
      items: {
        create: [
          {
            inventoryItemId: createdUnits["Cabin-1"].id,
            unitPrice: 1200,
            itemSnapshot: JSON.stringify({ code: "Cabin-1", name: "Cabin-1" }),
          },
        ],
      },
    },
  });

  console.log("Database seeded with Innov8 Hub - Bandra matching user screenshot exactly!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
