import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function OverMijPage() {
  return (
    <PageShell>
      <main className="about-page">
        {/* Hero */}

        <section className="subpage-hero">
          <p className="eyebrow">Over mij</p>

          <h1>Ik ben Sara.</h1>

          <p>
            Mama van drie, fotograaf, auteur en leerkracht die haar
            horizonten verruimde buiten het onderwijs.
          </p>
        </section>

        {/* Intro */}

        <section className="about-hero">
          <div className="about-text">
            <p>
              Met Studio SaGo combineer ik mijn liefde voor kinderen,
              onderwijs, creativiteit en fotografie. Ik geloof dat leren warm,
              persoonlijk en haalbaar mag zijn.
            </p>

            <p>
              Vanuit mijn ervaring als leerkracht lager en secundair onderwijs
              help ik kinderen en jongeren groeien in zelfvertrouwen,
              studievaardigheden en motivatie.
            </p>

            <p>
              Studio SaGo ontstond vanuit mijn passie om gezinnen, leerlingen
              en scholen te ondersteunen met educatie, fotografie en creatieve
              projecten die een blijvende indruk nalaten.
            </p>
            <p>
              Foto: © Julie Mas
            </p>
          </div>

          <div className="about-image-card">
            <Image
              src="/assets/sara.jpg"
              alt="Sara van Studio SaGo"
              width={650}
              height={800}
              className="about-image"
              priority
            />
          </div>
        </section>

        {/* Speelweelde */}

        <section className="about-speelweelde">
          <div className="about-speelweelde-logo">
            <Image
              src="/assets/logosw.png"
              alt="Speelweelde"
              width={180}
              height={180}
            />
          </div>

          <div className="about-speelweelde-content">
            <p className="eyebrow">Speelweelde</p>

            <h2>Spelend leren staat centraal.</h2>

            <p>
              Naast Studio SaGo zet ik me met veel enthousiasme in voor
              Speelweelde. Daar werk ik mee aan de ontwikkeling van educatieve
              pakketten, lesmaterialen en interactieve activiteiten die
              kinderen uitdagen om spelenderwijs te leren.
            </p>

            <p>
              Daarnaast begeleid en ontwikkel ik educatieve kleuterkampen
              waarin verwondering, creativiteit, beweging en ontdekken centraal
              staan. Mijn ervaring als leerkracht vormt daarbij de basis voor
              activiteiten die zowel leerzaam als plezierig zijn.
            </p>

            <Link
              href="https://www.speelweelde.be"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-action"
            >
              Ontdek Speelweelde
            </Link>
          </div>
        </section>

        {/* Expertises */}

        <section className="about-cards">
          <article>
            <h2>Onderwijs</h2>

            <p>
              Ik begeleid leerlingen met aandacht voor planning, leren leren,
              zelfvertrouwen en persoonlijke groei.
            </p>
          </article>

          <article>
            <h2>Fotografie</h2>

            <p>
              Met SaGo Photography leg ik warme, echte momenten vast voor
              gezinnen, newborns, branding, huwelijken en bijzondere verhalen.
            </p>
          </article>

          <article>
            <h2>Creativiteit</h2>

            <p>
              Studio SaGo is de plek waar educatie, fotografie, workshops,
              boeken en creatieve projecten samenkomen.
            </p>
          </article>
        </section>
      </main>
    </PageShell>
  );
}