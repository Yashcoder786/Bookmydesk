"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Clock,
  Sparkles,
} from "lucide-react";
import { FloorDTO, InventoryItemDTO } from "@/lib/types";

// Desk Icon matching screenshot
function DeskIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 18v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M4 14h16" />
      <path d="M9 8h6" />
      <path d="M12 4v4" />
    </svg>
  );
}

// Cabin Icon matching screenshot
function CabinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
      <path d="M2 20h20" />
      <path d="M14 12v.01" />
    </svg>
  );
}

function WorkspaceDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id as string;

  // Initial dates matching screenshot: 10/26/2026 to 10/27/2026
  const [startDateStr, setStartDateStr] = useState("2026-10-26");
  const [endDateStr, setEndDateStr] = useState("2026-10-27");
  const [bookingType, setBookingType] = useState<"Daily" | "Monthly">("Daily");

  const [property, setProperty] = useState<any>(null);
  const [floors, setFloors] = useState<FloorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [selectedUnit, setSelectedUnit] = useState<InventoryItemDTO | null>(null);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [guestName, setGuestName] = useState("Yash Salvi");
  const [guestEmail, setGuestEmail] = useState("yash.salvi@example.com");
  const [guestPhone, setGuestPhone] = useState("+91 98765 43210");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const pRes = await fetch(`/api/properties/${id}`);
        const pData = await pRes.json();
        if (pData.success) {
          setProperty(pData.property);
        }
        await fetchMap(startDateStr, endDateStr);
      } catch (err) {
        console.error("Failed to load workspace data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const fetchMap = async (start: string, end: string) => {
    setCheckingAvailability(true);
    try {
      const res = await fetch(
        `/api/properties/${id}/map?date=${start}&plan=${bookingType === "Daily" ? "DAY" : "MONTH"}`
      );
      const data = await res.json();
      if (data.success) {
        setFloors(data.floors);

        // If selected unit is now booked, unselect it
        if (selectedUnit) {
          for (const f of data.floors) {
            for (const z of f.zones) {
              const match = z.items.find((i: InventoryItemDTO) => i.id === selectedUnit.id);
              if (match && match.status === "BOOKED") {
                setSelectedUnit(null);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error checking availability", err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMap(startDateStr, endDateStr);
  };

  const handleUnitClick = (item: InventoryItemDTO) => {
    if (item.status === "BOOKED" || item.status === "MAINTENANCE" || item.status === "BLOCKED") {
      return; // Not selectable
    }
    if (selectedUnit?.id === item.id) {
      setSelectedUnit(null);
    } else {
      setSelectedUnit(item);
    }
  };

  // Calculate day count
  const sDate = new Date(startDateStr);
  const eDate = new Date(endDateStr);
  const diffTime = Math.max(eDate.getTime() - sDate.getTime(), 24 * 60 * 60 * 1000);
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) || 1;

  // Rate calculation
  const unitRate = selectedUnit
    ? selectedUnit.type === "PRIVATE_CABIN"
      ? 1200
      : 500
    : 500;
  const totalPrice = unitRate * diffDays;

  // Flatten all units from floors & zones
  const allUnits: InventoryItemDTO[] = [];
  floors.forEach((f) => {
    f.zones.forEach((z) => {
      z.items.forEach((item) => {
        allUnits.push(item);
      });
    });
  });

  const availableCount = allUnits.filter(
    (u) => u.status === "AVAILABLE" || (selectedUnit && u.id === selectedUnit.id)
  ).length;

  const handleConfirmReservation = async () => {
    if (!selectedUnit || !property) return;
    setConfirming(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          inventoryItemId: selectedUnit.id,
          bookingPlan: bookingType === "Daily" ? "DAY" : "MONTH",
          startAt: new Date(startDateStr + "T08:00:00").toISOString(),
          endAt: new Date(endDateStr + "T20:00:00").toISOString(),
          guestName,
          guestEmail,
          guestPhone,
          userId: "usr_customer_1",
          paymentMethod: "PAY_AT_DESK",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Reservation failed. Please try another unit.");
        fetchMap(startDateStr, endDateStr);
        return;
      }

      // Success! Navigate to digital pass
      router.push(`/pass/${data.booking.id}`);
    } catch (err: any) {
      alert("Error confirming reservation: " + err.message);
    } finally {
      setConfirming(false);
    }
  };

  if (loading || !property) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0", color: "#64748b" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
        <p style={{ fontSize: "0.95rem" }}>Loading workspace...</p>
      </div>
    );
  }

  // Format dates for display
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split("-");
    return `${m}/${d}/${y}`;
  };

  return (
    <div style={{ maxWidth: 1360, margin: "1.5rem auto 4rem", padding: "0 2rem" }}>
      {/* Top Section: Property Header on Left, Date Selector Card on Right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Left: Property Info */}
        <div style={{ flex: "1 1 500px" }}>
          {/* Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span className="badge-pill-purple">Flexible workspace</span>
            <span className="badge-pill-green">Flexible booking</span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "2.35rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
              marginBottom: "0.4rem",
            }}
          >
            {property.name}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "0.95rem",
              color: "#475569",
              lineHeight: 1.5,
              marginBottom: "0.45rem",
            }}
          >
            {property.tagline || property.description}
          </p>

          {/* Location */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "#64748b",
              fontSize: "0.92rem",
            }}
          >
            <MapPin size={17} color="#64748b" />
            <span>{property.locality}, {property.city}</span>
          </div>
        </div>

        {/* Right: Date Picker Box matching screenshot */}
        <div
          className="clean-card"
          style={{
            padding: "1rem 1.35rem",
            width: "100%",
            maxWidth: "480px",
            background: "#ffffff",
          }}
        >
          <form onSubmit={handleCheckAvailability}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
              {/* Start Date */}
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontWeight: 500,
                    marginBottom: "0.3rem",
                  }}
                >
                  Start date
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "0.45rem 0.65rem",
                    background: "#ffffff",
                  }}
                >
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: "#0f172a",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                  />
                  <Calendar size={15} color="#64748b" />
                </div>
              </div>

              {/* End Date */}
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontWeight: 500,
                    marginBottom: "0.3rem",
                  }}
                >
                  End date
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "0.45rem 0.65rem",
                    background: "#ffffff",
                  }}
                >
                  <input
                    type="date"
                    value={endDateStr}
                    min={startDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: "#0f172a",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                  />
                  <Calendar size={15} color="#64748b" />
                </div>
              </div>

              {/* Check Availability Button */}
              <button
                type="submit"
                disabled={checkingAvailability}
                style={{
                  background: "#1d4ed8",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.55rem 1rem",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  height: "36px",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s ease",
                }}
              >
                {checkingAvailability ? "Checking..." : "Check availability"}
              </button>
            </div>

            <p
              style={{
                fontSize: "0.72rem",
                color: "#94a3b8",
                marginTop: "0.5rem",
                lineHeight: 1.4,
              }}
            >
              Daily reservations are priced per day. The end date is your checkout date. You can adjust it for longer stays.
            </p>
          </form>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "1.75rem",
          alignItems: "start",
        }}
      >
        {/* Left Column: Choose Your Unit */}
        <div className="clean-card" style={{ padding: "1.5rem" }}>
          {/* Header & Legend */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                }}
              >
                Choose your unit
              </h2>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#64748b",
                  marginTop: "0.2rem",
                }}
              >
                {availableCount} available for your selected dates
              </p>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", fontSize: "0.82rem", color: "#64748b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    border: "1.5px solid #86efac",
                    background: "#f0fdf4",
                  }}
                />
                <span>Available</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    border: "1px solid #cbd5e1",
                    background: "#f1f5f9",
                  }}
                />
                <span>Booked</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: "#1d4ed8",
                  }}
                />
                <span>Your Selection</span>
              </div>
            </div>
          </div>

          {/* Units Floor Plan Grid Container */}
          <div
            style={{
              border: "1px dashed #cbd5e1",
              borderRadius: "12px",
              padding: "1.5rem",
              background: "#fafafa",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "0.85rem",
              }}
            >
              {allUnits.map((item) => {
                const isSelected = selectedUnit?.id === item.id;
                const isBooked = item.status === "BOOKED" || item.activeStatus === "BLOCKED";
                const isCabin = item.type === "PRIVATE_CABIN";

                // Cabin cards span 2 columns in the grid
                const gridColumn = isCabin ? "span 2" : "span 1";

                let cardBg = "#f0fdf4";
                let cardBorder = "1.5px solid #86efac";
                let cardTextColor = "#15803d";
                let iconColor = "#15803d";

                if (isSelected) {
                  cardBg = "#1d4ed8";
                  cardBorder = "2px solid #1e40af";
                  cardTextColor = "#ffffff";
                  iconColor = "#ffffff";
                } else if (isBooked) {
                  cardBg = "#f1f5f9";
                  cardBorder = "1px solid #cbd5e1";
                  cardTextColor = "#64748b";
                  iconColor = "#94a3b8";
                }

                const priceText = isBooked
                  ? "Reserved"
                  : isCabin
                  ? "₹1,200/day"
                  : "₹500/day";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleUnitClick(item)}
                    style={{
                      gridColumn,
                      background: cardBg,
                      border: cardBorder,
                      borderRadius: "10px",
                      padding: "1rem 0.5rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      cursor: isBooked ? "not-allowed" : "pointer",
                      transition: "all 0.15s ease",
                      userSelect: "none",
                      minHeight: "92px",
                      boxShadow: isSelected ? "0 4px 12px rgba(29, 78, 216, 0.3)" : "none",
                    }}
                  >
                    <div style={{ color: iconColor }}>
                      {isCabin ? <CabinIcon size={20} /> : <DeskIcon size={20} />}
                    </div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        color: cardTextColor,
                      }}
                    >
                      {item.code}
                    </div>

                    <div
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? "#ffffff" : isBooked ? "#64748b" : "#16a34a",
                      }}
                    >
                      {priceText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Summary Card */}
        <div
          className="clean-card"
          style={{
            padding: "1.5rem",
            background: "#ffffff",
          }}
        >
          <h3
            style={{
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "1.1rem",
            }}
          >
            Booking Summary
          </h3>

          {!selectedUnit ? (
            <p
              style={{
                fontSize: "0.88rem",
                color: "#475569",
                lineHeight: 1.5,
                marginBottom: "1.5rem",
              }}
            >
              Choose an available unit on the floor plan to continue.
            </p>
          ) : (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "0.85rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.4rem",
                }}
              >
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Selected Unit:</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#1d4ed8",
                  }}
                >
                  {selectedUnit.code}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.4rem",
                  fontSize: "0.82rem",
                }}
              >
                <span style={{ color: "#64748b" }}>Dates:</span>
                <span style={{ color: "#0f172a", fontWeight: 600 }}>
                  {formatDateDisplay(startDateStr)} - {formatDateDisplay(endDateStr)} ({diffDays} day{diffDays > 1 ? "s" : ""})
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.4rem",
                  borderTop: "1px dashed #cbd5e1",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#0f172a" }}>Total:</span>
                <span style={{ color: "#1d4ed8", fontSize: "1.05rem" }}>₹{totalPrice}</span>
              </div>
            </div>
          )}

          {/* Booking Type Selector */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.4rem",
              }}
            >
              Booking type
            </label>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setBookingType("Daily")}
                style={{
                  flex: 1,
                  padding: "0.55rem",
                  borderRadius: "8px",
                  border: bookingType === "Daily" ? "1.5px solid #4f46e5" : "1px solid #e2e8f0",
                  background: bookingType === "Daily" ? "#eef2ff" : "#ffffff",
                  color: bookingType === "Daily" ? "#4338ca" : "#64748b",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Daily
              </button>

              <button
                type="button"
                onClick={() => setBookingType("Monthly")}
                style={{
                  flex: 1,
                  padding: "0.55rem",
                  borderRadius: "8px",
                  border: bookingType === "Monthly" ? "1.5px solid #4f46e5" : "1px solid #e2e8f0",
                  background: bookingType === "Monthly" ? "#eef2ff" : "#ffffff",
                  color: bookingType === "Monthly" ? "#4338ca" : "#64748b",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Action CTA Button */}
          <button
            type="button"
            disabled={!selectedUnit}
            onClick={() => setShowReviewModal(true)}
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "10px",
              border: "none",
              background: selectedUnit ? "#2563eb" : "#93c5fd",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: selectedUnit ? "pointer" : "not-allowed",
              boxShadow: selectedUnit ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            Review booking
          </button>

          <p
            style={{
              fontSize: "0.72rem",
              color: "#64748b",
              textAlign: "center",
              marginTop: "0.75rem",
              lineHeight: 1.4,
            }}
          >
            Confirm your dates and workspace before reserving. No online payment is collected.
          </p>
        </div>
      </div>

      {/* Review Booking Modal */}
      {showReviewModal && selectedUnit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="clean-card fade-in"
            style={{
              maxWidth: 480,
              width: "100%",
              padding: "2rem",
              background: "#ffffff",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0f172a" }}>
                Review Your Reservation
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Reservation details summary */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1.25rem",
                fontSize: "0.88rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                <span style={{ color: "#64748b" }}>Workspace:</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{property.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                <span style={{ color: "#64748b" }}>Unit:</span>
                <span style={{ fontWeight: 700, color: "#2563eb" }}>{selectedUnit.code}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                <span style={{ color: "#64748b" }}>Dates:</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  {formatDateDisplay(startDateStr)} - {formatDateDisplay(endDateStr)} ({diffDays} day{diffDays > 1 ? "s" : ""})
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "0.5rem",
                  borderTop: "1px dashed #cbd5e1",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#0f172a" }}>Total Amount:</span>
                <span style={{ color: "#1d4ed8" }}>₹{totalPrice}</span>
              </div>
            </div>

            {/* Guest info */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "0.3rem",
                }}
              >
                Guest Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "8px",
                padding: "0.65rem 0.85rem",
                marginBottom: "1.5rem",
                fontSize: "0.78rem",
                color: "#15803d",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <ShieldCheck size={16} />
              <span>No online payment collected. You can pay on arrival at the front desk.</span>
            </div>

            <button
              type="button"
              disabled={confirming}
              onClick={handleConfirmReservation}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "10px",
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              }}
            >
              {confirming ? "Confirming..." : `Confirm Reservation (₹${totalPrice})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkspaceDetailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "6rem 0", color: "#64748b" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
          <p style={{ fontSize: "0.95rem" }}>Loading floor plan...</p>
        </div>
      }
    >
      <WorkspaceDetailContent />
    </Suspense>
  );
}
