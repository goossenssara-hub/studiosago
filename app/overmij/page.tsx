import Image from "next/image";
import PageShell from "@/components/PageShell";

export default function OverMijPage() {
  return (
    <PageShell>
      <section className="about-hero">
        <div className="about-copy">
          <p className="eyebrow">Over mij</p>
          <h1>Ik ben Sara.</h1>
          <p>
            Mama van drie, fotograaf, auteur en voormalig leerkracht die haar
            horizonten ging verruimen buiten het onderwijs.
          </p>
        </div>

        <div className="about-photo-main">
          <Image
            src="/assets/sara.jpg"
            alt="Sara Goossens"
            width={520}
            height={640}
            priority
          />
        </div>
      </section>

      <section className="about-grid">
        <article className="about-card orange">
          <h2>Mama van 3</h2>
          <p>
            Mijn gezin is mijn basis. Als mama weet ik hoe belangrijk rust,
            structuur, vertrouwen en verbinding zijn.
          </p>
        </article>

        <article className="about-card teal">
          <h2>Leerkracht met nieuwe horizonten</h2>
          <p>
            Na jaren in het onderwijs koos ik ervoor om mijn ervaring op een
            nieuwe manier in te zetten: warmer, vrijer en dichter bij wie ik ben.
          </p>
        </article>

        <article className="about-card purple">
          <h2>Fotograaf</h2>
          <p>
            Ik leg graag echte momenten vast: puur, spontaan en vol gevoel.
            Beelden die later herinneringen worden.
          </p>
        </article>

        <article className="about-card green">
          <h2>Auteur</h2>
          <p>
            Ik schrijf vanuit ervaring, gevoel en verbeelding. Met woorden wil
            ik raken, ondersteunen en herkenning brengen.
          </p>
        </article>
      </section>

     <section className="about-photo-strip">

  <div className="about-photo-small">
    <Image
      src="/assets/sara-1.jpg"
      alt="Sara"
      fill
      
    />
  </div>

  <div className="about-photo-small">
    <Image
      src="/assets/sara-2.jpg"
      alt="Sara"
      fill
  
    />
  </div>

  <div className="about-photo-small">
    <Image
      src="/assets/sara-3.jpg"
      alt="Sara"
      fill
     
    />
  </div>

</section>

<section className="speelweelde-section">
  <div className="speelweelde-image">
    <Image
      src="/assets/speelweelde.jpg"
      alt="Speelweelde"
      width={700}
      height={520}
    />
  </div>

  <div className="speelweelde-content">
    <p className="eyebrow">Speelweelde</p>

    <h2>Spelend leren staat centraal.</h2>

    <p>
      Naast Studio SaGo zet ik me met veel enthousiasme in voor Speelweelde.
      Daar werk ik mee aan de ontwikkeling van educatieve pakketten,
      lesmaterialen en interactieve activiteiten die kinderen uitdagen om
      spelenderwijs te leren.
    </p>

    <p>
      Daarnaast begeleid en ontwikkel ik educatieve kleuterkampen waarin
      verwondering, creativiteit, beweging en ontdekken centraal staan. Mijn
      ervaring als leerkracht vormt daarbij de basis voor activiteiten die
      zowel leerzaam als plezierig zijn.
    </p>
  </div>
</section>

      <section className="testimonials-section">
        <p className="eyebrow">Ervaringen</p>
        <h2>Wat anderen over Sara zeggen</h2>

        <div className="testimonial-grid">
          <article className="testimonial-card">
            <p>
              “Sara straalt rust uit en ziet heel snel wat iemand nodig heeft.”
            </p>
            <strong>— Naam</strong>
          </article>

          <article className="testimonial-card">
            <p>
              “Warm, betrokken en professioneel. Je voelt meteen dat ze dit met
              haar hart doet.”
            </p>
            <strong>— Naam</strong>
          </article>

          <article className="testimonial-card">
            <p>
              “Een fijne combinatie van ervaring, creativiteit en oprechte zorg.”
            </p>
            <strong>— Naam</strong>
          </article>
        </div>
      </section>
    </PageShell>
  );
}