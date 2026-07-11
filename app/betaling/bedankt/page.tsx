import PageShell from "@/components/PageShell";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BetalingBedanktPageProps = {
  searchParams: Promise<{
    paymentId?: string;
    checkoutId?: string;
  }>;
};

export default async function BetalingBedanktPage({
  searchParams,
}: BetalingBedanktPageProps) {
  const params = await searchParams;

  const paymentId =
    String(params.paymentId ?? "").trim();

  const checkoutId =
    String(params.checkoutId ?? "").trim();

  const isVoucher =
    paymentId.startsWith("voucher_");

  const isFreeOrder =
    paymentId.startsWith("free_");

  const reference =
    paymentId || checkoutId;

  const title =
    isVoucher || isFreeOrder
      ? "Bedankt voor je bestelling"
      : "Bedankt voor je betaling";

  const description = isVoucher
    ? "Je waardebon werd correct verwerkt. Je bestelling is volledig betaald en geregistreerd."
    : isFreeOrder
      ? "Je gratis bestelling werd correct geregistreerd. Er was geen online betaling nodig."
      : "Je betaling werd goed ontvangen. Je bestelling werd correct geregistreerd.";

  return (
    <PageShell>
      <main className="construction-page">
        <section className="construction-card">
          <p className="eyebrow">
            {isVoucher
              ? "Waardebon verwerkt"
              : isFreeOrder
                ? "Bestelling geregistreerd"
                : "Betaling gelukt"}
          </p>

          <h1>{title}</h1>

          <p>{description}</p>

          <p>
            Je ontvangt binnenkort meer informatie via e-mail.
          </p>

          {reference && (
            <div className="payment-reference-card">
              <span>Referentie</span>
              <strong>{reference}</strong>
            </div>
          )}

          <div className="construction-actions">
            <Link
              href="/dashboard"
              className="primary-action"
            >
              Naar mijn dashboard
            </Link>

            <Link
              href="/webshop"
              className="secondary-action"
            >
              Verder winkelen
            </Link>

            <Link
              href="/"
              className="secondary-action"
            >
              Terug naar de homepage
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}