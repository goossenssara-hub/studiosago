import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function BetalingMisluktPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Betaling mislukt</p>
        <h1>Oeps, je betaling is mislukt</h1>
        <p>
          Er ging iets mis tijdens het betalen. Er werd geen bedrag aangerekend.
          Je kunt veilig opnieuw proberen.
        </p>

        <div className="dashboard-buttons">
          <Link href="/webshop" className="primary-action">
            Opnieuw betalen
          </Link>

          <Link href="/contact" className="secondary-action">
            Contact opnemen
          </Link>
        </div>
      </section>
    </PageShell>
  );
}