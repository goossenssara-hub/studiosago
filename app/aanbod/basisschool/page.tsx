import PageShell from "@/components/PageShell";
import Link from "next/link";

type AanbodItem = {
  id: string;
  badge: string;
  label: string;
  title: string;
  price: string;
  service: string;
  text: string[];
  href?: string;
  externalHref?: string;
  buttonText?: string;
};

const aanbod: AanbodItem[] = [
  {
    id: "huiswerkbegeleiding",
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
    id: "mini-groep",
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
    id: "tienbeurtenkaart",
    badge: "Voordeel",
    label: "Voordeelkaart",
    title: "10-beurtenkaart",
    price: "€320",
    service: "10-beurtenkaart-lager",
    href: "/webshop/10-beurtenkaart-lager",
    buttonText: "Koop je beurtenkaart",
    text: [
      "10 individuele lessen van één uur.",
      "Flexibel in te plannen op maat van de leerling.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    id: "ouderbegeleiding",
    badge: "Voor ouders",
    label: "Ondersteuning",
    title: "Hoe help ik mijn kind met leren?",
    price: "€50 per uur",
    service: "ouderbegeleiding",
    text: [
      "Ik help je op weg om een goede leeromgeving te creëren en je kind te ondersteunen bij het leren.",
      "Voor deze sessie kan je vragen doorsturen, zodat we gericht aan de slag kunnen. De leerling mag aanwezig zijn, maar dat is niet verplicht.",
      "We bespreken hoe je je kind kan helpen met leren, plannen, concentreren en motiveren.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    id: "vr-expedities",
    badge: "Voor scholen",
    label: "Educatieve workshops",
    title: "VR-expedities",
    price: "In samenwerking met Speelweelde",
    service: "vr-expedities",
    externalHref: "https://www.speelweelde.be/workshops/educatief",
    buttonText: "Meer informatie",
    text: [
      "Interactieve en leerrijke workshops gekoppeld aan de leerplannen van het Vlaamse onderwijs.",
      "Leerlingen ontdekken leerinhouden op een actieve, visuele en motiverende manier.",
    ],
  },
  {
    id: "klaar-voor-de-sprong-middelbaar",
    badge: "Maximum 9 deelnemers",
    label: "Vierdaagse voorbereiding",
    title: "Klaar voor de Sprong naar het middelbaar",
    price: "€250",
    service: "klaar-voor-de-sprong-middelbaar",
    href: "/webshop/klaar-voor-de-sprong-middelbaar",
    buttonText: "Schrijf je nu in",
    text: [
      "Een intensieve voorbereiding op de overstap van het zesde leerjaar naar het eerste middelbaar.",
      "We werken aan leren leren, plannen, organiseren, taal, wiskunde en zelfvertrouwen.",
      "Door de groep te beperken tot maximaal 9 leerlingen is er voldoende ruimte voor persoonlijke begeleiding.",
      "Het aantal plaatsen is beperkt. Inschrijven kan rechtstreeks via de webshop.",
    ],
  },
];

export default function BasisschoolPage() {
  return (
    <PageShell>
      <main className="basisschool-page">
        <section className="subpage-hero">
          <p className="eyebrow">
            Educatief aanbod voor het lager onderwijs
          </p>

          <h1>Begeleiding op maat</h1>

          <p>
            Rust, structuur en ondersteuning op maat van elke leerling. Van
            huiswerkbegeleiding en studiecoaching tot educatieve workshops en
            voorbereiding op het middelbaar.
          </p>
        </section>

        <section className="aanbod-detail-grid">
          {aanbod.map((item) => {
            const href =
              item.externalHref ||
              item.href ||
              `/contact?service=${encodeURIComponent(item.service)}`;

            const isExternal = Boolean(item.externalHref);

            return (
              <article className="aanbod-detail-card" key={item.id}>
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
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                  >
                    {item.buttonText || "Neem contact op"}
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        <section className="info-grid single basisschool-cta">
          <div className="info-card cta-card">
            <h2>Klaar om samen te groeien?</h2>

            <p>
              Samen bekijken we welke begeleiding het beste aansluit bij de
              noden van jouw kind.
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