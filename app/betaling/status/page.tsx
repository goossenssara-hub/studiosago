"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";

function BetalingStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const checkoutId = searchParams.get("checkoutId") || "";

  useEffect(() => {
    async function checkPayment() {
      const response = await fetch(
        `/api/checkout/payment-status?checkoutId=${checkoutId}`
      );

      const data = await response.json();
      const product = encodeURIComponent(data.product || "");

      if (data.status === "paid") {
        router.replace(`/bedankt?product=${product}`);
      } else if (data.status === "failed") {
        router.replace(`/betaling/mislukt?product=${product}`);
      } else if (data.status === "canceled") {
        router.replace(`/betaling/geannuleerd?product=${product}`);
      } else if (data.status === "expired") {
        router.replace(`/betaling/verlopen?product=${product}`);
      } else {
        router.replace(`/betaling/open?product=${product}`);
      }
    }

    if (checkoutId) checkPayment();
  }, [checkoutId, router]);

  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Betaling controleren</p>
        <h1>We controleren je betaling...</h1>
        <p>Even geduld, je wordt automatisch doorgestuurd.</p>
      </section>
    </PageShell>
  );
}

export default function BetalingStatusPage() {
  return (
    <Suspense fallback={null}>
      <BetalingStatusContent />
    </Suspense>
  );
}