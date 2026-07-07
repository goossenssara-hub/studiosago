import PageShell from "@/components/PageShell";
import Link from "next/link";
import Image from "next/image";
import FilmrolSlider from "@/components/FilmrolSlider";

export default function KleutersPage() {
  return (
    <PageShell>
      <main className="kleuters-page">
        <section className="subpage-hero">
          <p className="eyebrow">Educatief aanbod voor kleuters</p>

          <h1>Kleuteraanbod</h1>

          <p>
            Spelend leren, ontdekken en groeien. Ontdek het educatieve
            kleuteraanbod van Studio SaGo in samenwerking met Speelweelde.
          </p>
        </section>

        <section className="kleuter-aanbod">
          <article className="kleuter-card">
            <div className="kleuter-image">
              <Image
                src="/assets/eilandenavontuur.jpg"
                alt="Eilandenavontuur"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 380px"
              />
            </div>

            <div className="kleuter-content">
              <span className="badge">Educatief kleuterkamp</span>

              <h1>Eilandenavontuur</h1>

              <p className="kleuter-intro">
                Ga samen met Pixel op avontuur naar een geheim eiland en help
                de verdwenen schat terug te vinden.
              </p>

              <p>
                Tijdens dit kamp beleven kinderen een dag vol
                bewegingsspelletjes, creatieve opdrachten, sensorisch spel,
                muziek, verhalen en spannende ontdekactiviteiten in een
                tropische eilandwereld.
              </p>

              <div className="kleuter-features">
                <span>🌴 3 - 6 jaar</span><br />
                <span>🎨 Creatief</span><br />
                <span>🏃 Beweging</span><br />
                <span>🧩 Sensorisch</span><br />
                <span>🥽 VR-beleving door interactieve muur</span>
              </div>

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

        <FilmrolSlider />
      </main>
    </PageShell>
  );
}