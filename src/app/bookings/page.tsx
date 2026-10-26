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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("ALL");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);

  useEffect(() => {
    const checkAuthAndLoad = () => {
      try {
        const stored = localStorage.getItem("bookmydesk_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.id || parsed.email)) {
            setCurrentUser(parsed);
            setAuthChecked(true);
            return;
          }
        }
      } catch (e) {}
      setCurrentUser(null);
      setBookings([]);
      setLoading(false);
      setAuthChecked(true);
    };

    checkAuthAndLoad();
    window.addEventListener("auth-change", checkAuthAndLoad);
    window.addEventListener("storage", checkAuthAndLoad);
    return () => {
      window.removeEventListener("auth-change", checkAuthAndLoad);
      window.removeEventListener("storage", checkAuthAndLoad);
    };
  }, []);

  useEffect(() => {
    if (authChecked) {
      if (currentUser) {
        loadBookings(currentUser);
      } else {
        setBookings([]);
        setLoading(false);
      }
    }
  }, [filterTab, currentUser, authChecked]);

  const loadBookings = async (user = currentUser) => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (user.id) params.append("userId", user.id);
      if (user.email) params.append("email", user.email);
      if (filterTab !== "ALL") params.append("status", filterTab);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to load user bookings", err);
      setBookings([]);
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
        loadBookings(currentUser);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            My Bookings
          </h1>
          {currentUser ? (
            <p style={{ fontSize: "0.88rem", color: "#94a3b8", marginTop: "0.25rem" }}>
              Showing reservations for <strong style={{ color: "#e2e8f0" }}>{currentUser.name}</strong> ({currentUser.email})
            </p>
          ) : (
            <p style={{ fontSize: "0.88rem", color: "#94a3b8", marginTop: "0.25rem" }}>
              Sign in with your account to access your reserved desks and passes
            </p>
          )}
        </div>

        {currentUser && (
          <button
            type="button"
            onClick={() => loadBookings(currentUser)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.45rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              background: "rgba(255, 255, 255, 0.06)",
              color: "#cbd5e1",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {!currentUser && authChecked ? (
        <div className="clean-card" style={{ padding: "3.5rem 2rem", textAlign: "center", maxWidth: 500, margin: "3rem auto" }}>
          <Calendar size={42} color="#818cf8" style={{ margin: "0 auto 1.25rem" }} />
          <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.6rem" }}>
            Sign In to View Your Bookings
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "1.75rem", lineHeight: 1.6 }}>
            You are currently signed out. Please sign in with your account to view your confirmed workspace passes.
          </p>
          <Link
            href="/signin?redirect=/bookings"
            className="btn-my-bookings"
            style={{
              display: "inline-block",
              padding: "0.65rem 1.6rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.92rem",
            }}
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "0.75rem", marginBottom: "1.75rem" }}>
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
                  background: filterTab === tab ? "rgba(99, 102, 241, 0.2)" : "transparent",
                  color: filterTab === tab ? "#a5b4fc" : "#94a3b8",
                }}
              >
                {tab === "ALL" ? "All Bookings" : tab.replace("_", " ")}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "#94a3b8" }}>
              <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#6366f1", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
              <p>Loading your reservations...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="clean-card" style={{ padding: "3.5rem 2rem", textAlign: "center", maxWidth: 500, margin: "2rem auto" }}>
              <Calendar size={40} color="#64748b" style={{ margin: "0 auto 1rem" }} />
              <h3 style={{ fontSize: "1.2rem", color: "#f8fafc", marginBottom: "0.4rem" }}>
                No Bookings Found for this Account
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
                You haven&apos;t reserved any desks or cabins with <strong>{currentUser?.email}</strong> yet.
              </p>
              <Link
                href="/"
                className="btn-my-bookings"
                style={{
                  display: "inline-block",
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
      </>
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
