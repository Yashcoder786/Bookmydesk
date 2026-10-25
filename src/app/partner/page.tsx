"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CheckCircle2,
  TrendingUp,
  QrCode,
  Armchair,
  Layers,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";

export default function PartnerDashboardPage() {
  const [passInput, setPassInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [checkInResult, setCheckInResult] = useState<any | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passInput.trim()) return;

    setValidating(true);
    setCheckInResult(null);
    setCheckInError(null);

    try {
      const res = await fetch("/api/partner/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passCode: passInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckInResult(data);
        setPassInput("");
      } else {
        setCheckInError(data.error || "Pass verification failed");
      }
    } catch (err: any) {
      setCheckInError(err.message || "Failed to reach check-in server");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: "0 1.5rem 5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.78rem", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-sm)", fontWeight: 700, marginBottom: "0.5rem" }}>
            <Building2 size={14} /> Partner Operator Portal
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
            Innov8 Workspaces Management
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
            Front desk check-in validator, occupancy monitoring, and floor inventory management
          </p>
        </div>

        <button onClick={loadPartnerData} className="btn-secondary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem" }}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
              Today&apos;s Occupancy
            </span>
            <TrendingUp size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>78.4%</div>
          <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>
            +12% from last week
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
              Active Bookable Desks
            </span>
            <Armchair size={18} color="#60a5fa" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>26 Desks</div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Across 2 Floor bays</span>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
              Private Cabins
            </span>
            <Users size={18} color="#c084fc" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>4 Cabins</div>
          <span style={{ fontSize: "0.75rem", color: "#c084fc", fontWeight: 600 }}>100% Weekend Booked</span>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
              Monthly Revenue
            </span>
            <span style={{ fontSize: "0.85rem", color: "#fbbf24", fontWeight: 800 }}>INR</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>₹1,42,850</div>
          <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>Settled to Partner Account</span>
        </div>
      </div>

      {/* Real-time Front Desk QR Check-in Terminal */}
      <div className="glass-panel-elevated" style={{ padding: "2rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
            <QrCode size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>
              Front Desk Pass Scanner & Check-in Terminal
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Scan the guest QR code or type their Booking Reference ID (e.g. <code>CW-10291</code> or <code>BK-CONFIRMED-DEMO</code>)
            </p>
          </div>
        </div>

        <form onSubmit={handleValidatePass} style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", maxWidth: 650 }}>
          <input
            type="text"
            placeholder="Enter Booking ID (e.g. CW-10291)"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              background: "rgba(10, 13, 20, 0.8)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              color: "#fff",
              fontSize: "0.95rem",
              fontFamily: "var(--font-mono)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={validating}
            className="btn-primary"
            style={{ padding: "0.75rem 1.5rem" }}
          >
            {validating ? "Validating..." : "Validate & Check In"}
          </button>
        </form>

        {checkInResult && (
          <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "0.75rem", color: "#34d399" }}>
            <CheckCircle2 size={24} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Check-in Successful!</div>
              <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>{checkInResult.message}</div>
            </div>
          </div>
        )}

        {checkInError && (
          <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "0.75rem", color: "#f87171" }}>
            <AlertTriangle size={24} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Check-in Failed</div>
              <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>{checkInError}</div>
            </div>
          </div>
        )}
      </div>

      {/* Managed Properties & Live Map Shortlinks */}
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "1rem" }}>
          Managed Workspace Hubs
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {properties.map((p) => (
            <div key={p.id} className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                <img
                  src={p.coverImage}
                  alt={p.name}
                  style={{ width: 80, height: 80, borderRadius: "var(--radius-md)", objectFit: "cover" }}
                />
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {p.name}
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {p.locality}, {p.city}
                  </div>
                  <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "0.1rem 0.5rem", borderRadius: 4, fontWeight: 700, display: "inline-block", marginTop: 4 }}>
                    {p.status}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "auto", display: "flex", gap: "0.5rem" }}>
                <Link
                  href={`/spaces/${p.slug}`}
                  className="btn-primary"
                  style={{ flex: 1, padding: "0.5rem", fontSize: "0.82rem", justifyContent: "center" }}
                >
                  <Layers size={14} />
                  <span>Inspect Live Map</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
