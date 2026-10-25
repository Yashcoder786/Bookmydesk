"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Printer,
  ArrowRight,
  ShieldCheck,
  Armchair,
} from "lucide-react";
import confetti from "canvas-confetti";
import QRCode from "qrcode";

export default function DigitalPassPage() {
  const params = useParams();
  const id = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    async function loadBooking() {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        const data = await res.json();
        if (data.success) {
          setBooking(data.booking);

          const qrString = data.booking.checkInQrData || data.booking.id;
          const url = await QRCode.toDataURL(qrString, {
            width: 200,
            margin: 1,
            color: {
              dark: "#0f172a",
              light: "#ffffff",
            },
          });
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error("Error loading pass", err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  if (loading || !booking) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0", color: "#64748b" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
        <p>Loading your pass...</p>
      </div>
    );
  }

  const bookedItem = booking.items[0]?.inventoryItem;
  let itemSnapshot: any = {};
  try {
    itemSnapshot = JSON.parse(booking.items[0]?.itemSnapshot || "{}");
  } catch {}

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: 740, margin: "2rem auto 5rem", padding: "0 2rem" }}>
      {/* Success Title */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#15803d", marginBottom: "0.75rem" }}>
          <CheckCircle2 size={32} />
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a" }}>
          Reservation Confirmed!
        </h1>
        <p style={{ fontSize: "0.92rem", color: "#64748b", marginTop: "0.25rem" }}>
          Show this digital pass at the front desk when you arrive.
        </p>
      </div>

      {/* Ticket Pass Container */}
      <div
        className="clean-card"
        style={{
          padding: "2rem",
          background: "#ffffff",
          border: "2px solid #e2e8f0",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          marginBottom: "2rem",
        }}
      >
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px dashed #cbd5e1", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#2563eb", fontWeight: 700 }}>
              Official Workspace Entry Pass
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
              {booking.property.name}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem", color: "#64748b", marginTop: "0.35rem" }}>
              <MapPin size={15} color="#64748b" />
              <span>{booking.property.address}</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>
              Booking Reference
            </span>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#2563eb", fontFamily: "var(--font-mono)" }}>
              {booking.id}
            </div>
            <span style={{ fontSize: "0.72rem", background: "#dcfce7", color: "#15803d", padding: "0.15rem 0.5rem", borderRadius: 4, fontWeight: 700, display: "inline-block", marginTop: 4 }}>
              CONFIRMED
            </span>
          </div>
        </div>

        {/* Details and QR Code */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "2rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
                  Guest Name
                </span>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                  {booking.guestName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
                  Unit Code
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1d4ed8", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                  {itemSnapshot.code || bookedItem?.code || "Desk"}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
                  Date
                </span>
                <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                  {new Date(booking.startAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
                  Total
                </span>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                  ₹{booking.totalAmount}
                </div>
              </div>
            </div>

            <div style={{ padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.78rem", color: "#64748b" }}>
              Payment status: <strong>Pay at reception on arrival</strong>. No online payment was charged.
            </div>
          </div>

          {/* QR */}
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: 8, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", display: "inline-block" }}>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  style={{ width: 140, height: 140, display: "block" }}
                />
              )}
            </div>
            <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 6, display: "block" }}>
              Scan at reception
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button
          type="button"
          onClick={handlePrint}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.6rem 1.25rem",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#475569",
            fontWeight: 600,
            fontSize: "0.88rem",
            cursor: "pointer",
          }}
        >
          <Printer size={16} />
          <span>Print Pass</span>
        </button>

        <Link
          href="/bookings"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "#2563eb",
            color: "#ffffff",
            padding: "0.6rem 1.35rem",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.88rem",
          }}
        >
          <span>View My Bookings</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
