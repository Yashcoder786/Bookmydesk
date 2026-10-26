"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
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
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.3rem 0.85rem",
            background: "rgba(248, 182, 70, 0.15)",
            border: "1px solid rgba(248, 182, 70, 0.35)",
            borderRadius: "9999px",
            fontSize: "0.82rem",
            color: "#FBCD54",
            fontWeight: 600,
            marginBottom: "1.25rem",
          }}
        >
          <Sparkles size={14} /> Instant Workspace &amp; Desk Reservation
        </div>

        <h1
          style={{
            fontSize: "3rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: "0.75rem",
            background: "linear-gradient(135deg, #e2e8f0 0%, #FCC7B0 40%, #FBCD54 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Find &amp; Book Your Ideal Co-Working Space
        </h1>

        <p
          style={{
            fontSize: "1.05rem",
            color: "#94a3b8",
            maxWidth: "620px",
            margin: "0 auto 2rem",
            lineHeight: 1.65,
          }}
        >
          Choose your city, explore verified hubs, inspect the unit layout, and reserve your desk or cabin in seconds.
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
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <Search size={18} color="#F8B646" />
          <input
            type="text"
            placeholder="Search by hub name or locality (e.g. Bandra, Koramangala)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "0.92rem",
              fontFamily: "inherit",
              color: "#e2e8f0",
              background: "transparent",
            }}
          />
          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #F8B646 0%, #d4981f 100%)",
              color: "#ffffff",
              padding: "0.65rem 1.35rem",
              borderRadius: "10px",
              border: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(248,182,70,0.4)",
              transition: "all 0.2s ease",
            }}
          >
            Search
          </button>
        </form>

        {/* City Filter Pills */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "9999px",
                border: selectedCity === city
                  ? "1.5px solid rgba(248,182,70,0.7)"
                  : "1px solid rgba(255,255,255,0.1)",
                background: selectedCity === city
                  ? "rgba(248,182,70,0.2)"
                  : "rgba(255,255,255,0.04)",
                color: selectedCity === city ? "#FBCD54" : "#94a3b8",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
            >
              {city === "ALL" ? "All Locations" : city}
            </button>
          ))}
        </div>
      </div>

      {/* Workspaces Grid */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#e2e8f0" }}>
              Explore Workspace Locations
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>
              Click on any location below to view its floor plan and choose your desk or cabin.
            </p>
          </div>
          <span
            style={{
              fontSize: "0.82rem",
              color: "#FBCD54",
              fontWeight: 600,
              padding: "0.3rem 0.75rem",
              background: "rgba(248,182,70,0.12)",
              border: "1px solid rgba(248,182,70,0.25)",
              borderRadius: "9999px",
            }}
          >
            {properties.length} Locations
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "#64748b" }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid rgba(255,255,255,0.08)",
                borderTopColor: "#F8B646",
                borderRadius: "50%",
                margin: "0 auto 1rem",
                animation: "spin 1s linear infinite",
              }}
            />
            <p>Loading available locations...</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "1.75rem",
            }}
          >
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
                  transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(248,182,70,0.3), inset 0 1px 0 rgba(255,255,255,0.1)";
                  e.currentTarget.style.borderColor = "rgba(248,182,70,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                }}
              >
                {/* Cover Image */}
                <div style={{ position: "relative", width: "100%", height: 210, overflow: "hidden" }}>
                  <img
                    src={property.coverImage}
                    alt={property.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {/* Overlay gradient */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to bottom, transparent 50%, rgba(15,12,41,0.85) 100%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(6px)",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#fbbf24",
                      border: "1px solid rgba(251,191,36,0.3)",
                    }}
                  >
                    <Star size={13} fill="#fbbf24" /> {property.rating}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      color: "#e2e8f0",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MapPin size={13} color="#FBCD54" />
                    {property.locality}, {property.city}
                  </div>
                </div>

                {/* Body */}
                <div
                  style={{
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.35rem" }}>
                    {property.name}
                  </h3>

                  <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.55, marginBottom: "1rem" }}>
                    {property.tagline || property.description}
                  </p>

                  {/* Footer */}
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "1rem",
                      borderTop: "1px solid rgba(255,255,255,0.07)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "#64748b",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          display: "block",
                        }}
                      >
                        From
                      </span>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#e2e8f0" }}>
                        â‚¹{property.priceStartingDay}
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 500 }}>/day</span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        background: "linear-gradient(135deg, #F8B646 0%, #d4981f 100%)",
                        color: "#ffffff",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(248,182,70,0.35)",
                      }}
                    >
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

