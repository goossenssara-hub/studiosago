import PageShell from "@/components/PageShell";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Klantenportaal</p>
        <h1>Mijn Studio SaGo.</h1>
        <p>Hier komen straks afspraken, facturen, downloads en documenten voor klanten.</p>
      </section>
      <section className="portal-grid">
        <Link className="portal-card" href="/dashboard">Mijn afspraken</Link>
        <Link className="portal-card" href="/dashboard">Facturen</Link>
        <Link className="portal-card" href="/dashboard">Downloads</Link>
        <Link className="portal-card" href="/dashboard">Profiel</Link>
      </section>
    </PageShell>
  );
}
