import PageShell from "@/components/PageShell";
import WebshopOrderForm from "@/components/WebshopOrderForm";
import { webshopProducts } from "@/lib/webshopProducts";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    product: string;
  }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { product } = await params;

  if (product === "tekstcorrectie") {
    return (
      <PageShell>
        <main className="webshop-page">
          <section className="subpage-hero">
            <p className="eyebrow">Tekstcorrectie</p>
            <h1>Tekst of cursus laten nalezen</h1>
            <p>
              Tot 2000 woorden betaal je €20. Daarna betaal je €8 per begonnen
              1000 woorden extra.
            </p>
          </section>

          <WebshopOrderForm product="tekstcorrectie" />
        </main>
      </PageShell>
    );
  }

  const productInfo =
    webshopProducts[product as keyof typeof webshopProducts];

  if (!productInfo) {
    notFound();
  }

  return (
    <PageShell>
      <main className="webshop-page">
        <section className="subpage-hero">
          <p className="eyebrow">Studio SaGo webshop</p>
          <h1>{productInfo.name}</h1>
          <p>Vul je gegevens in en betaal veilig online met Bancontact.</p>
        </section>

        <WebshopOrderForm product={product} />
      </main>
    </PageShell>
  );
}