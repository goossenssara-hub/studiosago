import Link from "next/link";

export const metadata = {
  title: "Privégalerij | SaGo Photography",
  robots: { index: false, follow: false },
};

export default function GalleryIndexPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#fbf7f2", color: "#173858" }}>
      <section style={{ width: "min(680px,100%)", textAlign: "center", background: "white", padding: "clamp(28px,6vw,56px)", borderRadius: 26, boxShadow: "0 20px 60px rgba(35,51,63,.09)" }}>
        <div style={{ fontSize: 44 }}>♡</div>
        <h1 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: "clamp(2rem,6vw,3.8rem)", margin: "12px 0" }}>Jullie privégalerij</h1>
        <p style={{ lineHeight: 1.8, color: "#607080" }}>Om privacyredenen staat hier geen lijst met klantengalerijen. Open de unieke galerijlink die je rechtstreeks van SaGo Photography kreeg.</p>
        <Link href="/fotografie" style={{ display: "inline-block", marginTop: 24, padding: "13px 20px", borderRadius: 999, background: "#d96d43", color: "white", textDecoration: "none", fontWeight: 800 }}>SaGo Photography</Link>
      </section>
    </main>
  );
}
