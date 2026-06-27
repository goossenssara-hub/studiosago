import PageShell from "@/components/PageShell";
import Link from "next/link";

const products = [
  {
    title: "Werkbundel leren leren",
    category: "Digitaal product",
    price: "€12,95",
    description: "Een duidelijke bundel om plannen, studeren en herhalen te oefenen.",
    color: "teal",
  },
  {
    title: "Overgang naar het eerste middelbaar",
    category: "Werkboek",
    price: "€18,95",
    description: "Voor leerlingen die met meer zelfvertrouwen willen starten.",
    color: "purple",
  },
  {
    title: "Kleuterbundel letters & cijfers",
    category: "Printbaar pakket",
    price: "€9,95",
    description: "Speelse oefeningen voor kleuters rond voorbereidend leren.",
    color: "orange",
  },
];

export default function WebshopPage() {
  return (
    <PageShell>
      <section className="webshop-hero">
        <p className="eyebrow">Webshop</p>
        <h1>Materialen die leren lichter maken.</h1>
        <p>
          Ontdek digitale bundels, werkboeken en printbare materialen voor meer rust,
          structuur en zelfvertrouwen.
        </p>
      </section>

      <section className="shop-grid">
        {products.map((product) => (
          <article key={product.title} className={`shop-card ${product.color}`}>
            <p className="shop-category">{product.category}</p>
            <h2>{product.title}</h2>
            <p>{product.description}</p>

            <div className="shop-bottom">
              <strong>{product.price}</strong>
              <Link href="/contact" className="shop-button">
                Bestel
              </Link>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}