import PageShell from "@/components/PageShell";
import Link from "next/link";

export default function AfspraakPage() {
  return (
    <PageShell>
      <main className="afspraak-page">
        <section className="afspraak-hero">
          <p className="eyebrow">Studio SaGo</p>
          <h1>Maak een afspraak</h1>
          <p>
            Plan eenvoudig een moment in voor studiebegeleiding,
            huiswerkbegeleiding of coaching.
          </p>

          <div className="afspraak-actions">
            <Link href="/login" className="primary-action">
              Inloggen om te plannen
            </Link>

            <Link href="/contact" className="secondary-action">
              Eerst een vraag stellen
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}