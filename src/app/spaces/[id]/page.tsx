"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { FloorDTO, InventoryItemDTO } from "@/lib/types";

function DeskIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M4 14h16" />
      <path d="M9 8h6" />
      <path d="M12 4v4" />
    </svg>
  );
}

function CabinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
      <path d="M2 20h20" />
      <path d="M14 12v.01" />
    </svg>
  );
}

function WorkspaceDetailContent() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [startDateStr, setStartDateStr] = useState("2026-10-26");
  const [endDateStr, setEndDateStr] = useState("2026-10-27");
  const [bookingType, setBookingType] = useState<"Daily" | "Monthly">("Daily");

  const [property, setProperty] = useState<any>(null);
  const [floors, setFloors] = useState<FloorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [selectedUnit, setSelectedUnit] = useState<InventoryItemDTO | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [guestName, setGuestName] = useState("Guest User");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("+91 98765 43210");

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("bookmydesk_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.id || parsed.email)) {
            setCurrentUser(parsed);
            if (parsed.name) setGuestName(parsed.name);
            if (parsed.email) setGuestEmail(parsed.email);
            return;
          }
        }
      } catch (e) {}
      setCurrentUser(null);
    };

    loadUser();
    window.addEventListener("auth-change", loadUser);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("auth-change", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const pRes = await fetch(`/api/properties/${id}`);
        const pData = await pRes.json();
        if (pData.success) setProperty(pData.property);
        await fetchMap(startDateStr, endDateStr, currentUser?.id);
      } catch (err) {
        console.error("Failed to load workspace data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, currentUser?.id]);

  const fetchMap = async (start: string, end: string, uId = currentUser?.id) => {
    setCheckingAvailability(true);
    try {
      const uParam = uId ? `&userId=${uId}` : "";
      const res = await fetch(
        `/api/properties/${id}/map?date=${start}&plan=${bookingType === "Daily" ? "DAY" : "MONTH"}${uParam}&_t=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.success) {
        setFloors(data.floors);
        if (selectedUnit) {
          for (const f of data.floors) {
            for (const z of f.zones) {
              const match = z.items.find((i: InventoryItemDTO) => i.id === selectedUnit.id);
              if (match && match.status === "BOOKED") setSelectedUnit(null);
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
    fetchMap(startDateStr, endDateStr, currentUser?.id);
  };

  const handleUnitClick = (item: InventoryItemDTO) => {
    if (item.status === "BOOKED" || item.activeStatus === "BLOCKED") return;
    setSelectedUnit(selectedUnit?.id === item.id ? null : item);
  };

  const sDate = new Date(startDateStr);
  const eDate = new Date(endDateStr);
  const diffTime = Math.max(eDate.getTime() - sDate.getTime(), 24 * 60 * 60 * 1000);
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const unitRate = selectedUnit
    ? selectedUnit.type === "PRIVATE_CABIN" ? 1200 : 500
    : 500;
  const totalPrice = unitRate * diffDays;

  const allUnits: InventoryItemDTO[] = [];
  floors.forEach((f) => f.zones.forEach((z) => z.items.forEach((item) => allUnits.push(item))));

  const availableCount = allUnits.filter(
    (u) => u.status === "AVAILABLE" || (selectedUnit && u.id === selectedUnit.id)
  ).length;

  const handleConfirmReservation = async () => {
    if (!selectedUnit || !property) return;

    if (!currentUser) {
      alert("Please sign in first so this reservation is linked to your account.");
      router.push(`/signin?redirect=/spaces/${id}`);
      return;
    }

    setConfirming(true);
    try {
      const parts = startDateStr.split("-").map(Number);
      const y = parts[0] || new Date().getUTCFullYear();
      const m = (parts[1] !== undefined ? parts[1] : new Date().getUTCMonth() + 1) - 1;
      const d = parts[2] !== undefined ? parts[2] : new Date().getUTCDate();

      const startAt = new Date(Date.UTC(y, m, d, 0, 0, 0)).toISOString();
      const endAt =
        bookingType === "Daily"
          ? new Date(Date.UTC(y, m, d, 23, 59, 59, 999)).toISOString()
          : new Date(Date.UTC(y, m, d, 0, 0, 0) + 30 * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          inventoryItemId: selectedUnit.id,
          bookingPlan: bookingType === "Daily" ? "DAY" : "MONTH",
          startAt,
          endAt,
          guestName: currentUser.name || guestName,
          guestEmail: currentUser.email || guestEmail,
          guestPhone,
          userId: currentUser.id,
          paymentMethod: "PAY_AT_DESK",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Reservation failed. Please try another unit.");
        fetchMap(startDateStr, endDateStr, currentUser.id);
        return;
      }
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
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid rgba(255,255,255,0.08)",
            borderTopColor: "#F8B646",
            borderRadius: "50%",
            margin: "0 auto 1rem",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ fontSize: "0.95rem" }}>Loading workspace...</p>
      </div>
    );
  }

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split("-");
    return `${m}/${d}/${y}`;
  };

  /* ── shared style tokens ── */
  const glass = {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "16px",
  } as React.CSSProperties;

  const inputStyle = {
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#e2e8f0",
    fontSize: "0.85rem",
    fontWeight: 500,
    width: "100%",
    fontFamily: "inherit",
  } as React.CSSProperties;

  const inputWrap = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    padding: "0.45rem 0.65rem",
    background: "rgba(255,255,255,0.04)",
  } as React.CSSProperties;

  return (
    <div style={{ maxWidth: 1360, margin: "1.5rem auto 5rem", padding: "0 2rem" }}>

      {/* ── Top Section ── */}
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
        {/* Property Info */}
        <div style={{ flex: "1 1 500px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
            <span className="badge-pill-purple">Flexible workspace</span>
            <span className="badge-pill-green">Flexible booking</span>
          </div>

          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
              marginBottom: "0.45rem",
              background: "linear-gradient(135deg, #e2e8f0 0%, #FCC7B0 50%, #FBCD54 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {property.name}
          </h1>

          <p style={{ fontSize: "0.95rem", color: "#94a3b8", lineHeight: 1.55, marginBottom: "0.5rem" }}>
            {property.tagline || property.description}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontSize: "0.92rem" }}>
            <MapPin size={16} color="#F8B646" />
            <span>{property.locality}, {property.city}</span>
          </div>
        </div>

        {/* Date Picker Card */}
        <div style={{ ...glass, padding: "1.25rem 1.5rem", width: "100%", maxWidth: 480 }}>
          <form onSubmit={handleCheckAvailability}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
              {/* Start Date */}
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500, marginBottom: "0.3rem" }}>
                  Start date
                </label>
                <div style={inputWrap}>
                  <input type="date" value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} style={inputStyle} />
                  <Calendar size={14} color="#F8B646" />
                </div>
              </div>

              {/* End Date */}
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500, marginBottom: "0.3rem" }}>
                  End date
                </label>
                <div style={inputWrap}>
                  <input type="date" value={endDateStr} min={startDateStr} onChange={(e) => setEndDateStr(e.target.value)} style={inputStyle} />
                  <Calendar size={14} color="#F8B646" />
                </div>
              </div>

              {/* Check Button */}
              <button
                type="submit"
                disabled={checkingAvailability}
                style={{
                  background: "linear-gradient(135deg, #F8B646, #d4981f)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.55rem 0.9rem",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  height: "36px",
                  whiteSpace: "nowrap",
                  transition: "opacity 0.15s ease",
                  boxShadow: "0 4px 12px rgba(248,182,70,0.35)",
                  fontFamily: "inherit",
                }}
              >
                {checkingAvailability ? "Checking…" : "Check availability"}
              </button>
            </div>

            <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.5rem", lineHeight: 1.4 }}>
              Daily reservations are priced per day. The end date is your checkout date.
            </p>
          </form>
        </div>
      </div>

      {/* ── Two-Column Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.75rem", alignItems: "start" }}>

        {/* Left: Floor Plan */}
        <div style={{ ...glass, padding: "1.5rem" }}>
          {/* Header & Legend */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "1.35rem",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e2e8f0" }}>
                Choose your unit
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                {availableCount} available for your selected dates
              </p>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", fontSize: "0.8rem", color: "#94a3b8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: 13, height: 13, borderRadius: 3, border: "1.5px solid rgba(52,211,153,0.6)", background: "rgba(16,185,129,0.15)" }} />
                <span>Available</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: 13, height: 13, borderRadius: 3, border: "1px solid rgba(100,116,139,0.3)", background: "rgba(100,116,139,0.12)" }} />
                <span>Booked</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: 13, height: 13, borderRadius: 3, background: "linear-gradient(135deg,#F8B646,#d4981f)" }} />
                <span>Your Selection</span>
              </div>
            </div>
          </div>

          {/* Unit Grid */}
          <div
            style={{
              border: "1px dashed rgba(248,182,70,0.25)",
              borderRadius: "12px",
              padding: "1.5rem",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.85rem" }}>
              {allUnits.map((item) => {
                const isSelected = selectedUnit?.id === item.id;
                const isBooked = item.status === "BOOKED" || item.activeStatus === "BLOCKED";
                const isCabin = item.type === "PRIVATE_CABIN";
                const gridColumn = isCabin ? "span 2" : "span 1";

                let cardBg = "rgba(16,185,129,0.12)";
                let cardBorder = "1.5px solid rgba(52,211,153,0.5)";
                let cardTextColor = "#34d399";
                let iconColor = "#34d399";

                if (isSelected) {
                  cardBg = "linear-gradient(135deg,#F8B646 0%,#d4981f 100%)";
                  cardBorder = "2px solid #FCC7B0";
                  cardTextColor = "#ffffff";
                  iconColor = "#ffffff";
                } else if (isBooked) {
                  cardBg = "rgba(100,116,139,0.10)";
                  cardBorder = "1px solid rgba(100,116,139,0.25)";
                  cardTextColor = "#64748b";
                  iconColor = "#4b5563";
                }

                const priceText = isBooked ? "Reserved" : isCabin ? "₹1,200/day" : "₹500/day";

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
                      boxShadow: isSelected
                        ? "0 4px 16px rgba(248,182,70,0.45)"
                        : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isBooked && !isSelected) {
                        (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(52,211,153,0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isBooked && !isSelected) {
                        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }
                    }}
                  >
                    <div style={{ color: iconColor }}>
                      {isCabin ? <CabinIcon size={20} /> : <DeskIcon size={20} />}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: cardTextColor }}>
                      {item.code}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: isSelected ? "rgba(255,255,255,0.85)" : isBooked ? "#4b5563" : "#34d399",
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

        {/* Right: Booking Summary */}
        <div style={{ ...glass, padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "1.1rem" }}>
            Booking Summary
          </h3>

          {!selectedUnit ? (
            <div
              style={{
                textAlign: "center",
                padding: "2.5rem 1rem",
                color: "#64748b",
                border: "1px dashed rgba(248,182,70,0.2)",
                borderRadius: "10px",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🪑</div>
              <p style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>Choose an available unit on the floor plan to continue.</p>
            </div>
          ) : (
            <div
              style={{
                background: "rgba(248,182,70,0.08)",
                border: "1px solid rgba(248,182,70,0.25)",
                borderRadius: "10px",
                padding: "0.9rem",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Selected Unit:</span>
                <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#FBCD54" }}>{selectedUnit.code}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.82rem" }}>
                <span style={{ color: "#94a3b8" }}>Dates:</span>
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                  {formatDateDisplay(startDateStr)} – {formatDateDisplay(endDateStr)} ({diffDays}d)
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "0.4rem",
                  borderTop: "1px dashed rgba(255,255,255,0.1)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#e2e8f0" }}>Total:</span>
                <span style={{ color: "#FBCD54", fontSize: "1.1rem" }}>₹{totalPrice}</span>
              </div>
            </div>
          )}

          {/* Booking Type */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.4rem" }}>
              Booking type
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["Daily", "Monthly"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBookingType(type)}
                  style={{
                    flex: 1,
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: bookingType === type ? "1.5px solid rgba(248,182,70,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    background: bookingType === type ? "rgba(248,182,70,0.18)" : "rgba(255,255,255,0.04)",
                    color: bookingType === type ? "#FBCD54" : "#94a3b8",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontFamily: "inherit",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            disabled={!selectedUnit}
            onClick={() => setShowReviewModal(true)}
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "10px",
              border: "none",
              background: selectedUnit
                ? "linear-gradient(135deg,#F8B646 0%,#d4981f 100%)"
                : "rgba(248,182,70,0.2)",
              color: selectedUnit ? "#ffffff" : "#64748b",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: selectedUnit ? "pointer" : "not-allowed",
              boxShadow: selectedUnit ? "0 4px 16px rgba(248,182,70,0.4)" : "none",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
          >
            Review booking →
          </button>

          <p style={{ fontSize: "0.72rem", color: "#64748b", textAlign: "center", marginTop: "0.75rem", lineHeight: 1.4 }}>
            Confirm your dates and workspace before reserving. No online payment collected.
          </p>

          {/* Trust badges */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {[
              { icon: "✓", text: "Instant confirmation" },
              { icon: "✓", text: "Free cancellation before check-in" },
              { icon: "✓", text: "Pay at the front desk" },
            ].map((item) => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#34d399" }}>
                <span style={{ fontWeight: 700 }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Review Booking Modal ── */}
      {showReviewModal && selectedUnit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="fade-in"
            style={{
              maxWidth: 480,
              width: "100%",
              padding: "2rem",
              background: "rgba(20, 18, 60, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(248,182,70,0.3)",
              borderRadius: "20px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(248,182,70,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#e2e8f0" }}>
                Review Your Reservation
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Summary */}
            <div
              style={{
                background: "rgba(248,182,70,0.08)",
                border: "1px solid rgba(248,182,70,0.2)",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1.25rem",
                fontSize: "0.88rem",
              }}
            >
              {[
                { label: "Workspace", value: property.name },
                { label: "Unit", value: selectedUnit.code, highlight: true },
                { label: "Dates", value: `${formatDateDisplay(startDateStr)} – ${formatDateDisplay(endDateStr)} (${diffDays} day${diffDays > 1 ? "s" : ""})` },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                  <span style={{ color: "#94a3b8" }}>{row.label}:</span>
                  <span style={{ fontWeight: 600, color: row.highlight ? "#FBCD54" : "#e2e8f0" }}>{row.value}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "0.5rem",
                  borderTop: "1px dashed rgba(255,255,255,0.1)",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#e2e8f0" }}>Total Amount:</span>
                <span style={{ color: "#FBCD54" }}>₹{totalPrice}</span>
              </div>
            </div>

            {/* Guest Name */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.3rem" }}>
                Guest Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  outline: "none",
                  background: "rgba(255,255,255,0.05)",
                  color: "#e2e8f0",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Pay at desk notice */}
            <div
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: "8px",
                padding: "0.65rem 0.85rem",
                marginBottom: "1.5rem",
                fontSize: "0.78rem",
                color: "#34d399",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <ShieldCheck size={16} />
              <span>No online payment collected. You can pay on arrival at the front desk.</span>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              disabled={confirming}
              onClick={handleConfirmReservation}
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: "10px",
                border: "none",
                background: confirming
                  ? "rgba(248,182,70,0.4)"
                  : "linear-gradient(135deg,#F8B646 0%,#d4981f 100%)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: confirming ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(248,182,70,0.4)",
                fontFamily: "inherit",
              }}
            >
              {confirming ? "Confirming…" : `Confirm Reservation (₹${totalPrice})`}
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
          <div
            style={{
              width: 44,
              height: 44,
              border: "3px solid rgba(255,255,255,0.08)",
              borderTopColor: "#F8B646",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontSize: "0.95rem" }}>Loading floor plan…</p>
        </div>
      }
    >
      <WorkspaceDetailContent />
    </Suspense>
  );
}

