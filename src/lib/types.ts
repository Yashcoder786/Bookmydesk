export type InventoryType = "HOT_DESK" | "DEDICATED_DESK" | "PRIVATE_CABIN" | "MEETING_ROOM";

export type SeatStatus = "AVAILABLE" | "SELECTED" | "HELD" | "BOOKED" | "BLOCKED" | "MAINTENANCE";

export type BookingPlan = "DAY" | "MONTH";

export interface InventoryItemDTO {
  id: string;
  zoneId: string;
  zoneName: string;
  zoneType: string;
  zoneColor: string;
  code: string;
  name: string;
  type: InventoryType;
  capacity: number;
  features: string[];
  mapX: number;
  mapY: number;
  width: number;
  height: number;
  activeStatus: string;
  status: SeatStatus;
  holdExpiresAt?: string | null;
  pricePerDay?: number;
  pricePerMonth?: number;
}

export interface ZoneDTO {
  id: string;
  name: string;
  type: string;
  colorCode: string;
  items: InventoryItemDTO[];
}

export interface FloorDTO {
  id: string;
  name: string;
  floorNumber: number;
  sortOrder: number;
  zones: ZoneDTO[];
}

export interface PropertyCardDTO {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  address: string;
  city: string;
  locality: string;
  landmark?: string | null;
  openingHours: string;
  status: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  amenities: { id: string; name: string; icon: string }[];
  priceStartingDay: number;
  priceStartingMonth: number;
  availableHotDesksCount?: number;
}

export interface PriceBreakdown {
  basePrice: number;
  quantity: number;
  daysOrMonths: number;
  unit: BookingPlan;
  subtotal: number;
  discount: number;
  tax: number; // 18% GST standard in India
  total: number;
}
