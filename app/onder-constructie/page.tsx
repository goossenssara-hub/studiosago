import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function OnderConstructiePage() {
  return (
    <PageShell>
      <main className="construction-page">
        <section className="construction-card">
          <p className="eyebrow">🚧 Binnenkort beschikbaar</p>

          <h1>Deze pagina is nog in opbouw</h1>

          <p>
            Ik werk achter de schermen aan deze pagina.<br />
            Binnenkort vind je hier alle informatie terug.
          </p>

          <p>
            Heb je intussen een vraag of wil je graag meer informatie?<br />
            Neem gerust contact op.
          </p>

          <div className="construction-actions">
            <Link href="/contact" className="primary-action">
              Neem contact op
            </Link>

            <Link href="/" className="secondary-action">
              Terug naar de homepage
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}