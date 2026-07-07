"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

const productNamen: Record<string, string> = {
  "10-beurtenkaart-secundair": "10-beurtenkaart Secundair onderwijs",
  "10-beurtenkaart-lager": "10-beurtenkaart Lager onderwijs",
};

export default function BedanktPagina() {
  const searchParams = useSearchParams();
  const product = searchParams.get("product") || "";
  const productNaam = productNamen[product] || "je aankoop";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fff7e8 0%, #f7f3ed 45%, #e9fbf8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "inherit",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 760,
          background: "rgba(255,255,255,0.92)",
          borderRadius: 32,
          padding: "48px 34px",
          textAlign: "center",
          boxShadow: "0 24px 70px rgba(3,54,99,0.16)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: "50%",
            background: "#28b9aa",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: 46,
            fontWeight: 700,
          }}
        >
          ✓
        </div>

        <p
          style={{
            color: "#fea020",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 12,
          }}
        >
          Betaling geslaagd
        </p>

        <h1
          style={{
            color: "#033663",
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1.05,
            marginBottom: 18,
          }}
        >
          Bedankt voor je bestelling!
        </h1>

        <p
          style={{
            color: "#23384d",
            fontSize: "1.2rem",
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Je betaling voor <strong>{productNaam}</strong> werd goed ontvangen.
        </p>

        <div
          style={{
            background: "#f7f3ed",
            borderRadius: 24,
            padding: 26,
            textAlign: "left",
            marginBottom: 32,
            borderLeft: "6px solid #fea020",
          }}
        >
          <h2
            style={{
              color: "#033663",
              fontSize: "1.6rem",
              marginBottom: 12,
            }}
          >
            Wat gebeurt er nu?
          </h2>

          <p style={{ color: "#425466", lineHeight: 1.7, margin: 0 }}>
            Je ontvangt binnenkort een bevestiging. Je beurtenkaart wordt aan je
            dashboard toegevoegd. Van daaruit kun je zelf je afspraken
            inplannen.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              background: "#fea020",
              color: "white",
              padding: "14px 26px",
              borderRadius: 999,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 10px 24px rgba(254,160,32,0.35)",
            }}
          >
            Naar mijn dashboard
          </Link>

          <Link
            href="/webshop"
            style={{
              background: "white",
              color: "#033663",
              padding: "14px 26px",
              borderRadius: 999,
              fontWeight: 700,
              textDecoration: "none",
              border: "2px solid #033663",
            }}
          >
            Verder winkelen
          </Link>
        </div>
      </section>
    </main>
  );
}