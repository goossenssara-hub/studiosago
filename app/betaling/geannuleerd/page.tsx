import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function BetalingGeannuleerdPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Betaling geannuleerd</p>
        <h1>Je betaling werd geannuleerd</h1>
        <p>
          Je hebt de betaling stopgezet. Je bestelling werd daardoor niet
          afgerond.
        </p>

        <div className="dashboard-buttons">
          <Link href="/webshop" className="primary-action">
            Terug naar webshop
          </Link>

          <Link href="/" className="secondary-action">
            Terug naar home
          </Link>
        </div>
      </section>
    </PageShell>
  );
}