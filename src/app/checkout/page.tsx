"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const propertyId = searchParams.get("propertyId");
  const itemId = searchParams.get("itemId");
  const plan = searchParams.get("plan") || "DAY";
  const startAt = searchParams.get("startAt");
  const endAt = searchParams.get("endAt");
  const holdId = searchParams.get("holdId");

  const [property, setProperty] = useState<any>(null);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("MOCK_UPI");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [guestName, setGuestName] = useState("Guest User");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("+91 98765 43210");
  const [policyAccepted, setPolicyAccepted] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load active logged in user
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookmydesk_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.id || parsed.email)) {
          setCurrentUser(parsed);
          if (parsed.name) setGuestName(parsed.name);
          if (parsed.email) setGuestEmail(parsed.email);
        }
      }
    } catch (e) {}
  }, []);

  // 5-minute (300 seconds) hold timer countdown
  const [secondsRemaining, setSecondsRemaining] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!propertyId || !itemId) return;
      try {
        const pRes = await fetch(`/api/properties/${propertyId}`);
        const pData = await pRes.json();
        if (pData.success) {
          setProperty(pData.property);

          // Find specific inventory item
          let found: any = null;
          for (const f of pData.property.floors) {
            for (const z of f.zones) {
              const matched = z.items.find((i: any) => i.id === itemId);
              if (matched) {
                found = { ...matched, zoneName: z.name, floorName: f.name };
              }
            }
          }
          setItem(found);
        }
      } catch (err) {
        console.error("Error loading checkout data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId, itemId]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyAccepted) {
      alert("Please accept the cancellation policy to proceed.");
      return;
    }
    if (secondsRemaining === 0) {
      alert("Your 5-minute hold lock has expired. Please return to the floor plan to select a seat.");
      router.push(`/spaces/${propertyId}`);
      return;
    }

    setConfirming(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          inventoryItemId: itemId,
          bookingPlan: plan,
          startAt,
          endAt,
          guestName: currentUser?.name || guestName,
          guestEmail: currentUser?.email || guestEmail,
          guestPhone,
          userId: currentUser?.id,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to confirm booking.");
        return;
      }

      // Successful confirmation! Redirect to digital pass
      router.push(`/pass/${data.booking.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to finalize booking.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading || !property || !item) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-muted)" }}>
        <div style={{ width: 44, height: 44, border: "3px solid #1e293b", borderTopColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
        <p>Securing your workspace hold and preparing checkout...</p>
      </div>
    );
  }

  // Calculate pricing
  const baseRate =
    plan === "DAY"
      ? property.ratePlans.find((r: any) => r.inventoryType === item.type && r.billingUnit === "DAY")?.price || 499
      : property.ratePlans.find((r: any) => r.inventoryType === item.type && r.billingUnit === "MONTH")?.price || 7999;

  const tax = Math.round(baseRate * 0.18 * 100) / 100;
  const total = Math.round((baseRate + tax) * 100) / 100;

  return (
    <div style={{ maxWidth: 1040, margin: "2rem auto", padding: "0 1.5rem 5rem" }}>
      {/* 5-Minute Hold Timer Banner */}
      <div
        className="hold-timer-banner"
        style={{
          borderRadius: "var(--radius-md)",
          marginBottom: "1.75rem",
          background: secondsRemaining < 60 ? "linear-gradient(90deg, #991b1b, #dc2626)" : "linear-gradient(90deg, #b45309, #d97706)",
        }}
      >
        <Clock size={18} />
        <span>
          Seat Held for You: <strong>{formatTimer(secondsRemaining)}</strong> remaining to complete booking
        </span>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
          Review & Confirm Reservation
        </h1>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Instant BookMyShow-style confirmation with server-locked inventory
        </p>
      </div>

      {errorMsg && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "var(--radius-md)", padding: "0.85rem 1.25rem", color: "#f87171", fontSize: "0.88rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "2rem" }}>
        {/* Left Column: Guest Details & Payment Method */}
        <div>
          {/* Guest Contact Details Form */}
          <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1rem" }}>
              1. Guest Contact Information
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "0.65rem 0.85rem", background: "rgba(10, 13, 20, 0.7)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "#fff", outline: "none", fontSize: "0.92rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                    Email (for Digital Pass)
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    style={{ width: "100%", padding: "0.65rem 0.85rem", background: "rgba(10, 13, 20, 0.7)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "#fff", outline: "none", fontSize: "0.92rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                    style={{ width: "100%", padding: "0.65rem 0.85rem", background: "rgba(10, 13, 20, 0.7)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "#fff", outline: "none", fontSize: "0.92rem" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector (Mock / Sandbox as per User Choice) */}
          <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>
                2. Instant Payment Mode
              </h3>
              <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)", fontWeight: 700, border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                Simulated Sandbox
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: paymentMethod === "MOCK_UPI" ? "1.5px solid #3b82f6" : "1px solid var(--border-subtle)",
                  background: paymentMethod === "MOCK_UPI" ? "rgba(59, 130, 246, 0.12)" : "rgba(10, 13, 20, 0.5)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === "MOCK_UPI"}
                    onChange={() => setPaymentMethod("MOCK_UPI")}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--text-main)" }}>
                      Simulated Instant UPI (Google Pay / PhonePe / BHIM)
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Instant mock authorization with digital QR receipt
                    </div>
                  </div>
                </div>
                <QrCode size={20} color="#38bdf8" />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: paymentMethod === "MOCK_CARD" ? "1.5px solid #3b82f6" : "1px solid var(--border-subtle)",
                  background: paymentMethod === "MOCK_CARD" ? "rgba(59, 130, 246, 0.12)" : "rgba(10, 13, 20, 0.5)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === "MOCK_CARD"}
                    onChange={() => setPaymentMethod("MOCK_CARD")}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--text-main)" }}>
                      Credit / Debit Card (Visa, MasterCard, RuPay)
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Simulated card test approval
                    </div>
                  </div>
                </div>
                <CreditCard size={20} color="#a855f7" />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: paymentMethod === "PAY_AT_DESK" ? "1.5px solid #3b82f6" : "1px solid var(--border-subtle)",
                  background: paymentMethod === "PAY_AT_DESK" ? "rgba(59, 130, 246, 0.12)" : "rgba(10, 13, 20, 0.5)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === "PAY_AT_DESK"}
                    onChange={() => setPaymentMethod("PAY_AT_DESK")}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--text-main)" }}>
                      Pay at Workspace Reception on Arrival
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Reserve seat now, pay via cash/card at front desk
                    </div>
                  </div>
                </div>
                <Building size={20} color="#10b981" />
              </label>
            </div>
          </div>

          {/* Cancellation Policy Acknowledgement */}
          <div className="glass-panel" style={{ padding: "1.25rem" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                I agree to the <strong>Cancellation & Refund Policy</strong>: 100% full refund if cancelled up to 24 hours prior to check-in, and 80% refund within 24 hours. No-shows are non-refundable.
              </span>
            </label>
          </div>
        </div>

        {/* Right Column: Order & Price Breakdown */}
        <div>
          <div className="glass-panel" style={{ padding: "1.5rem", position: "sticky", top: 90 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1.25rem" }}>
              Reservation Summary
            </h3>

            {/* Property preview */}
            <div style={{ display: "flex", gap: "0.85rem", marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)" }}>
              <img
                src={property.coverImage}
                alt={property.name}
                style={{ width: 70, height: 70, borderRadius: "var(--radius-md)", objectFit: "cover" }}
              />
              <div>
                <h4 style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text-main)" }}>
                  {property.name}
                </h4>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                  {item.floorName} • {item.zoneName}
                </div>
                <div style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(59, 130, 246, 0.2)", color: "#60a5fa", padding: "0.15rem 0.5rem", borderRadius: 4, fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                  Seat Code: {item.code}
                </div>
              </div>
            </div>

            {/* Interval summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-dim)" }}>Booking Plan:</span>
                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{plan === "DAY" ? "Day Pass" : "30-Day Monthly Pass"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-dim)" }}>Schedule:</span>
                <span style={{ color: "#38bdf8", fontWeight: 600 }}>
                  {new Date(startAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-dim)" }}>Access Hours:</span>
                <span style={{ color: "var(--text-main)" }}>{property.openingHours}</span>
              </div>
            </div>

            {/* Itemized Price Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Workspace Base Fee</span>
                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>₹{baseRate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Goods & Services Tax (18% GST)</span>
                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>₹{tax}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Platform Service Fee</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>FREE (₹0)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", fontSize: "1.15rem", fontWeight: 800 }}>
                <span style={{ color: "var(--text-main)" }}>Final Payable Total</span>
                <span style={{ color: "#38bdf8" }}>₹{total}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={confirming || secondsRemaining === 0}
              className="btn-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}
            >
              {confirming ? (
                <span>Locking & Confirming...</span>
              ) : secondsRemaining === 0 ? (
                <span>Hold Expired</span>
              ) : (
                <span>Confirm & Reserve Seat (₹{total})</span>
              )}
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "1rem" }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Concurrency Safe • Instant Digital Entry Pass</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-muted)" }}>
          <div style={{ width: 44, height: 44, border: "3px solid #1e293b", borderTopColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
          <p>Loading checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
