import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function BetalingOpenPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Betaling open</p>
        <h1>Je betaling is nog niet afgerond</h1>
        <p>
          We hebben je betaling nog niet definitief ontvangen. Rond je betaling
          af of probeer het opnieuw.
        </p>

        <div className="dashboard-buttons">
          <Link href="/webshop" className="primary-action">
            Opnieuw proberen
          </Link>

          <Link href="/" className="secondary-action">
            Terug naar home
          </Link>
        </div>
      </section>
    </PageShell>
  );
}