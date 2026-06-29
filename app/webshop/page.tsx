import PageShell from "@/components/PageShell";
import Link from "next/link";
import Image from "next/image";

const products = [
  {
    title: "Werkbundel leren leren",
    category: "Digitaal product",
    price: "€12,95",
    description: "Een duidelijke bundel om plannen, studeren en herhalen te oefenen.",
    color: "teal",
    image: "/assets/sara.jpg",
  },
  {
    title: "Overgang naar het eerste middelbaar",
    category: "Werkboek",
    price: "€18,95",
    description: "Voor leerlingen die met meer zelfvertrouwen willen starten.",
    color: "purple",
    image: "/assets/sara.jpg",
  },
  {
    title: "Kleuterbundel letters & cijfers",
    category: "Printbaar pakket",
    price: "€9,95",
    description: "Speelse oefeningen voor kleuters rond voorbereidend leren.",
    color: "orange",
    image: "/assets/sara.jpg",
  },
  {
    title: "Studieplanner",
    category: "Download",
    price: "€7,95",
    description: "Een rustige planner om taken, toetsen en planning overzichtelijk te houden.",
    color: "green",
    image: "/assets/sara.jpg",
  },
  {
    title: "Dagstructuurkaarten",
    category: "Printbaar pakket",
    price: "€8,95",
    description: "Visuele kaarten voor meer voorspelbaarheid thuis of in de klas.",
    color: "teal",
    image: "/assets/sara.jpg",
  },
  {
    title: "Rustbundel voor kinderen",
    category: "Digitaal product",
    price: "€10,95",
    description: "Oefeningen rond prikkelverwerking, ademhaling en rustmomenten.",
    color: "purple",
    image: "/assets/sara.jpg",
  },
];

export default function WebshopPage() {
  return (
    <PageShell>
      <main className="webshop-page">
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
<div className="shop-content">

<div className="shop-header">
  <div className="shop-title">
    <p className="shop-category">{product.category}</p>
    <h2>{product.title}</h2>
  </div>

  <div className="shop-thumbnail">
    <Image
      src={product.image}
      alt={product.title}
      width={96}
      height={96}
      className="shop-thumbnail-img"
    />
  </div>
</div>
    <div className="shop-description">
        <p>{product.description}</p>
    </div>

    <div className="shop-bottom">
        <strong>{product.price}</strong>

        <Link href="/contact" className="shop-button">
            Bestel
        </Link>
    </div>

</div></article>          ))}
        </section>
      </main>
    </PageShell>
  );
}