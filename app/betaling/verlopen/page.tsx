import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function BetalingVerlopenPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Betaling verlopen</p>
        <h1>De betaallink is verlopen</h1>
        <p>
          De betaling werd niet tijdig afgerond. Je kunt eenvoudig een nieuwe
          bestelling plaatsen via de webshop.
        </p>

        <div className="dashboard-buttons">
          <Link href="/webshop" className="primary-action">
            Nieuwe betaling starten
          </Link>

          <Link href="/" className="secondary-action">
            Terug naar home
          </Link>
        </div>
      </section>
    </PageShell>
  );
}