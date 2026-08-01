import PageShell from "@/components/PageShell";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_INSCHRIJVINGEN = 9;
const PRODUCT_SLUG = "klaar-voor-de-sprong-middelbaar";

type AanbodItem = {
  id: string;
  badge: string;
  label: string;
  title: string;
  price: string;
  href?: string;
  externalHref?: string;
  buttonText?: string;
  limited?: boolean;
  text: string[];
};

const aanbod: AanbodItem[] = [
  {
    id: "individuele-begeleiding-lager",
    badge: "Individueel",
    label: "Begeleiding",
    title: "Huiswerkbegeleiding",
    price: "€35 per uur",
    href: "/webshop/individuele-begeleiding-lager",
    buttonText: "Boek begeleiding",
    text: [
      "Ondersteuning bij huiswerk, leren leren en planning.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
      "Mogelijkheid tot privéles voor specifieke leerstof.",
    ],
  },
  {
    id: "groepsbegeleiding-lager",
    badge: "Kleine groep",
    label: "Mini-groepje",
    title: "Begeleiding in kleine groep",
    price: "€22 per leerling per uur",
    href: "/webshop/groepsbegeleiding-lager",
    buttonText: "Boek groepsbegeleiding",
    text: [
      "Voor 2 tot 5 leerlingen met hetzelfde leerdoel.",
      "Taal, wiskunde, W.O., leren leren en planning kunnen aan bod komen.",
      "Iedere deelnemer laat zijn gegevens achter en ontvangt bij digitale begeleiding dezelfde Google-link.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    id: "5-beurtenkaart-lager",
    badge: "Voordeel",
    label: "Voordeelkaart",
    title: "5-beurtenkaart",
    price: "€165",
    href: "/webshop/5-beurtenkaart-lager",
    buttonText: "Koop je beurtenkaart",
    text: [
      "5 individuele begeleidingsmomenten van één uur.",
      "Flexibel in te plannen op maat van de leerling.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    id: "10-beurtenkaart-lager",
    badge: "Meeste voordeel",
    label: "Voordeelkaart",
    title: "10-beurtenkaart",
    price: "€320",
    href: "/webshop/10-beurtenkaart-lager",
    buttonText: "Koop je beurtenkaart",
    text: [
      "10 individuele begeleidingsmomenten van één uur.",
      "Flexibel in te plannen op maat van de leerling.",
      "Aan huis binnen 15 km rond Peer of digitaal.",
    ],
  },
  {
    id: "ouderondersteuning-lager",
    badge: "Voor ouders",
    label: "Ondersteuning",
    title: "Hoe help ik mijn kind met leren?",
    price: "€50 per uur",
    href: "/webshop/ouderondersteuning-lager",
    buttonText: "Boek ouderondersteuning",
    text: [
      "Ik help je een goede leeromgeving te creëren en je kind doelgericht te ondersteunen.",
      "Je kan vooraf vragen doorsturen, zodat we gericht aan de slag kunnen.",
      "De leerling mag aanwezig zijn, maar dat is niet verplicht.",
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

async function getAantalInschrijvingen() {
  const supabaseAdmin = getSupabaseAdmin();
  const { count, error } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("product_slug", PRODUCT_SLUG)
    .in("status", ["paid", "open", "pending"]);

  if (error) {
    console.error("Aantal inschrijvingen ophalen mislukt:", error);
    return 0;
  }

  return count ?? 0;
}

export default async function BasisschoolPage() {
  const aantalInschrijvingen = await getAantalInschrijvingen();
  const plaatsenOver = Math.max(0, MAX_INSCHRIJVINGEN - aantalInschrijvingen);
  const isVolzet = plaatsenOver === 0;

  return (
    <PageShell>
      <main className="basisschool-page">
        <section className="subpage-hero">
          <p className="eyebrow">Educatief aanbod voor het lager onderwijs</p>
          <h1>Begeleiding op maat</h1>
          <p>
            Rust, structuur en ondersteuning op maat van elk kind. Kies je
            begeleiding of voordeelkaart en regel alles veilig via de webshop.
          </p>
        </section>

        <section className="aanbod-detail-grid">
          {aanbod.map((item) => {
            const isExternal = Boolean(item.externalHref);
            const href = item.externalHref || item.href || "/webshop";
            const itemIsVolzet = Boolean(item.limited && isVolzet);

            return (
              <article
                className={`aanbod-detail-card ${
                  itemIsVolzet ? "aanbod-detail-card-volzet" : ""
                }`}
                key={item.id}
              >
                <div className="aanbod-card-top">
                  <span className="aanbod-badge">
                    {item.limited
                      ? isVolzet
                        ? "Volzet"
                        : `Nog ${plaatsenOver} ${plaatsenOver === 1 ? "plaats" : "plaatsen"}`
                      : item.badge}
                  </span>
                  <p className="eyebrow">{item.label}</p>
                  <h2>{item.title}</h2>
                  <p className="price">{item.price}</p>
                </div>

                <div className="extra-content">
                  {item.text.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {itemIsVolzet ? (
                    <span className="primary-action primary-action-disabled" aria-disabled="true">
                      Inschrijvingen volzet
                    </span>
                  ) : (
                    <Link
                      className="primary-action"
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      {item.buttonText || "Bekijk in de webshop"}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </PageShell>
  );
}
