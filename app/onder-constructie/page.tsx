import PageShell from "@/components/PageShell";
import Link from "next/link";

export default function UnderConstructionPage() {
  return (
    <PageShell>
      <section className="construction-page">
        <div className="construction-card">
          <div className="construction-icon">🚧</div>

          <p className="eyebrow">Binnenkort beschikbaar</p>

          <h1>Deze pagina is nog in opbouw</h1>

          <p className="construction-text">
            Ik ben volop bezig om deze pagina verder uit te werken zodat je hier
            binnenkort alle informatie terugvindt.
          </p>

          <p className="construction-text">
            Heb je intussen een vraag of wil je graag meer informatie?
            Neem gerust contact op.
          </p>

          <div className="construction-buttons">
            <Link href="/contact" className="primary-action">
              Neem contact op
            </Link>

            <Link href="/" className="secondary-action">
              Terug naar de homepage
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}