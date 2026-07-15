import PageShell from "@/components/PageShell";
import Link from "next/link";

type AanbodItem = {
  id: string;
  badge: string;
  label: string;
  title: string;
  price: string;
  href?: string;
  externalHref?: string;
  buttonText?: string;
  text: string[];
};

const aanbod: AanbodItem[] = [
  {
    id: "individuele-begeleiding-secundair",
    badge: "Individueel",
    label: "Begeleiding",
    title: "Huiswerk- en studiebegeleiding",
    price: "€40 per uur",
    href: "/webshop/individuele-begeleiding-secundair",
    buttonText: "Boek begeleiding",
    text: [
      "Ondersteuning bij huiswerk, leren leren, planning en specifieke leerstof.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
      "Vakinhoudelijke begeleiding is mogelijk op aanvraag.",
    ],
  },
  {
    id: "groepsbegeleiding-secundair",
    badge: "Kleine groep",
    label: "Mini-groepje",
    title: "Begeleiding in kleine groep",
    price: "€30 per leerling per uur",
    href: "/webshop/groepsbegeleiding-secundair",
    buttonText: "Boek groepsbegeleiding",
    text: [
      "Voor 2 tot 5 leerlingen met hetzelfde leerdoel.",
      "Leren leren, studiecoaching en executieve functies kunnen worden ingeoefend.",
      "Iedere deelnemer laat zijn gegevens achter en ontvangt bij digitale begeleiding dezelfde Google-link.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    id: "5-beurtenkaart-secundair",
    badge: "Voordeel",
    label: "Voordeelkaart",
    title: "5-beurtenkaart",
    price: "€195",
    href: "/webshop/5-beurtenkaart-secundair",
    buttonText: "Koop je beurtenkaart",
    text: [
      "5 individuele studiebegeleidingsmomenten van één uur.",
      "Flexibel in te plannen op maat van de leerling.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    id: "10-beurtenkaart-secundair",
    badge: "Meeste voordeel",
    label: "Voordeelkaart",
    title: "10-beurtenkaart",
    price: "€380",
    href: "/webshop/10-beurtenkaart-secundair",
    buttonText: "Koop je beurtenkaart",
    text: [
      "10 individuele studiebegeleidingsmomenten van één uur.",
      "Flexibel in te plannen op maat van de leerling.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    id: "ouderondersteuning-secundair",
    badge: "Voor ouders",
    label: "Ondersteuning",
    title: "Hoe help ik mijn kind met leren?",
    price: "€50 per uur",
    href: "/webshop/ouderondersteuning-secundair",
    buttonText: "Boek ouderondersteuning",
    text: [
      "Ik help je een goede leeromgeving te creëren en je kind doelgericht te ondersteunen.",
      "Je kan vooraf vragen doorsturen, zodat we gericht aan de slag kunnen.",
      "We bespreken leren, plannen, concentreren en motiveren.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    id: "vr-expedities",
    badge: "Voor scholen",
    label: "Educatieve workshops",
    title: "VR-expedities",
    price: "In samenwerking met Speelweelde",
    externalHref: "https://www.speelweelde.be/workshops/educatief",
    buttonText: "Meer informatie",
    text: [
      "Interactieve en leerrijke workshops gekoppeld aan de leerplannen van het Vlaamse onderwijs.",
    ],
  },
];

export default function MiddelbaarPage() {
  return (
    <PageShell>
      <main className="basisschool-page">
        <section className="subpage-hero">
          <p className="eyebrow">Educatief aanbod voor het secundair onderwijs</p>
          <h1>Begeleiding op maat</h1>
          <p>
            Rust, structuur en ondersteuning op maat van elke leerling. Kies je
            begeleiding of voordeelkaart en regel alles veilig via de webshop.
          </p>
        </section>

        <section className="aanbod-detail-grid">
          {aanbod.map((item) => {
            const isExternal = Boolean(item.externalHref);
            const href = item.externalHref || item.href || "/webshop";

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
                    {item.buttonText || "Bekijk in de webshop"}
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </PageShell>
  );
}
