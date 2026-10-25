"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Armchair,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building,
} from "lucide-react";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("ALL");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);

  useEffect(() => {
    loadBookings();
  }, [filterTab]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const q = filterTab !== "ALL" ? `?status=${filterTab}` : "";
      const res = await fetch(`/api/bookings${q}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Failed to load user bookings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancellingId(cancelModalBooking.id);
    try {
      const res = await fetch(`/api/bookings/${cancelModalBooking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Customer requested cancellation" }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setCancelModalBooking(null);
        loadBookings();
      } else {
        alert(data.error || "Failed to cancel booking");
      }
    } catch (err) {
      alert("Error processing cancellation");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "2rem auto 5rem", padding: "0 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
            My Bookings
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.2rem" }}>
            View your reserved desks, cabins, and entry passes
          </p>
        </div>

        <button
          type="button"
          onClick={loadBookings}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.45rem 0.85rem",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#475569",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.75rem", marginBottom: "1.75rem" }}>
        {["ALL", "CONFIRMED", "CHECKED_IN", "CANCELLED"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterTab(tab)}
            style={{
              padding: "0.45rem 1rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: filterTab === tab ? "#eff6ff" : "transparent",
              color: filterTab === tab ? "#1d4ed8" : "#64748b",
            }}
          >
            {tab === "ALL" ? "All Bookings" : tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748b" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
          <p>Loading your reservations...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="clean-card" style={{ padding: "3.5rem 2rem", textAlign: "center", maxWidth: 500, margin: "2rem auto" }}>
          <Calendar size={40} color="#94a3b8" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "0.4rem" }}>
            No Bookings Found
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.5rem" }}>
            You haven&apos;t reserved any desks or cabins yet.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#2563eb",
              color: "#ffffff",
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Explore Workspaces
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {bookings.map((b) => {
            const item = b.items[0]?.inventoryItem;
            let snapshot: any = {};
            try {
              snapshot = JSON.parse(b.items[0]?.itemSnapshot || "{}");
            } catch {}

            const isCancelled = b.status === "CANCELLED";
            const isCheckedIn = b.status === "CHECKED_IN";

            return (
              <div
                key={b.id}
                className="clean-card"
                style={{
                  padding: "1.25rem 1.5rem",
                  display: "grid",
                  gridTemplateColumns: "80px 1fr auto",
                  gap: "1.25rem",
                  alignItems: "center",
                }}
              >
                <img
                  src={b.property.coverImage}
                  alt={b.property.name}
                  style={{ width: 80, height: 80, borderRadius: "10px", objectFit: "cover" }}
                />

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#1d4ed8", background: "#eff6ff", padding: "0.15rem 0.5rem", borderRadius: 4 }}>
                      {b.id}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: 4,
                        background: isCancelled ? "#fee2e2" : isCheckedIn ? "#eff6ff" : "#dcfce7",
                        color: isCancelled ? "#b91c1c" : isCheckedIn ? "#1d4ed8" : "#15803d",
                      }}
                    >
                      {b.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                    {b.property.name}
                  </h3>

                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.25rem", fontSize: "0.82rem", color: "#64748b" }}>
                    <span style={{ fontWeight: 600, color: "#1d4ed8" }}>
                      Unit: {snapshot.code || item?.code || "Desk"}
                    </span>
                    <span>
                      {new Date(b.startAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span>
                      Amount: <strong>₹{b.totalAmount}</strong> (No online payment)
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", alignItems: "flex-end" }}>
                  <Link
                    href={`/pass/${b.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      background: "#2563eb",
                      color: "#ffffff",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    <QrCode size={15} />
                    <span>View QR Pass</span>
                  </Link>

                  {!isCancelled && !isCheckedIn && (
                    <button
                      type="button"
                      onClick={() => setCancelModalBooking(b)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalBooking && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="clean-card" style={{ maxWidth: 440, width: "100%", padding: "1.75rem", background: "#ffffff" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
              Cancel Reservation
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.5, marginBottom: "1.25rem" }}>
              Are you sure you want to cancel your booking <strong>{cancelModalBooking.id}</strong> at <strong>{cancelModalBooking.property.name}</strong>?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                style={{
                  padding: "0.55rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancellingId !== null}
                style={{
                  padding: "0.55rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#ef4444",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {cancellingId ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
