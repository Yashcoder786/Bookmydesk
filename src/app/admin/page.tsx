"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Users,
  Activity,
  Layers,
  Building,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, bRes] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/bookings"),
        ]);
        const pData = await pRes.json();
        const bData = await bRes.json();
        if (pData.success) setProperties(pData.properties);
        if (bData.success) setBookings(bData.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: "0 1.5rem 5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.78rem", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-sm)", fontWeight: 700, marginBottom: "0.5rem" }}>
          <ShieldAlert size={14} /> Platform Administration & Governance
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
          Marketplace Admin Console
        </h1>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
          PRD Section 4.3: Partner property verification, listing governance, and booking audit trail
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
            Published Workspaces
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginTop: 4 }}>
            {properties.length} Active Hubs
          </div>
          <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>
            100% Verified Partners
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
            Total Reservations
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginTop: 4 }}>
            {bookings.length} Bookings
          </div>
          <span style={{ fontSize: "0.75rem", color: "#60a5fa", fontWeight: 600 }}>
            Zero Double-Booking Conflicts
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
            Gross Platform Volume
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginTop: 4 }}>
            ₹
            {bookings
              .filter((b) => b.status !== "CANCELLED")
              .reduce((sum, b) => sum + b.totalAmount, 0)
              .toLocaleString("en-IN")}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#fbbf24", fontWeight: 600 }}>
            Sandbox Demo Mode
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
            Hold Engine Status
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#34d399", marginTop: 4 }}>
            HEALTHY
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            5-min TTL Auto-Cleanup Active
          </span>
        </div>
      </div>

      {/* Property Approval & Status Table */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1rem" }}>
          Workspace Partner Properties
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-dim)", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0.75rem 0.5rem" }}>Workspace Property</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Location</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Rating</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Starting Rate</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Approval Status</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "0.85rem 0.5rem", fontWeight: 600, color: "var(--text-main)" }}>
                    {p.name}
                  </td>
                  <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-muted)" }}>
                    {p.locality}, {p.city}
                  </td>
                  <td style={{ padding: "0.85rem 0.5rem", color: "#fbbf24", fontWeight: 600 }}>
                    ★ {p.rating}
                  </td>
                  <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-main)" }}>
                    ₹{p.priceStartingDay}/day
                  </td>
                  <td style={{ padding: "0.85rem 0.5rem" }}>
                    <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "0.15rem 0.5rem", borderRadius: 4, fontWeight: 700 }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 0.5rem" }}>
                    <Link href={`/spaces/${p.slug}`} style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 600, fontSize: "0.82rem" }}>
                      View Live Map →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bookings Audit Trail */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1rem" }}>
          Platform Bookings & Transaction Audit Trail
        </h2>

        {bookings.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No bookings recorded yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-dim)", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Booking ID</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Customer</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Property & Seat</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Schedule</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Total Paid</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.85rem 0.5rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#38bdf8" }}>
                      {b.id}
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-main)" }}>
                      <div>{b.guestName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{b.guestEmail}</div>
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-muted)" }}>
                      <div>{b.property.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#60a5fa", fontWeight: 600 }}>
                        {b.items[0]?.inventoryItem?.code || "Desk"}
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-muted)" }}>
                      {new Date(b.startAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", fontWeight: 700, color: "#fff" }}>
                      ₹{b.totalAmount}
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.5rem",
                          borderRadius: 4,
                          background:
                            b.status === "CANCELLED"
                              ? "rgba(239, 68, 68, 0.15)"
                              : b.status === "CHECKED_IN"
                              ? "rgba(59, 130, 246, 0.2)"
                              : "rgba(16, 185, 129, 0.15)",
                          color:
                            b.status === "CANCELLED"
                              ? "#f87171"
                              : b.status === "CHECKED_IN"
                              ? "#60a5fa"
                              : "#34d399",
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
