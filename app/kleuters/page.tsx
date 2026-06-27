import PageShell from "@/components/PageShell";
import Link from "next/link";
import Image from "next/image";

export default function KleutersPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <div className="container">
          <p className="eyebrow">Educatief aanbod</p>
          <h1>Voor kleuters</h1>
          <p>
            Spelend leren, ontdekken en groeien. Ontdek het educatieve
            kleuteraanbod van Studio SaGo.
          </p>
        </div>
      </section>

      <section className="kleuter-aanbod">
        <Link
          href="#"
          className="kleuter-card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="kleuter-image">
            <Image
              src="/images/onderwaterwereld.jpg"
              alt="Expeditie Onderwaterwereld"
              fill
            />
          </div>

          <div className="kleuter-content">
            <span className="badge">Educatieve workshop</span>
            <h2>Expeditie Onderwaterwereld</h2>

            <p>
              Duik samen met de kinderen in een magische onderwaterwereld.
              Ontdek kleurrijke vissen, schatten en leer spelenderwijs over de
              oceaan met interactieve VR-opdrachten.
            </p>

            <span className="button">
              Meer informatie →
            </span>
          </div>
        </Link>

        <Link
          href="#"
          className="kleuter-card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="kleuter-image">
            <Image
              src="/images/eilandenavontuur.jpg"
              alt="Eilandenavontuur"
              fill
            />
          </div>

          <div className="kleuter-content">
            <span className="badge">Educatieve workshop</span>
            <h2>Eilandenavontuur</h2>

            <p>
              Trek op ontdekkingstocht naar tropische eilanden vol uitdagingen,
              dieren en verrassingen. Een speelse VR-beleving voor nieuwsgierige
              kleuters.
            </p>

            <span className="button">
              Meer informatie →
            </span>
          </div>
        </Link>
      </section>
    </PageShell>
  );
}