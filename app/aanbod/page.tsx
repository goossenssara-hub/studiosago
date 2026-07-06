import PageShell from "@/components/PageShell";
import ServiceCards from "@/components/ServiceCards";
import Link from "next/link";

export default function HomePage() {
  return (
    <PageShell>
      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero-content">
            <p className="eyebrow">Studio SaGo</p>

            <h1>
              Leren. Ontdekken.
              <span> Groeien.</span>
            </h1>

            <p>
              Samen op avontuur in leren, groeien en beleven. Studio SaGo biedt
              educatieve begeleiding, workshops, zorgaanbod en fotografie met
              een warme, persoonlijke aanpak.
            </p>

            <div className="home-hero-actions">
              <Link href="/aanbod" className="primary-button">
                Ontdek het aanbod
              </Link>

              <Link href="/contact" className="secondary-button">
                Plan je afspraak
              </Link>
            </div>
          </div>
        </section>

        <section className="home-intro">
          <p className="eyebrow">Aanbod</p>
          <h2>Een warme plek voor elke leerfase.</h2>
          <p>
            Van kleuters tot studenten, van studiebegeleiding tot zorgaanbod:
            elk traject vertrekt vanuit rust, structuur en vertrouwen.
          </p>
        </section>

        <ServiceCards />

        <section className="home-about">
          <p className="eyebrow">Over Studio SaGo</p>

          <h2>Kleine stappen. Grote groei.</h2>

          <p>
            Studio SaGo combineert jarenlange onderwijservaring met een warme,
            creatieve en doelgerichte aanpak. Elk kind leert anders. Daarom
            stem ik mijn begeleiding af op de noden, talenten en het tempo van
            elke leerling.
          </p>
        </section>
      </main>
    </PageShell>
  );
}