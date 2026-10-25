import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Building2, CalendarCheck, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "CoworkHub — BookMyShow for Co-working Spaces",
  description:
    "Discover and reserve hot desks, dedicated seats, and private cabins with live interactive floor plans, 5-minute hold guarantees, and instant digital passes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Top Notification / Demo Indicator */}
        <div style={{
          background: "linear-gradient(90deg, #1e1b4b, #0f172a)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0.35rem 1rem",
          fontSize: "0.75rem",
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem"
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#38bdf8", fontWeight: 600 }}>
            <Sparkles size={13} /> Co-working Space Booking Platform PRD v1.0
          </span>
          <span style={{ color: "#475569" }}>•</span>
          <span>BookMyShow-inspired visual seat selector with real-time interval concurrency</span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{ color: "#10b981", fontWeight: 600 }}>Zero External Gateway Required (Instant Mock Checkout)</span>
        </div>

        {/* Global Navigation Header */}
        <header className="header-nav">
          <div className="nav-container">
            <Link href="/" className="logo-brand">
              <div className="logo-icon">
                <Building2 size={20} />
              </div>
              <span>
                Cowork<span style={{ color: "var(--accent-primary)" }}>Hub</span>
              </span>
            </Link>

            {/* Navigation links */}
            <nav style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <Link href="/" style={{ color: "var(--text-main)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
                Explore Spaces
              </Link>
              <Link href="/bookings" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
                <CalendarCheck size={16} color="#38bdf8" />
                My Bookings
              </Link>
              <Link href="/partner" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
                <UserCheck size={16} color="#a855f7" />
                Partner Portal
              </Link>
              <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
                <ShieldAlert size={16} color="#f59e0b" />
                Admin
              </Link>
            </nav>

            {/* Current User Quick Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.35rem 0.75rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)"
              }}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Yash Salvi"
                  style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                />
                <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-main)" }}>Yash Salvi</span>
                  <span style={{ fontSize: "0.65rem", color: "#38bdf8" }}>Customer Mode</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Application Body */}
        <main>{children}</main>

        {/* Global Footer */}
        <footer style={{
          borderTop: "1px solid var(--border-subtle)",
          background: "#080b11",
          padding: "3.5rem 1.5rem 2rem",
          marginTop: "5rem"
        }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2.5rem" }}>
            <div>
              <div className="logo-brand" style={{ marginBottom: "1rem" }}>
                <div className="logo-icon">
                  <Building2 size={20} />
                </div>
                <span>CoworkHub</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                The high-fidelity workspace discovery and instant seat booking engine. Inspired by BookMyShow with interactive seat maps, temporary holds, and real-time interval concurrency.
              </p>
            </div>

            <div>
              <h4 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>Popular Hubs</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <li>Innov8 Hub — Andheri East, Mumbai</li>
                <li>The Hive — BKC Financial District</li>
                <li>WeCreate Studio — Koramangala 4th Block</li>
                <li>Nexus Co-Work — Baner, Pune</li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>Booking Policies</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <li>5-Minute Checkout Hold Guarantee</li>
                <li>Free cancellation up to 24 hrs prior</li>
                <li>Instant Scannable Digital QR Pass</li>
                <li>Zero Double-Booking Concurrency Lock</li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>Project Specs</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.6 }}>
                Developed according to Co-Working Space Booking Platform PRD v1.0 (25 Oct 2026).
              </p>
            </div>
          </div>

          <div style={{
            maxWidth: 1320,
            margin: "2.5rem auto 0",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.8rem",
            color: "var(--text-dim)"
          }}>
            <span>© 2026 CoworkHub Marketplace. All rights reserved.</span>
            <span>Academic Mini Project Baseline Specification</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
