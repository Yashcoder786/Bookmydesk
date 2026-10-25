"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Check,
  X,
  Armchair,
  Wifi,
  Zap,
  Users,
  Lock,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { FloorDTO, InventoryItemDTO, SeatStatus } from "@/lib/types";

function WorkspaceDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id as string;
  const initialDate = searchParams.get("date") || (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().split("T")[0];
  })();
  const initialPlan = (searchParams.get("plan") as "DAY" | "MONTH") || "DAY";

  const [property, setProperty] = useState<any>(null);
  const [floors, setFloors] = useState<FloorDTO[]>([]);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [bookingDate, setBookingDate] = useState(initialDate);
  const [bookingPlan, setBookingPlan] = useState<"DAY" | "MONTH">(initialPlan);
  const [selectedItem, setSelectedItem] = useState<InventoryItemDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [holdingInProgress, setHoldingInProgress] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Load property details
  useEffect(() => {
    async function loadProperty() {
      try {
        const res = await fetch(`/api/properties/${id}`);
        const data = await res.json();
        if (data.success) {
          setProperty(data.property);
        }
      } catch (err) {
        console.error("Error loading property", err);
      }
    }
    loadProperty();
  }, [id]);

  // Load interactive seat map with live availability
  useEffect(() => {
    if (!id) return;
    loadMapAvailability();
  }, [id, bookingDate, bookingPlan]);

  const loadMapAvailability = async () => {
    setMapLoading(true);
    try {
      const res = await fetch(
        `/api/properties/${id}/map?date=${bookingDate}&plan=${bookingPlan}`
      );
      const data = await res.json();
      if (data.success) {
        setFloors(data.floors);
        // If an item was selected, re-verify its status
        if (selectedItem) {
          let foundItem: InventoryItemDTO | null = null;
          for (const f of data.floors) {
            for (const z of f.zones) {
              const matched = z.items.find((i: InventoryItemDTO) => i.id === selectedItem.id);
              if (matched) foundItem = matched;
            }
          }
          if (foundItem && foundItem.status !== "AVAILABLE" && foundItem.status !== "SELECTED") {
            setSelectedItem(null);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching map", err);
    } finally {
      setMapLoading(false);
      setLoading(false);
    }
  };

  const handleSeatClick = (item: InventoryItemDTO) => {
    if (item.status === "BOOKED" || item.status === "MAINTENANCE" || item.status === "BLOCKED") {
      return; // Not selectable
    }
    if (item.status === "HELD") {
      alert("This seat is currently held by another customer. It will be released if not confirmed within 5 minutes.");
      return;
    }

    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
      setHoldError(null);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!selectedItem || !property) return;
    setHoldingInProgress(true);
    setHoldError(null);

    try {
      const baseDate = new Date(bookingDate);
      let startAt: Date;
      let endAt: Date;

      if (bookingPlan === "MONTH") {
        startAt = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0);
        endAt = new Date(startAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        startAt = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 8, 0, 0);
        endAt = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 20, 0, 0);
      }

      // Acquire 5-minute checkout hold
      const res = await fetch("/api/holds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryItemId: selectedItem.id,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          userId: "usr_customer_1",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setHoldError(data.error || "Seat is no longer available. Please select another seat.");
        loadMapAvailability(); // Refresh map immediately
        return;
      }

      // Navigate to checkout with hold query params
      const q = new URLSearchParams({
        propertyId: property.id,
        itemId: selectedItem.id,
        plan: bookingPlan,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        holdId: data.hold.id,
      });

      router.push(`/checkout?${q.toString()}`);
    } catch (err: any) {
      setHoldError(err.message || "Failed to reserve hold lock");
    } finally {
      setHoldingInProgress(false);
    }
  };

  if (loading || !property) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-muted)" }}>
        <div style={{ width: 44, height: 44, border: "3px solid #1e293b", borderTopColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
        <p>Loading interactive seat map & property details...</p>
      </div>
    );
  }

  const activeFloor = floors[selectedFloorIndex] || floors[0];
  const price =
    bookingPlan === "DAY"
      ? selectedItem?.pricePerDay || 499
      : selectedItem?.pricePerMonth || 7999;

  return (
    <div style={{ maxWidth: 1320, margin: "1.5rem auto", padding: "0 1.5rem 7rem" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "1rem" }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Workspaces</Link>
        <span>/</span>
        <span style={{ color: "var(--text-muted)" }}>{property.city}</span>
        <span>/</span>
        <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{property.name}</span>
      </div>

      {/* Property Header Banner */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem", display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <ShieldCheck size={14} /> Verified Partner
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
              {property.locality}, {property.city}
            </span>
          </div>

          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-main)", marginBottom: "0.35rem" }}>
            {property.name}
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.25rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <MapPin size={15} color="#38bdf8" /> {property.address}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock size={15} color="#fbbf24" /> {property.openingHours}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#fbbf24", fontWeight: 700 }}>
              <Star size={15} fill="#fbbf24" /> {property.rating} ({property.reviewCount} verified reviews)
            </span>
          </div>
        </div>

        {/* Gallery Preview Thumbnail */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {property.galleryImages.slice(0, 2).map((imgUrl: string, idx: number) => (
            <img
              key={idx}
              src={imgUrl}
              alt="Workspace preview"
              style={{ width: 110, height: 80, borderRadius: "var(--radius-md)", objectFit: "cover", border: "1px solid var(--border-subtle)" }}
            />
          ))}
        </div>
      </div>

      {/* Date & Plan Selector Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "1rem 1.5rem",
          marginBottom: "1.75rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.25rem",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.25rem" }}>
          {/* Plan Switcher */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)", fontWeight: 700, marginBottom: "0.35rem" }}>
              1. Booking Plan
            </label>
            <div style={{ display: "inline-flex", background: "rgba(0,0,0,0.4)", padding: "3px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <button
                type="button"
                onClick={() => setBookingPlan("DAY")}
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  background: bookingPlan === "DAY" ? "var(--accent-primary)" : "transparent",
                  color: bookingPlan === "DAY" ? "#fff" : "var(--text-muted)",
                  transition: "all 0.2s ease",
                }}
              >
                Day Pass
              </button>
              <button
                type="button"
                onClick={() => setBookingPlan("MONTH")}
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  background: bookingPlan === "MONTH" ? "var(--accent-primary)" : "transparent",
                  color: bookingPlan === "MONTH" ? "#fff" : "var(--text-muted)",
                  transition: "all 0.2s ease",
                }}
              >
                Monthly Pass (30 Days)
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)", fontWeight: 700, marginBottom: "0.35rem" }}>
              2. Start Date
            </label>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(10, 13, 20, 0.7)", border: "1px solid var(--border-subtle)", padding: "0.45rem 0.85rem", borderRadius: "var(--radius-md)" }}>
              <Calendar size={16} color="#38bdf8" />
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBookingDate(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: "var(--text-main)", fontSize: "0.9rem", fontFamily: "inherit", fontWeight: 600 }}
              />
            </div>
          </div>
        </div>

        {/* Real-time sync status indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.82rem", color: mapLoading ? "#38bdf8" : "#34d399" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: mapLoading ? "#38bdf8" : "#10b981", boxShadow: mapLoading ? "0 0 10px #38bdf8" : "0 0 10px #10b981", animation: mapLoading ? "pulse-glow 1s infinite" : "none" }}></span>
          <span>{mapLoading ? "Refreshing availability..." : "Live Server Availability Active"}</span>
        </div>
      </div>

      {holdError && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "var(--radius-md)", padding: "0.85rem 1.25rem", color: "#f87171", fontSize: "0.88rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={18} />
          <span>{holdError}</span>
        </div>
      )}

      {/* Main Seat Map Area with Floor Tabs */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        {/* Floor Selection Tabs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", padding: "0.5rem 1rem", background: "rgba(10, 13, 20, 0.6)" }}>
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
            {floors.map((floor, idx) => (
              <button
                key={floor.id}
                type="button"
                onClick={() => {
                  setSelectedFloorIndex(idx);
                  setSelectedItem(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.55rem 1.1rem",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  background: selectedFloorIndex === idx ? "rgba(59, 130, 246, 0.2)" : "transparent",
                  color: selectedFloorIndex === idx ? "#60a5fa" : "var(--text-muted)",
                  borderBottom: selectedFloorIndex === idx ? "2px solid #3b82f6" : "2px solid transparent",
                }}
              >
                <Layers size={15} />
                <span>{floor.name}</span>
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              className="btn-secondary"
              style={{ padding: "0.35rem", width: 32, height: 32, borderRadius: 8 }}
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.75))}
              className="btn-secondary"
              style={{ padding: "0.35rem", width: 32, height: 32, borderRadius: 8 }}
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="btn-secondary"
              style={{ padding: "0.35rem", width: 32, height: 32, borderRadius: 8 }}
              title="Reset Zoom"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Layout Grid: Seat Map Viewport + Asset Inspector Panel */}
        <div style={{ display: "grid", gridTemplateColumns: selectedItem ? "1fr 340px" : "1fr", transition: "grid-template-columns 0.3s ease" }}>
          {/* Seat Map Viewport */}
          <div className="map-viewport" style={{ padding: "2rem", overflow: "auto", position: "relative" }}>
            <div className="map-grid-bg"></div>

            {/* Stage / Entrance Direction Indicator */}
            <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(15, 23, 42, 0.7)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-full)", padding: "0.25rem 1rem", fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, pointerEvents: "none" }}>
              Main Entrance & Reception Way
            </div>

            {/* Transform Container for Zoom/Pan */}
            <div
              style={{
                position: "relative",
                width: 720,
                height: 440,
                margin: "2.5rem auto 1rem",
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease",
              }}
            >
              {activeFloor?.zones.map((zone) => (
                <div key={zone.id}>
                  {/* Zone boundary label */}
                  <div
                    style={{
                      position: "absolute",
                      top: zone.items[0]?.mapY ? zone.items[0].mapY - 26 : 10,
                      left: zone.items[0]?.mapX ? zone.items[0].mapX : 20,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: zone.colorCode,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: "rgba(10, 13, 20, 0.8)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: 4,
                      border: `1px solid ${zone.colorCode}40`,
                    }}
                  >
                    {zone.name}
                  </div>

                  {/* Render items */}
                  {zone.items.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    const statusClass = isSelected ? "status-SELECTED" : `status-${item.status}`;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSeatClick(item)}
                        className={`seat-node ${statusClass} ${item.type === "PRIVATE_CABIN" ? "cabin-node" : ""}`}
                        style={{
                          left: item.mapX,
                          top: item.mapY,
                          width: item.width,
                          height: item.height,
                        }}
                      >
                        {item.type === "PRIVATE_CABIN" ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: "0.8rem" }}>
                              <Armchair size={14} />
                              <span>{item.code}</span>
                            </div>
                            <span style={{ fontSize: "0.68rem", opacity: 0.8 }}>
                              {item.capacity} Seats Cabin
                            </span>
                          </div>
                        ) : (
                          <>
                            {item.status === "BOOKED" ? (
                              <Lock size={14} color="#64748b" />
                            ) : item.status === "MAINTENANCE" ? (
                              <AlertTriangle size={14} color="#ef4444" />
                            ) : (
                              <Armchair size={16} />
                            )}
                            <span style={{ marginTop: 2, fontSize: "0.72rem", fontWeight: 700 }}>
                              {item.code}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend (PRD Section 7.2) */}
            <div className="seat-legend">
              <div className="legend-item">
                <div className="legend-swatch" style={{ background: "rgba(16, 185, 129, 0.2)", border: "1.5px solid #10b981" }}></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-swatch" style={{ background: "#3b82f6", border: "1.5px solid #60a5fa" }}></div>
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <div className="legend-swatch" style={{ background: "rgba(245, 158, 11, 0.2)", border: "1.5px dashed #f59e0b" }}></div>
                <span>Held (Checkout in progress)</span>
              </div>
              <div className="legend-item">
                <div className="legend-swatch" style={{ background: "rgba(71, 85, 105, 0.4)", border: "1.5px solid #475569" }}></div>
                <span>Booked</span>
              </div>
              <div className="legend-item">
                <div className="legend-swatch" style={{ background: "repeating-linear-gradient(45deg, rgba(239,68,68,0.2), rgba(239,68,68,0.2) 4px, rgba(239,68,68,0.5) 4px, rgba(239,68,68,0.5) 8px)", border: "1.5px solid #ef4444" }}></div>
                <span>Maintenance</span>
              </div>
            </div>
          </div>

          {/* Seat / Cabin Inspector Drawer (Right Side) */}
          {selectedItem && (
            <div
              style={{
                borderLeft: "1px solid var(--border-subtle)",
                background: "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(20px)",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                animation: "slide-up 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#38bdf8", fontWeight: 700 }}>
                  Selected Workspace Asset
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(59, 130, 246, 0.15)", border: "1.5px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa", fontWeight: 800, fontSize: "1.1rem", fontFamily: "var(--font-mono)" }}>
                  {selectedItem.code}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {selectedItem.name}
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Zone: {selectedItem.zoneName}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem", padding: "0.85rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Capacity:</span>
                  <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{selectedItem.capacity} Person(s)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Interval:</span>
                  <span style={{ color: "#38bdf8", fontWeight: 600 }}>{bookingDate} ({bookingPlan === "DAY" ? "Day Pass" : "30-Day Monthly"})</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Live Status:</span>
                  <span style={{ color: "#34d399", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <Check size={14} /> Available to Lock
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)", marginBottom: "0.6rem" }}>
                  Asset Ergonomics & Features
                </h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {selectedItem.features.map((feat, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Check size={14} color="#10b981" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price card in drawer */}
              <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Calculated Rate:
                  </span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "1.45rem", fontWeight: 800, color: "#fff" }}>
                      ₹{price}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block" }}>
                      +{bookingPlan === "DAY" ? "18% GST" : "18% GST"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={holdingInProgress}
                  className="btn-primary"
                  style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem" }}
                >
                  {holdingInProgress ? (
                    <span>Acquiring 5m Hold...</span>
                  ) : (
                    <>
                      <span>Lock & Proceed</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Bar (BookMyShow Signature Style) */}
      {selectedItem && (
        <div className="checkout-bottom-bar">
          <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                {selectedItem.code}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-main)" }}>
                    {property.name}
                  </span>
                  <span style={{ fontSize: "0.75rem", background: "rgba(59, 130, 246, 0.2)", color: "#60a5fa", padding: "0.15rem 0.5rem", borderRadius: 4, fontWeight: 600 }}>
                    {activeFloor.name}
                  </span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                  {bookingDate} • {bookingPlan === "DAY" ? "Day Pass (08:00 - 20:00)" : "Monthly Pass (30 Days)"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
                  Payable Amount
                </span>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                  ₹{Math.round((price + price * 0.18) * 100) / 100}
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400, marginLeft: 4 }}>
                    incl. GST
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={holdingInProgress}
                className="btn-primary"
                style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem" }}
              >
                {holdingInProgress ? "Acquiring Hold..." : "Proceed to Checkout"}
              </button>
            </div>
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
        <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-muted)" }}>
          <div style={{ width: 44, height: 44, border: "3px solid #1e293b", borderTopColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
          <p>Loading interactive floor map...</p>
        </div>
      }
    >
      <WorkspaceDetailContent />
    </Suspense>
  );
}
