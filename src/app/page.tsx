"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Calendar,
  Layers,
  Star,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Zap,
  Filter,
} from "lucide-react";
import { PropertyCardDTO } from "@/lib/types";

export default function HomePage() {
  const [properties, setProperties] = useState<PropertyCardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingPlan, setBookingPlan] = useState<"DAY" | "MONTH">("DAY");
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  const cities = ["ALL", "Mumbai", "Bengaluru", "Pune"];

  useEffect(() => {
    fetchProperties();
  }, [selectedCity, bookingPlan]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity !== "ALL") params.append("city", selectedCity);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      params.append("plan", bookingPlan);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error("Failed to load properties", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient">
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.85rem",
              background: "rgba(59, 130, 246, 0.12)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "var(--radius-full)",
              fontSize: "0.82rem",
              color: "#60a5fa",
              fontWeight: 600,
              marginBottom: "1.25rem",
            }}
          >
            <Zap size={15} /> BookMyShow-Style Interactive Seat Selection
          </div>
          <h1 className="hero-title">
            Book Premium Workspace Desks & Cabins in Seconds
          </h1>
          <p className="hero-subtitle">
            Inspect live floor plans, choose your exact seat, lock it with a
            5-minute hold guarantee, and get an instant scannable digital entry pass.
          </p>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="search-bar-widget">
            <div className="search-field">
              <label>Location / Hub</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={16} color="#3b82f6" />
                <input
                  type="text"
                  placeholder="e.g. Andheri East, BKC, Koramangala..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field">
              <label>Booking Date</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={16} color="#38bdf8" />
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field">
              <label>Plan Type</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Layers size={16} color="#10b981" />
                <select
                  value={bookingPlan}
                  onChange={(e) => setBookingPlan(e.target.value as "DAY" | "MONTH")}
                >
                  <option value="DAY">Day Pass (Full Day)</option>
                  <option value="MONTH">Monthly Pass (30 Days)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: "0 1.75rem" }}>
              <Search size={18} />
              <span>Find Seats</span>
            </button>
          </form>

          {/* Quick City Filters */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              marginTop: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600 }}>
              Quick Cities:
            </span>
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                className="city-pill"
                onClick={() => setSelectedCity(city)}
                style={{
                  background:
                    selectedCity === city
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(255, 255, 255, 0.05)",
                  borderColor:
                    selectedCity === city
                      ? "var(--accent-primary)"
                      : "var(--border-subtle)",
                  color: selectedCity === city ? "#60a5fa" : "var(--text-muted)",
                }}
              >
                {city === "ALL" ? "All Locations" : city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Feature Badges */}
      <section
        style={{
          maxWidth: 1100,
          margin: "1rem auto 3rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          padding: "0 1.5rem",
        }}
      >
        <div className="glass-panel" style={{ padding: "1.1rem 1.25rem", display: "flex", gap: "0.85rem", alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
            <Layers size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-main)" }}>Live Visual Seat Map</h4>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>BookMyShow floor plan view for desks & cabins</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.1rem 1.25rem", display: "flex", gap: "0.85rem", alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
            <Clock size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-main)" }}>5-Minute Hold Lock</h4>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>Zero double-booking server concurrency guarantee</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.1rem 1.25rem", display: "flex", gap: "0.85rem", alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-main)" }}>Instant QR Pass</h4>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>Fast biometric / operator check-in on arrival</p>
          </div>
        </div>
      </section>

      {/* Main Spaces Listing Section */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              Available Co-Working Spaces
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Showing {properties.length} published spaces ready for instant seat selection
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
              Pricing Mode:
            </span>
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.1)",
                padding: "0.25rem 0.65rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              {bookingPlan === "DAY" ? "Day Pass (Daily)" : "Monthly Pass (30 Days)"}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <div style={{ width: 44, height: 44, border: "3px solid #1e293b", borderTopColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
            <p>Loading available workspaces...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: 600, margin: "2rem auto" }}>
            <MapPin size={40} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.25rem", color: "var(--text-main)", marginBottom: "0.5rem" }}>No Workspaces Found</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              We could not find any active spaces matching your search query. Try clearing your filters.
            </p>
            <button
              onClick={() => {
                setSelectedCity("ALL");
                setSearchQuery("");
              }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="property-grid" style={{ margin: "0" }}>
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/spaces/${property.slug}?date=${bookingDate}&plan=${bookingPlan}`}
                className="property-card"
              >
                <div className="property-cover-container">
                  <img
                    src={property.coverImage}
                    alt={property.name}
                    className="property-cover-img"
                  />
                  <div className="property-rating-badge">
                    <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                    <span>{property.rating}</span>
                    <span style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 400 }}>
                      ({property.reviewCount})
                    </span>
                  </div>
                  <div className="property-city-badge">
                    {property.locality}, {property.city}
                  </div>
                </div>

                <div className="property-body">
                  <h3 className="property-name">{property.name}</h3>
                  <div className="property-address">
                    <MapPin size={14} color="#64748b" />
                    <span>{property.address}</span>
                  </div>

                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                      marginBottom: "1rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {property.tagline || property.description}
                  </p>

                  <div className="amenity-chips">
                    {property.amenities.slice(0, 3).map((amenity) => (
                      <span key={amenity.id} className="amenity-chip">
                        {amenity.name}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="amenity-chip" style={{ color: "#38bdf8" }}>
                        +{property.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="property-footer">
                    <div className="price-tag">
                      <span className="from-label">
                        Starting from
                      </span>
                      <div className="amount">
                        ₹
                        {bookingPlan === "DAY"
                          ? property.priceStartingDay
                          : property.priceStartingMonth}
                        <span>/{bookingPlan === "DAY" ? "day" : "month"}</span>
                      </div>
                    </div>

                    <div className="btn-primary" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem" }}>
                      <span>Select Seats</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
