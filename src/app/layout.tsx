import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { LogOut, ArrowLeft, ShieldAlert, UserCheck, CalendarCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "CoWorkSpace — Workspace Desk & Cabin Booking",
  description: "Reserve flexible hot desks, dedicated seats and private cabins with instant confirmation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Clean Header matching user screenshot */}
        <header className="app-header">
          <div className="app-header-container">
            <Link href="/" className="brand-logo">
              CoWorkSpace
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link href="/partner" style={{ fontSize: "0.82rem", color: "#64748b", textDecoration: "none", fontWeight: 500, marginRight: "0.5rem" }}>
                Partner Portal
              </Link>
              <Link href="/admin" style={{ fontSize: "0.82rem", color: "#64748b", textDecoration: "none", fontWeight: 500, marginRight: "0.5rem" }}>
                Admin
              </Link>
              
              <Link href="/bookings" className="btn-my-bookings">
                My Bookings
              </Link>

              <Link href="/" className="btn-icon-action" title="Back to Home / Exit">
                <LogOut size={17} />
              </Link>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
