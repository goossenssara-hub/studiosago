import PageShell from "@/components/PageShell";
import DynamicWebshopOrderForm from "@/components/DynamicWebshopOrderForm";
import { createClient } from "@/lib/supabase/server";
import { getBuiltInService, normalizeService } from "@/lib/webshopService";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ product: string }> };

export default async function ProductPage({ params }: Props) {
  const { product } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .or(`slug.eq.${product},href.eq./webshop/${product}`)
    .eq("is_visible", true)
    .limit(1)
    .maybeSingle();

  // De vier begeleidingspagina's blijven bereikbaar, ook wanneer de SQL-migratie
  // nog niet werd uitgevoerd of het product nog niet in services staat.
  const service = data
    ? normalizeService(data as Record<string, unknown>)
    : getBuiltInService(product);

  if (!service) {
    if (error) console.error("WEBSHOP PRODUCT LOAD ERROR:", error);
    notFound();
  }

  if (service.external_url) redirect(service.external_url);

  return (
    <PageShell>
      <main className="webshop-page">
        <section className="subpage-hero">
          <p className="eyebrow">Studio SaGo webshop</p>
          <h1>{service.title}</h1>
          <p>{service.description || "Vul je gegevens in en betaal veilig online via Mollie."}</p>
        </section>
        <DynamicWebshopOrderForm service={service} />
      </main>
    </PageShell>
  );
}
