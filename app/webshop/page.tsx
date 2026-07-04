import PageShell from "@/components/PageShell";
import Link from "next/link";

const products = [
  {
    category: "Begeleiding",
    title: "10-beurtenkaart Lager onderwijs",
    price: "€320",
    href: "/webshop/10-beurtenkaart-lager",
  },
  {
    category: "Begeleiding",
    title: "10-beurtenkaart Secundair onderwijs",
    price: "€380",
    href: "/webshop/10-beurtenkaart-secundair",
  },
  {
    category: "Klaar voor de Sprong",
    title: "Naar het middelbaar",
    price: "€250",
    date: "14, 15, 16 & 17 juli",
    href: "/webshop/klaar-voor-de-sprong-middelbaar",
  },
  {
    category: "Klaar voor de Sprong",
    title: "Naar het eerste leerjaar",
    price: "€180",
    date: "12, 13 & 14 augustus",
    href: "/webshop/klaar-voor-de-sprong-eerste-leerjaar",
  },
  {
    category: "Tekstcorrectie",
    title: "Tekst of cursus laten nalezen",
    price: "Vanaf €20",
    href: "/webshop/tekstcorrectie",
  },
];

export default function WebshopPage() {
  return (
    <PageShell>
      <main className="webshop-page">
        <section className="webshop-hero">
          <p className="eyebrow">Studio SaGo webshop</p>
          <h1>Webshop</h1>
          <p>
            Koop je beurtenkaart, schrijf in voor een workshop of laat je tekst
            nalezen.
          </p>
        </section>

        <section className="shop-grid">
          {products.map((product) => (
            <article className="shop-card teal" key={product.title}>
              <div className="shop-content">
                <p className="shop-category">{product.category}</p>
                <h2>{product.title}</h2>

                {product.date && <p>{product.date}</p>}

                <div className="shop-bottom">
                  <strong>{product.price}</strong>
                  <Link className="shop-button" href={product.href}>
                    Bekijk
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </PageShell>
  );
}