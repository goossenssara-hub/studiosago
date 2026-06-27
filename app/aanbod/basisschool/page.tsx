import PageShell from "@/components/PageShell";
import Link from "next/link";

export default function BasisschoolPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Educatief aanbod voor het lager onderwijs</p>
        <p>
          Begeleiding op maat voor kinderen in de basisschool: met rust,
          structuur en op niveau van de leerling.
        </p>
      </section>

      <section className="aanbod-detail-grid">
        <article className="aanbod-detail-card">
          <p className="eyebrow">Begeleiding</p>
          <h2>Huiswerkbegeleiding</h2>
          <p className="price">€35 per uur</p>

          

          <div className="extra-content">
            <p>
            Wanneer huiswerk maken moeilijk loopt. Tijdens deze begeleiding help
            ik aan huis binnen een straal van 15 km rond Peer, of spreek ik
            digitaal af met de leerling om ondersteuning te bieden bij het
            huiswerk.
          </p>
            <p>
              We focussen op leren leren, planning maken en opvolgen, maar er is
              ook de mogelijkheid tot privéles om een bepaald onderdeel extra uit
              te diepen of opnieuw uit te leggen.
            </p>

            <p>
              Alle mogelijkheden worden per leerling individueel besproken na
              aanmelding via het contactformulier.
            </p>
          </div>

          <Link className="primary-action" href="/contact?service=huiswerkbegeleiding">
            Neem contact op
          </Link>
        </article>

        <article className="aanbod-detail-card">
          <p className="eyebrow">Mini-groepje</p>
          <h2>Begeleiding in kleine groep</h2>
          <p className="price">€22 per leerling per uur</p>

          

          <div className="extra-content">
            <p>
            Wanneer er bepaalde leerstof nog eens extra uitgelegd moet worden,
            kun je in een groep met 2 tot 5 leerlingen aanmelden.
          </p>
            <p>
              De begeleiding gebeurt bij de leerlingen thuis binnen een straal
              van 15 km rond Peer, of digitaal.
            </p>

            <p>
              De onderdelen die aan bod kunnen komen zijn taal, wiskunde en W.O.
              zoals natuur, ruimte, tijd, mens en maatschappij.
            </p>

            <p>
              Aanmelden met een groep voor huiswerkbegeleiding is mogelijk
              wanneer alle leerlingen hetzelfde onderwerp moeten studeren.
            </p>
          </div>

          <Link className="primary-action" href="/contact?service=mini-groep">
            Neem contact op
          </Link>
        </article>

        <article className="aanbod-detail-card">
          <p className="eyebrow">Voordeelkaart</p>
          <h2>10-beurtenkaart</h2>
          <p className="price">€320</p>

          

          <div className="extra-content">
            <p>
            Individueel door één leerling te gebruiken voor lessen van één uur.
          </p>
            <p>
              De lessen gaan door bij de leerling thuis binnen een straal van 15
              km rond Peer, of digitaal.
            </p>
          </div>

          <Link className="primary-action" href="/contact?service=10-beurtenkaart">
            Neem contact op
          </Link>
        </article>

        <article className="aanbod-detail-card">
          <p className="eyebrow">Wekelijks</p>
          <h2>Wekelijkse begeleiding</h2>
          <p className="price">Vanaf €135 per maand</p>

          

          <div className="extra-content">
            <p>
            Wekelijks minimaal één uur ondersteuning bij huiswerk en studie.
          </p>
            <p>
              De lessen gaan door bij de leerling thuis binnen een straal van 15
              km rond Peer, of digitaal.
            </p>

            <p>
              Mogelijk vanaf 1 keer per week of 2 keer per week, maandelijks te
              betalen.
            </p>
          </div>

          <Link className="primary-action" href="/contact?service=wekelijkse-begeleiding">
            Neem contact op
          </Link>
        </article>

        <article className="aanbod-detail-card">
          <p className="eyebrow">Taal</p>
          <h2>Correctie van teksten</h2>
          <p className="price">Tot 1500 woorden: €15</p>

         

          <div className="extra-content">
             <p>
            Correctie van korte teksten tot 1500 woorden.
          </p>
            <p>
              Plaats hier extra informatie over wat inbegrepen is, welke teksten
              je corrigeert en hoe klanten hun tekst kunnen doorsturen.
            </p>
          </div>

          <Link className="primary-action" href="/contact?service=tekstcorrectie">
            Neem contact op
          </Link>
        </article>
      </section>

      <section className="info-grid single">
        <div className="info-card cta-card">
          <h2>Interesse in begeleiding?</h2>
          <p>
            Vul het contactformulier in en ik bekijk samen met jou welke vorm
            van begeleiding het beste past.
          </p>

          <Link className="primary-action" href="/contact">
            Neem contact op
          </Link>
        </div>
      </section>
    </PageShell>
  );
}