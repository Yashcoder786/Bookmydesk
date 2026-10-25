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
  Download,
  Share2,
  Wifi,
  Printer,
  Armchair,
  ArrowRight,
  ShieldCheck,
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
    // Launch celebratory confetti!
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

          // Generate QR Code data URL
          const qrString = data.booking.checkInQrData || data.booking.id;
          const url = await QRCode.toDataURL(qrString, {
            width: 240,
            margin: 2,
            color: {
              dark: "#0b0f19",
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
      <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-muted)" }}>
        <div style={{ width: 44, height: 44, border: "3px solid #1e293b", borderTopColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
        <p>Generating your digital workspace entry pass...</p>
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
    <div style={{ maxWidth: 840, margin: "2rem auto", padding: "0 1.5rem 5rem" }}>
      {/* Success Headline */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", border: "2px solid #10b981", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#34d399", marginBottom: "1rem" }}>
          <CheckCircle2 size={36} />
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
          Booking Confirmed!
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
          Your workspace seat is reserved. Show this digital pass on arrival.
        </p>
      </div>

      {/* BookMyShow Style Digital Pass Ticket */}
      <div className="digital-pass" style={{ marginBottom: "2rem" }}>
        {/* Ticket Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px dashed rgba(255,255,255,0.15)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#38bdf8", fontWeight: 700 }}>
              Official Workspace Entry Pass
            </span>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", marginTop: "0.25rem" }}>
              {booking.property.name}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              <MapPin size={15} color="#38bdf8" />
              <span>{booking.property.address}</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>
              Booking Reference
            </span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
              {booking.id}
            </div>
            <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "0.15rem 0.5rem", borderRadius: 4, fontWeight: 700, display: "inline-block", marginTop: 4 }}>
              CONFIRMED
            </span>
          </div>
        </div>

        {/* Ticket Body: Details & QR Code */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "2rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
                  Guest Name
                </span>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginTop: 2 }}>
                  {booking.guestName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
                  Seat / Cabin Code
                </span>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#60a5fa", marginTop: 2, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Armchair size={18} />
                  <span>{itemSnapshot.code || bookedItem?.code || "D-08"}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
                  Valid Date
                </span>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                  <Calendar size={15} color="#38bdf8" />
                  <span>
                    {new Date(booking.startAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
                  Access Window
                </span>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                  <Clock size={15} color="#fbbf24" />
                  <span>{booking.property.openingHours}</span>
                </div>
              </div>
            </div>

            {/* Inclusions Card */}
            <div style={{ padding: "0.85rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "#34d399", fontWeight: 600, marginBottom: "0.25rem" }}>
                <Wifi size={15} />
                <span>Fiber Wi-Fi: Connect to &quot;CoworkHub-Guest&quot;</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Complimentary artisan espresso and tea included at the cafe bay.
              </p>
            </div>
          </div>

          {/* QR Code Container */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ background: "#ffffff", padding: "10px", borderRadius: 14, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Check-in QR Code"
                  style={{ width: 170, height: 170, display: "block" }}
                />
              )}
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.6rem", fontWeight: 600 }}>
              Scan at Entrance
            </span>
          </div>
        </div>

        {/* Ticket Footer */}
        <div style={{ borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "1.25rem", marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", color: "var(--text-dim)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <ShieldCheck size={16} color="#10b981" /> Verified Concurrency Pass
          </span>
          <span>Paid ₹{booking.totalAmount} (GST Included)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
        <button type="button" onClick={handlePrint} className="btn-secondary" style={{ padding: "0.65rem 1.25rem" }}>
          <Printer size={16} />
          <span>Print / Save Pass</span>
        </button>

        <Link href="/bookings" className="btn-primary" style={{ padding: "0.65rem 1.25rem" }}>
          <span>View in My Bookings</span>
          <ArrowRight size={16} />
        </Link>

        <Link href="/" className="btn-secondary" style={{ padding: "0.65rem 1.25rem" }}>
          <span>Explore More Spaces</span>
        </Link>
      </div>
    </div>
  );
}
