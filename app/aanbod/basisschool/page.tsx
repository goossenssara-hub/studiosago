import PageShell from "@/components/PageShell";
import Link from "next/link";

const aanbod = [
  {
    badge: "Individueel",
    label: "Begeleiding",
    title: "Huiswerkbegeleiding",
    price: "€35 per uur",
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
    price: "€22 per leerling per uur",
    service: "mini-groep",
    text: [
      "Voor 2 tot 5 leerlingen met hetzelfde leerdoel.",
      "Taal, wiskunde of W.O. kunnen aan bod komen.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    badge: "Voordeel",
    label: "Voordeelkaart",
    title: "10-beurtenkaart",
    price: "€320",
    service: "10-beurtenkaart",
    text: [
      "10 individuele lessen van één uur.",
      "Flexibel in te plannen op maat van de leerling.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    badge: "Wekelijks",
    label: "Vaste begeleiding",
    title: "Wekelijkse begeleiding",
    price: "Vanaf €135 per maand",
    service: "wekelijkse-begeleiding",
    text: [
      "Wekelijkse ondersteuning bij huiswerk en studie.",
      "Mogelijk vanaf 1 keer per week of 2 keer per week.",
      "Maandelijks te betalen.",
    ],
  },
  {
    badge: "Taal",
    label: "Correctie",
    title: "Correctie van teksten",
    price: "Tot 1500 woorden: €15",
    service: "tekstcorrectie",
    text: [
      "Correctie van korte teksten tot 1500 woorden.",
      "Ik kijk spelling, zinsbouw, formulering en leesbaarheid na.",
    ],
  },
];

export default function BasisschoolPage() {
  return (
    <PageShell>
      <main className="basisschool-page">
        <section className="subpage-hero">
          <p className="eyebrow">Educatief aanbod voor het lager onderwijs</p>

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