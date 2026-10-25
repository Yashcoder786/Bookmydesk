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
      email: "admin@coworkhub.in",
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
    { name: "High-Speed 500Mbps Wi-Fi", icon: "Wifi", category: "Work" },
    { name: "Ergonomic Chairs & Desks", icon: "Armchair", category: "Comfort" },
    { name: "Unlimited Artisan Coffee & Tea", icon: "Coffee", category: "Leisure" },
    { name: "Air Conditioned", icon: "Wind", category: "Comfort" },
    { name: "Soundproof Phone Booths", icon: "PhoneCall", category: "Work" },
    { name: "Dual Power Sockets on Desk", icon: "Zap", category: "Utilities" },
    { name: "High-Resolution Laser Printing", icon: "Printer", category: "Utilities" },
    { name: "Conference Room Access", icon: "Users", category: "Work" },
    { name: "Rooftop Breakout Terrace", icon: "Sun", category: "Leisure" },
    { name: "24/7 Biometric Security & CCTV", icon: "ShieldCheck", category: "Utilities" },
    { name: "Dedicated Lockers", icon: "Lock", category: "Utilities" },
    { name: "Metro Station Within 200m", icon: "Train", category: "Convenience" },
  ];

  const amenityRecords = {};
  for (const am of amenitiesList) {
    const record = await prisma.amenity.create({ data: am });
    amenityRecords[am.name] = record.id;
  }

  // PROPERTY 1: Innov8 Hub - Andheri East, Mumbai (PRD Appendix A benchmark property)
  const propAndheri = await prisma.property.create({
    data: {
      id: "prop_innov8_andheri",
      partnerId: partnerProfile.id,
      name: "Innov8 Hub — Andheri East",
      slug: "innov8-hub-andheri-east",
      tagline: "Premium productivity hub 3 mins from Western Express Highway Metro",
      description:
        "Designed for focused professionals, creators, and rapidly growing teams. Innov8 Andheri East offers ultra-ergonomic seating, fiber-grade internet, private soundproof call pods, natural sunlit bays, and an artisan espresso bar. Experience seamless BookMyShow-style seat selection on our live floor plan.",
      address: "Level 4, Akruti Star, Central Road, MIDC, Andheri East",
      city: "Mumbai",
      locality: "Andheri East",
      landmark: "Near Western Express Highway Metro Station",
      latitude: 19.1171,
      longitude: 72.8687,
      openingHours: "08:00 AM - 09:00 PM (Mon - Sat)",
      status: "PUBLISHED",
      coverImage: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80",
      galleryImages: JSON.stringify([
        "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.88,
      reviewCount: 42,
    },
  });

  // Attach amenities
  for (const name of [
    "High-Speed 500Mbps Wi-Fi",
    "Ergonomic Chairs & Desks",
    "Unlimited Artisan Coffee & Tea",
    "Air Conditioned",
    "Soundproof Phone Booths",
    "Dual Power Sockets on Desk",
    "High-Resolution Laser Printing",
    "Metro Station Within 200m",
  ]) {
    await prisma.propertyAmenity.create({
      data: {
        propertyId: propAndheri.id,
        amenityId: amenityRecords[name],
      },
    });
  }

  // Rate plans for Andheri
  await prisma.ratePlan.createMany({
    data: [
      { propertyId: propAndheri.id, inventoryType: "HOT_DESK", billingUnit: "DAY", price: 499, discountPercent: 0 },
      { propertyId: propAndheri.id, inventoryType: "HOT_DESK", billingUnit: "MONTH", price: 7999, discountPercent: 15 },
      { propertyId: propAndheri.id, inventoryType: "DEDICATED_DESK", billingUnit: "DAY", price: 699, discountPercent: 0 },
      { propertyId: propAndheri.id, inventoryType: "DEDICATED_DESK", billingUnit: "MONTH", price: 11999, discountPercent: 10 },
      { propertyId: propAndheri.id, inventoryType: "PRIVATE_CABIN", billingUnit: "DAY", price: 2999, discountPercent: 0 },
      { propertyId: propAndheri.id, inventoryType: "PRIVATE_CABIN", billingUnit: "MONTH", price: 44999, discountPercent: 12 },
    ],
  });

  // Floor 1: Ground Floor (Quiet Focus Bay)
  const floorG = await prisma.floor.create({
    data: {
      propertyId: propAndheri.id,
      name: "Ground Floor — Quiet Focus Bay",
      floorNumber: 0,
      sortOrder: 1,
    },
  });

  // Floor 2: 1st Floor (Collab Hub & Private Cabins)
  const floor1 = await prisma.floor.create({
    data: {
      propertyId: propAndheri.id,
      name: "1st Floor — Collab Hub & Cabins",
      floorNumber: 1,
      sortOrder: 2,
    },
  });

  // Zones for Ground Floor
  const zoneFocus = await prisma.zone.create({
    data: {
      floorId: floorG.id,
      name: "Focus Hot Desk Bay A",
      type: "OPEN_DESK",
      colorCode: "#3b82f6",
    },
  });

  const zoneDedicated = await prisma.zone.create({
    data: {
      floorId: floorG.id,
      name: "Dedicated Desk Bay B",
      type: "OPEN_DESK",
      colorCode: "#8b5cf6",
    },
  });

  // Zones for 1st Floor
  const zoneCabins = await prisma.zone.create({
    data: {
      floorId: floor1.id,
      name: "Executive Private Cabins",
      type: "PRIVATE_CABIN",
      colorCode: "#059669",
    },
  });

  const zoneCollab = await prisma.zone.create({
    data: {
      floorId: floor1.id,
      name: "Collab Hot Desk Bay C",
      type: "OPEN_DESK",
      colorCode: "#0284c7",
    },
  });

  // Add Desks to Ground Floor Focus Bay A (Desks D-01 to D-12)
  // Grid layout coordinates for visual seat map
  const desksFocus = [
    { code: "D-01", x: 40, y: 50, status: "ACTIVE" },
    { code: "D-02", x: 120, y: 50, status: "ACTIVE" },
    { code: "D-03", x: 200, y: 50, status: "ACTIVE" },
    { code: "D-04", x: 280, y: 50, status: "ACTIVE" },
    { code: "D-05", x: 40, y: 150, status: "ACTIVE" },
    { code: "D-06", x: 120, y: 150, status: "ACTIVE" },
    { code: "D-07", x: 200, y: 150, status: "ACTIVE" },
    { code: "D-08", x: 280, y: 150, status: "ACTIVE" }, // PRD benchmark desk!
    { code: "D-09", x: 40, y: 250, status: "ACTIVE" },
    { code: "D-10", x: 120, y: 250, status: "ACTIVE" },
    { code: "D-11", x: 200, y: 250, status: "MAINTENANCE" }, // Maintenance showcase
    { code: "D-12", x: 280, y: 250, status: "ACTIVE" },
  ];

  const createdDesks = {};
  for (const item of desksFocus) {
    const inv = await prisma.inventoryItem.create({
      data: {
        zoneId: zoneFocus.id,
        code: item.code,
        name: `Desk ${item.code} (Ergonomic Window Bay)`,
        type: "HOT_DESK",
        capacity: 1,
        features: JSON.stringify(["Herman Miller Chair", "Dual 3-Pin Outlets", "Fast LAN Port", "Sunlit Window View"]),
        mapX: item.x,
        mapY: item.y,
        width: 60,
        height: 60,
        activeStatus: item.status,
      },
    });
    createdDesks[item.code] = inv;
  }

  // Add Dedicated Desks (DD-01 to DD-06)
  const dedicatedDesks = [
    { code: "DD-01", x: 400, y: 50 },
    { code: "DD-02", x: 480, y: 50 },
    { code: "DD-03", x: 400, y: 150 },
    { code: "DD-04", x: 480, y: 150 },
    { code: "DD-05", x: 400, y: 250 },
    { code: "DD-06", x: 480, y: 250 },
  ];

  for (const item of dedicatedDesks) {
    await prisma.inventoryItem.create({
      data: {
        zoneId: zoneDedicated.id,
        code: item.code,
        name: `Dedicated Desk ${item.code}`,
        type: "DEDICATED_DESK",
        capacity: 1,
        features: JSON.stringify(["Permanent Lockable Pedestal", "27-inch 4K Monitor Arm", "Dedicated Power Line", "Ergonomic Mesh Seating"]),
        mapX: item.x,
        mapY: item.y,
        width: 65,
        height: 65,
        activeStatus: "ACTIVE",
      },
    });
  }

  // Add Private Cabins on 1st Floor
  const cabins = [
    { code: "CAB-01", name: "Alpha Executive Cabin (4-Seater)", x: 40, y: 50, cap: 4, width: 150, height: 110 },
    { code: "CAB-02", name: "Beta Glass Cabin (6-Seater)", x: 230, y: 50, cap: 6, width: 180, height: 110 },
    { code: "CAB-03", name: "Gamma Team Suite (8-Seater)", x: 40, y: 200, cap: 8, width: 220, height: 130 },
    { code: "CAB-04", name: "Delta Founder Cabin (2-Seater)", x: 300, y: 200, cap: 2, width: 140, height: 130 },
  ];

  for (const c of cabins) {
    await prisma.inventoryItem.create({
      data: {
        zoneId: zoneCabins.id,
        code: c.code,
        name: c.name,
        type: "PRIVATE_CABIN",
        capacity: c.cap,
        features: JSON.stringify(["Private Access Keycard", "Dedicated Whiteboard", "Conference Table & Ergonomic Chairs", "Acoustic Glass Walls", "Private AC Control"]),
        mapX: c.x,
        mapY: c.y,
        width: c.width,
        height: c.height,
        activeStatus: "ACTIVE",
      },
    });
  }

  // PROPERTY 2: The Hive Workspaces — BKC, Mumbai
  const propBKC = await prisma.property.create({
    data: {
      id: "prop_thehive_bkc",
      partnerId: partnerProfile.id,
      name: "The Hive — Bandra Kurla Complex (BKC)",
      slug: "the-hive-bkc-mumbai",
      tagline: "Ultra-luxurious corporate suites & agile hot desks in Mumbai's financial center",
      description:
        "Located in the prestigious Maker Maxity hub of BKC. The Hive offers hotel-grade hospitality, executive boardrooms, soundproof private offices, and dynamic hot desks tailored for hedge funds, venture teams, and elite consultants.",
      address: "Tower 2, Maker Maxity, Bandra Kurla Complex, Bandra East",
      city: "Mumbai",
      locality: "BKC",
      landmark: "Opposite Jio World Convention Centre",
      latitude: 19.0657,
      longitude: 72.8644,
      openingHours: "07:30 AM - 10:00 PM (Everyday)",
      status: "PUBLISHED",
      coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
      galleryImages: JSON.stringify([
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.94,
      reviewCount: 58,
    },
  });

  await prisma.ratePlan.createMany({
    data: [
      { propertyId: propBKC.id, inventoryType: "HOT_DESK", billingUnit: "DAY", price: 699, discountPercent: 0 },
      { propertyId: propBKC.id, inventoryType: "HOT_DESK", billingUnit: "MONTH", price: 11999, discountPercent: 10 },
      { propertyId: propBKC.id, inventoryType: "PRIVATE_CABIN", billingUnit: "DAY", price: 4499, discountPercent: 0 },
      { propertyId: propBKC.id, inventoryType: "PRIVATE_CABIN", billingUnit: "MONTH", price: 69999, discountPercent: 15 },
    ],
  });

  const floorBKC = await prisma.floor.create({
    data: {
      propertyId: propBKC.id,
      name: "Main Floor — Financial Executive Wing",
      floorNumber: 5,
      sortOrder: 1,
    },
  });

  const zoneBKCHot = await prisma.zone.create({
    data: {
      floorId: floorBKC.id,
      name: "Cityscape Hot Desks",
      type: "OPEN_DESK",
      colorCode: "#3b82f6",
    },
  });

  for (let i = 1; i <= 8; i++) {
    const code = `BKC-D0${i}`;
    await prisma.inventoryItem.create({
      data: {
        zoneId: zoneBKCHot.id,
        code,
        name: `Executive Desk ${code}`,
        type: "HOT_DESK",
        capacity: 1,
        features: JSON.stringify(["Panoramic City View", "Leather Executive Seating", "High-Speed Dual Fiber"]),
        mapX: 40 + (i - 1) * 75,
        mapY: 80,
        width: 60,
        height: 60,
        activeStatus: "ACTIVE",
      },
    });
  }

  // PROPERTY 3: WeCreate Studio — Koramangala, Bengaluru
  const propKoramangala = await prisma.property.create({
    data: {
      id: "prop_wecreate_blr",
      partnerId: partnerProfile.id,
      name: "WeCreate Tech Studio — Koramangala",
      slug: "wecreate-studio-koramangala-bengaluru",
      tagline: "Vibrant startup hub with rooftop brew bar in Bangalore's tech heart",
      description:
        "Surrounded by top coffee shops and venture hubs in Koramangala 4th Block. Offers standing desks, podcast studio, high-speed Wi-Fi, and 24/7 power backup for high-growth tech founders.",
      address: "80 Feet Road, 4th Block, Koramangala",
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
      { propertyId: propKoramangala.id, inventoryType: "HOT_DESK", billingUnit: "DAY", price: 449, discountPercent: 0 },
      { propertyId: propKoramangala.id, inventoryType: "HOT_DESK", billingUnit: "MONTH", price: 7499, discountPercent: 12 },
    ],
  });

  const floorBLR = await prisma.floor.create({
    data: {
      propertyId: propKoramangala.id,
      name: "Ground Floor — Silicon Valley Wing",
      floorNumber: 0,
      sortOrder: 1,
    },
  });

  const zoneBLR = await prisma.zone.create({
    data: {
      floorId: floorBLR.id,
      name: "Startup Pitch Bay",
      type: "OPEN_DESK",
      colorCode: "#3b82f6",
    },
  });

  for (let i = 1; i <= 6; i++) {
    const code = `BLR-D0${i}`;
    await prisma.inventoryItem.create({
      data: {
        zoneId: zoneBLR.id,
        code,
        name: `Startup Desk ${code}`,
        type: "HOT_DESK",
        capacity: 1,
        features: JSON.stringify(["Standing Desk Option", "Whiteboard Table", "Unlimited Filter Coffee"]),
        mapX: 50 + (i - 1) * 85,
        mapY: 90,
        width: 65,
        height: 65,
        activeStatus: "ACTIVE",
      },
    });
  }

  // Seed sample confirmed booking for Desk D-02 to showcase BOOKED state on the map!
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0);
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0);

  const sampleBooking = await prisma.booking.create({
    data: {
      id: "CW-10291",
      bookingRef: "BK-CONFIRMED-DEMO",
      userId: customer.id,
      propertyId: propAndheri.id,
      bookingPlan: "DAY",
      startAt: todayStart,
      endAt: todayEnd,
      status: "CONFIRMED",
      guestName: "Priya Sharma",
      guestEmail: "priya.sharma@example.com",
      guestPhone: "+91 98200 12345",
      subtotal: 499,
      taxAmount: 89.82,
      discountAmount: 0,
      totalAmount: 588.82,
      checkInQrData: "CW-10291:PRIYA_SHARMA:DESK_D02",
      items: {
        create: [
          {
            inventoryItemId: createdDesks["D-02"].id,
            unitPrice: 499,
            itemSnapshot: JSON.stringify({ code: "D-02", name: "Desk D-02 (Ergonomic Window Bay)" }),
          },
        ],
      },
      payments: {
        create: [
          {
            provider: "SIMULATED",
            providerRef: "SIM_TXN_9921",
            amount: 588.82,
            status: "SUCCESS",
            paymentMethod: "MOCK_UPI",
          },
        ],
      },
    },
  });

  // Seed a sample temporary hold on D-05 (expires in 4 minutes) to showcase HELD state!
  const holdExpiry = new Date(Date.now() + 4 * 60 * 1000);
  await prisma.inventoryHold.create({
    data: {
      userId: customer.id,
      inventoryItemId: createdDesks["D-05"].id,
      startAt: todayStart,
      endAt: todayEnd,
      expiresAt: holdExpiry,
      status: "ACTIVE",
    },
  });

  console.log("Database seeded successfully with properties, visual floor map assets, amenities, and initial bookings!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
