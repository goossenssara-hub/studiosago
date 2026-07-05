import PageShell from "@/components/PageShell";
import Link from "next/link";

const aanbod = [
  {
    badge: "Individueel",
    label: "Begeleiding",
    title: "Huiswerkbegeleiding",
    price: "€40 per uur",
    service: "huiswerkbegeleiding",
    text: [
      "Ondersteuning bij huiswerk, leren leren en planning.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
      "Mogelijkheid tot privéles voor specifieke leerstof.",
    ],
  },
  {
    badge: "Kleine groep",
    label: "Mini-groepje",
    title: "Begeleiding in kleine groep",
    price: "€30 per leerling per uur",
    service: "mini-groep",
    text: [
      "Voor 2 tot 5 leerlingen met hetzelfde leerdoel.",
      "Leren leren, studiecoaching, executieve functies inoefenen.",
      "Vakinhoudelijk: Nederlands, biologie/natuurwetenschappen, geschiedenis, aardrijkskunde, mens & samenleving, PAV en MAVO. Andere vakken op aanvraag.",

      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    badge: "Voordeel",
    label: "Voordeelkaart",
    title: "10-beurtenkaart",
    price: "€380",
    service: "10-beurtenkaart",
    text: [
      "10 individuele studiecoachinglessen van één uur.",
      "Flexibel in te plannen op maat van de leerling.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
 
  {
    badge: "Voor ouders",
    label: "Ondersteuning",
    title: "Hoe help ik mijn kind met leren?",
    price: "€50",
    service: "10-beurtenkaart",
    text: [
      "Ik help je op weg om een goede leeromgeving te creëren en je kind te ondersteunen bij het leren.",
      "Voor deze sessie kan je vragen doorsturen zodat we gericht aan de slag kunnen. De leerling mag, maar moet hiervoor niet aanwezig zijn.",
      "We bespreken hoe je je kind kan helpen met leren, plannen, concentreren en motiveren.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },


];

export default function BasisschoolPage() {
  return (
    <PageShell>
      <main className="basisschool-page">
        <section className="subpage-hero">
          <p className="eyebrow">Educatief aanbod voor het secundair onderwijs</p>

          <h1>Begeleiding op maat</h1>

          <p>
            Rust, structuur en ondersteuning op maat van elke leerling. Van
            huiswerkbegeleiding tot studiecoaching en privélessen.
          </p>
        </section>

        <section className="aanbod-detail-grid">
          {aanbod.map((item) => (
            <article className="aanbod-detail-card" key={item.service}>
              <div className="aanbod-card-top">
                <span className="aanbod-badge">{item.badge}</span>

                <p className="eyebrow">{item.label}</p>

                <h2>{item.title}</h2>

                <p className="price">{item.price}</p>
              </div>

              <div className="extra-content">
                {item.text.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                <Link
                  className="primary-action"
                  href={`/contact?service=${item.service}`}
                >
                  Neem contact op
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="info-grid single basisschool-cta">
          <div className="info-card cta-card">
            <h2>Klaar om samen te groeien?</h2>

            <p>
              Samen bekijken we welke begeleiding het beste aansluit bij de noden
              van jouw kind.
            </p>

            <Link className="primary-action" href="/contact">
              Neem contact op
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}