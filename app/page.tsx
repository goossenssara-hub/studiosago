import PageShell from "@/components/PageShell";
import Hero from "@/components/Hero";
import ServiceCards from "@/components/ServiceCards";
import Link from "next/link";

export default function Home() {
  return (
    <PageShell>
      <Hero />
      <ServiceCards />

      <section className="info-grid" id="over">
        <div className="info-card wide">
          <p className="eyebrow">Over Studio SaGo</p>
          <h2>Leren met rust, vertrouwen en structuur.</h2>
          <p>
            Studio SaGo biedt educatieve begeleiding voor kleuters, kinderen,
            jongeren en studenten. Ik combineer mijn jarenlange ervaring in het
            lager en secundair onderwijs met een warme, persoonlijke en
            doelgerichte aanpak. Elke leerling leert op zijn of haar eigen
            manier. Daarom stem ik mijn begeleiding af op de individuele noden,
            talenten en het leertempo van elke deelnemer. Zo creëer ik een
            veilige en motiverende omgeving waarin kinderen en jongeren met meer
            zelfvertrouwen kunnen leren en groeien.
          </p>
        </div>

        <div className="info-card cta-card">
          <h2>Klaar om te starten?</h2>
          <p>
            Kies het aanbod dat bij jou past, selecteer een datum en tijd, en
            dien eenvoudig je aanvraag in. Ik neem vervolgens zo snel mogelijk
            contact met je op om alles te bevestigen.
          </p>
          <Link className="primary-action" href="/contact">
            Plan je afspraak
          </Link>
        </div>
      </section>
    </PageShell>
  );
}