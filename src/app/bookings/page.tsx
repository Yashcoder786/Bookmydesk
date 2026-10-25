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
} from "lucide-react";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("ALL");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("Schedule changed");

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
        body: JSON.stringify({ reason: cancelReason }),
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
    <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1.5rem 5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
            My Workspace Reservations
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Manage upcoming stays, download entry passes, or cancel according to policy
          </p>
        </div>

        <button
          type="button"
          onClick={loadBookings}
          className="btn-secondary"
          style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem" }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem", marginBottom: "2rem", overflowX: "auto" }}>
        {["ALL", "CONFIRMED", "CHECKED_IN", "CANCELLED"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterTab(tab)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: filterTab === tab ? "rgba(59, 130, 246, 0.2)" : "transparent",
              color: filterTab === tab ? "#60a5fa" : "var(--text-muted)",
            }}
          >
            {tab === "ALL" ? "All Bookings" : tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #1e293b", borderTopColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
          <p>Loading your reservations...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: 500, margin: "2rem auto" }}>
          <Calendar size={44} color="#64748b" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-main)", marginBottom: "0.5rem" }}>
            No Bookings Found
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            You have no active workspace reservations in this view.
          </p>
          <Link href="/" className="btn-primary">
            Explore & Book Workspaces
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {bookings.map((b) => {
            const item = b.items[0]?.inventoryItem;
            let snapshot: any = {};
            try {
              snapshot = JSON.parse(b.items[0]?.itemSnapshot || "{}");
            } catch {}

            const isCancelled = b.status === "CANCELLED";
            const isCheckedIn = b.status === "CHECKED_IN";

            return (
              <div key={b.id} className="glass-panel" style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "100px 1fr auto", gap: "1.5rem", alignItems: "center" }}>
                <img
                  src={b.property.coverImage}
                  alt={b.property.name}
                  style={{ width: 100, height: 100, borderRadius: "var(--radius-md)", objectFit: "cover" }}
                />

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#38bdf8", background: "rgba(56, 189, 248, 0.15)", padding: "0.15rem 0.5rem", borderRadius: 4 }}>
                      {b.id}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: 4,
                        background: isCancelled ? "rgba(239, 68, 68, 0.15)" : isCheckedIn ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.15)",
                        color: isCancelled ? "#f87171" : isCheckedIn ? "#60a5fa" : "#34d399",
                      }}
                    >
                      {b.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                    {b.property.name}
                  </h3>

                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.25rem", fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#fff", fontWeight: 600 }}>
                      <Armchair size={15} color="#60a5fa" />
                      Seat: {snapshot.code || item?.code || "Desk"}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={14} color="#38bdf8" />
                      {new Date(b.startAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={14} color="#fbbf24" />
                      {b.property.openingHours}
                    </span>
                    <span>
                      Paid: <strong>₹{b.totalAmount}</strong>
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                  <Link
                    href={`/pass/${b.id}`}
                    className="btn-primary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", width: "100%", justifyContent: "center" }}
                  >
                    <QrCode size={15} />
                    <span>View QR Pass</span>
                  </Link>

                  {!isCancelled && !isCheckedIn && (
                    <button
                      type="button"
                      onClick={() => setCancelModalBooking(b)}
                      className="btn-secondary"
                      style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem", color: "#f87171" }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalBooking && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="glass-panel-elevated" style={{ maxWidth: 500, width: "100%", padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", color: "#ef4444" }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
                Confirm Cancellation
              </h3>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              Are you sure you want to cancel booking <strong>{cancelModalBooking.id}</strong> at <strong>{cancelModalBooking.property.name}</strong>?
            </p>

            <div style={{ padding: "0.85rem", background: "rgba(0,0,0,0.4)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              <div style={{ color: "#38bdf8", fontWeight: 700, marginBottom: 4 }}>
                Refund Policy Calculation (PRD Section 6.3):
              </div>
              <div>• 100% refund if cancelled 24+ hours before reservation.</div>
              <div>• 80% refund if cancelled within 24 hours.</div>
              <div>• Your seat will be immediately released back to available inventory.</div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.35rem" }}>
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: "100%", padding: "0.6rem", background: "#111726", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "#fff" }}
              >
                <option value="Schedule changed">Schedule changed</option>
                <option value="Booked wrong workspace / seat">Booked wrong workspace / seat</option>
                <option value="Meeting moved online">Meeting moved online</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="btn-secondary"
                style={{ padding: "0.6rem 1.25rem" }}
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancellingId !== null}
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {cancellingId ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
