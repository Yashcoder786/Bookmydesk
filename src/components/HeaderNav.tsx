"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";

export function HeaderNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const stored = localStorage.getItem("bookmydesk_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            setCurrentUser(parsed);
            return;
          }
        }
        setCurrentUser(null);
      } catch (err) {
        setCurrentUser(null);
      }
    };

    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("bookmydesk_user");
    setCurrentUser(null);
    window.dispatchEvent(new Event("auth-change"));
  };

  // Hide header completely on the full-screen sign-in page
  if (pathname === "/signin") {
    return null;
  }

  return (
    <header className="app-header">
      <div className="app-header-container">
        <Link href="/" className="brand-logo">
          BookMyDesk
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href="/partner"
            style={{
              fontSize: "0.82rem",
              color: "#64748b",
              textDecoration: "none",
              fontWeight: 500,
              marginRight: "0.5rem",
            }}
          >
            Partner Portal
          </Link>

          {currentUser?.role === "ADMIN" && (
            <Link
              href="/admin"
              style={{
                fontSize: "0.82rem",
                color: "#fbbf24",
                textDecoration: "none",
                fontWeight: 600,
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "0.35rem 0.75rem",
                borderRadius: "6px",
                marginRight: "0.25rem",
              }}
            >
              Admin Portal
            </Link>
          )}

          <Link href="/bookings" className="btn-my-bookings">
            My Bookings
          </Link>

          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.25rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  background: "rgba(255, 255, 255, 0.07)",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <User size={14} color="#818cf8" />
                <span>{currentUser.name}</span>
                {currentUser?.role === "ADMIN" && (
                  <span style={{ fontSize: "0.68rem", background: "#f59e0b", color: "#000", fontWeight: 800, padding: "0.1rem 0.35rem", borderRadius: "4px" }}>
                    ADMIN
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn-sign-out-icon"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link href="/signin" className="btn-sign-in" id="btn-header-signin">
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
