"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Calendar,
  Layers,
  Star,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Wifi,
  Coffee,
} from "lucide-react";
import { PropertyCardDTO } from "@/lib/types";

export default function HomePage() {
  const [properties, setProperties] = useState<PropertyCardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const cities = ["ALL", "Mumbai", "Bengaluru", "Pune"];

  useEffect(() => {
    fetchProperties();
  }, [selectedCity]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity !== "ALL") params.append("city", selectedCity);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

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
    <div style={{ maxWidth: 1360, margin: "2rem auto 5rem", padding: "0 2rem" }}>
      {/* Hero Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.85rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "9999px", fontSize: "0.82rem", color: "#1d4ed8", fontWeight: 600, marginBottom: "1rem" }}>
          <Sparkles size={14} /> Instant Workspace & Desk Reservation
        </div>

        <h1 style={{ fontSize: "2.75rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
          Find & Book Your Ideal Co-Working Space
        </h1>

        <p style={{ fontSize: "1.05rem", color: "#475569", maxWidth: "650px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
          Choose your city, explore verified hubs, click any location, inspect the unit layout, and reserve your desk or cabin in seconds.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="clean-card"
          style={{
            maxWidth: 650,
            margin: "0 auto",
            padding: "0.5rem 0.5rem 0.5rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search by hub name or locality (e.g. Bandra, Andheri, Koramangala)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              color: "#0f172a",
              background: "transparent",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#2563eb",
              color: "#ffffff",
              padding: "0.65rem 1.35rem",
              borderRadius: "10px",
              border: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        {/* City Filter Pills */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                border: selectedCity === city ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                background: selectedCity === city ? "#eff6ff" : "#ffffff",
                color: selectedCity === city ? "#1d4ed8" : "#64748b",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {city === "ALL" ? "All Locations" : city}
            </button>
          ))}
        </div>
      </div>

      {/* Workspaces Grid */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#0f172a" }}>
              Explore Workspace Locations
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>
              Click on any location below to view its floor plan and choose your desk or cabin.
            </p>
          </div>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>
            {properties.length} Locations Available
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "#64748b" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }}></div>
            <p>Loading available locations...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.75rem" }}>
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/spaces/${property.slug}`}
                className="clean-card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 25px -4px rgba(0, 0, 0, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.04)";
                }}
              >
                {/* Cover Image */}
                <div style={{ position: "relative", width: "100%", height: 210, overflow: "hidden" }}>
                  <img
                    src={property.coverImage}
                    alt={property.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "0.25rem 0.55rem", borderRadius: "9999px", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 700, color: "#d97706" }}>
                    <Star size={13} fill="#d97706" /> {property.rating}
                  </div>
                  <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(15, 23, 42, 0.8)", color: "#ffffff", padding: "0.25rem 0.65rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
                    {property.locality}, {property.city}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.35rem" }}>
                    {property.name}
                  </h3>

                  <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5, marginBottom: "1rem" }}>
                    {property.tagline || property.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "#64748b", marginBottom: "1.25rem" }}>
                    <MapPin size={14} color="#64748b" />
                    <span>{property.address}</span>
                  </div>

                  {/* Footer */}
                  <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                        From
                      </span>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                        ₹{property.priceStartingDay}
                        <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>/day</span>
                      </div>
                    </div>

                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#2563eb", color: "#ffffff", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
                      <span>View Desks</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
