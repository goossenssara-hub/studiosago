import PageShell from "@/components/PageShell";
import Link from "next/link";

export default function BetalingBedanktPage() {
  return (
    <PageShell>
      <main className="construction-page">
        <section className="construction-card">
          <p className="eyebrow">Betaling gelukt</p>

          <h1>Bedankt voor je betaling</h1>

          <p>
            Je betaling werd goed ontvangen. Je ontvangt binnenkort meer
            informatie via e-mail.
          </p>

          <div className="construction-actions">
            <Link href="/" className="primary-action">
              Terug naar de homepage
            </Link>

            <Link href="/aanbod" className="secondary-action">
              Bekijk het aanbod
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}