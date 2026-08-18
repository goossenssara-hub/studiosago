import Link from "next/link";

export const metadata = {
  title: "SaGo Photography | Studio SaGo",
  description: "Persoonlijke fotogalerijen van SaGo Photography.",
};

export default function PhotographyPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#fbf7f2", color: "#173858" }}>
      <section style={{ width: "min(760px,100%)", background: "white", borderRadius: 28, padding: "clamp(28px,6vw,60px)", boxShadow: "0 24px 70px rgba(35,51,63,.10)", textAlign: "center" }}>
        <p style={{ letterSpacing: ".22em", textTransform: "uppercase", fontSize: 12, fontWeight: 800, color: "#d96d43" }}>Studio SaGo</p>
        <h1 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: "clamp(2.4rem,7vw,4.8rem)", margin: "10px 0 18px" }}>SaGo Photography</h1>
        <p style={{ lineHeight: 1.8, color: "#607080", maxWidth: 560, margin: "0 auto" }}>Klantengalerijen zijn privé. Gebruik de persoonlijke link die je van SaGo Photography hebt ontvangen om jouw foto&apos;s te openen.</p>
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" style={{ padding: "13px 20px", borderRadius: 999, background: "#173858", color: "white", textDecoration: "none", fontWeight: 800 }}>Naar Studio SaGo</Link>
          <Link href="/galerij" style={{ padding: "13px 20px", borderRadius: 999, border: "1px solid #d9e0e5", color: "#173858", textDecoration: "none", fontWeight: 800 }}>Over galerijen</Link>
        </div>
      </section>
    </main>
  );
}
