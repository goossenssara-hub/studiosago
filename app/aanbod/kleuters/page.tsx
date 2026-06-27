import PageShell from "@/components/PageShell";
import Link from "next/link";
import Image from "next/image";

export default function KleutersPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <div className="container">
          <p className="eyebrow">Educatief aanbod voor kleuters</p>

          <p>
            Spelend leren, ontdekken en groeien. Ontdek het educatieve
            kleuteraanbod van Studio SaGo in samenwerking met Speelweelde.
          </p>
        </div>
      </section>

      <section className="kleuter-aanbod">
        <article className="kleuter-card">
          <div className="kleuter-image">
            <Image
              src="/assets/onderwaterwereld.jpg"
              alt="Expeditie Onderwaterwereld"
              fill
              sizes="(max-width: 1000px) 100vw, 45vw"
            />
          </div>

          <div className="kleuter-content">
            <span className="badge">Educatief kleuterkamp</span>

            <h2>Onderwaterwereld</h2>

            <p>
              Duik samen met Pixel in een magische onderwaterwereld en ga op zoek naar de verdwenen parels. 
              Kinderen beleven twee dagen vol bewegingsspelletjes, creatieve opdrachten, sensorisch spel, muziek, 
              verhalen en ontdekactiviteiten rond de oceaan.
            </p>

            <Link
              href="https://www.speelweelde.be/kampen/aanbod/Kleutereditie:_Onderwaterwereld:_1_&_2_juli_2026_-_Peer_%7C_3-6j_"
              target="_blank"
              rel="noopener noreferrer"
              className="kleuter-button"
            >
              Meer informatie en inschrijven →
            </Link>
          </div>
        </article>

        <article className="kleuter-card">
          <div className="kleuter-image">
            <Image
              src="/assets/eilandenavontuur.jpg"
              alt="Eilandenavontuur"
              fill
              sizes="(max-width: 1000px) 100vw, 45vw"
            />
          </div>

          <div className="kleuter-content">
            <span className="badge">Educatief kleuterkamp</span>

            <h2>Eilandenavontuur</h2>

            <p>
              Ga samen met Pixel op avontuur naar een geheim eiland
              en help de verdwenen schat terug te vinden.
              Kinderen beleven een dag vol bewegingsspelletjes,
              creatieve opdrachten, sensorisch spel, muziek, verhalen en
              spannende ontdekactiviteiten in een tropische eilandwereld.
            </p>

            <Link
              href="https://www.speelweelde.be/kampen/aanbod/Kleutereditie_-_Eilandenavontuur:_19,_20_&_21_augustus_2026_-_Peer_%7C_3-6j"
              target="_blank"
              rel="noopener noreferrer"
              className="kleuter-button"
            >
              Meer informatie en inschrijven →
            </Link>
          </div>
        </article>
      </section>
    </PageShell>
  );
}