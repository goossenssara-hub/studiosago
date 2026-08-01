import PageShell from "@/components/PageShell";
import WebshopCategories, {
  type WebshopService,
} from "@/components/WebshopCategories";
import { createClient } from "@/lib/supabase/server";
import { getBuiltInService } from "@/lib/webshopService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WebshopPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select(
      "id,title,subtitle,category,description,price,button_text,href,slug,external_url,event_dates,image_url,is_visible,sort_order"
    )
    .eq("is_visible", true)
    .order("sort_order")
    .order("created_at");

  if (error) {
    console.error("WEBSHOP SERVICES LOAD ERROR:", error);
  }

  function normalizeServiceValue(value: unknown): string {
    return String(value ?? "")
      .trim()
      .toLocaleLowerCase("nl-BE")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function isRemovedFirstGradeWorkshop(service: Record<string, unknown>): boolean {
    const searchableText = normalizeServiceValue(
      [
        service.slug,
        service.title,
        service.subtitle,
        service.description,
        service.href,
        service.external_url,
        service.event_dates,
      ].join(" ")
    );

    return (
      searchableText.includes("naar het eerste leerjaar") ||
      searchableText.includes("klaar voor de sprong eerste leerjaar") ||
      searchableText.includes("klaar-voor-de-sprong-eerste-leerjaar") ||
      (searchableText.includes("klaar voor de sprong") &&
        searchableText.includes("eerste leerjaar")) ||
      (searchableText.includes("12, 13 & 14 augustus") &&
        searchableText.includes("180"))
    );
  }

  const services = [...(data ?? [])].filter(
    (service) => !isRemovedFirstGradeWorkshop(service)
  ) as Array<Record<string, unknown>>;

  const existingSlugs = new Set(
    services.map((service) => String(service.slug ?? "").trim())
  );

  // Gratis digitaal product: Studio SaGo Ontdekkingsbord.
  // Plaats de PDF in: public/downloads/studio-sago-ontdekkingsbord.pdf
  const ontdekkingsbordHref = "/downloads/studio-sago-ontdekkingsbord.pdf";

  services.push({
    id: "studio-sago-ontdekkingsbord-gratis",
    title: "Studio SaGo Ontdekkingsbord",
    subtitle: "Een gratis educatief spel om samen te ontdekken, leren en bewegen.",
    category: "Digitale producten",
    description:
      "Speelklaar bordspel met 65 gevarieerde taal-, reken-, denk- en bewegingsopdrachten. Download, print en speel meteen thuis of in de klas.",
    price: 0,
    button_text: "Gratis downloaden",
    href: ontdekkingsbordHref,
    slug: "studio-sago-ontdekkingsbord",
    external_url: null,
    event_dates: "Gratis PDF-download",
    image_url: "/images/studio-sago-ontdekkingsbord-cover.png",
    is_visible: true,
    sort_order: 1,
    download_count: 500,
  });

  for (const slug of ["tekstcorrectie", "teksten-nalezen-auteurs"]) {
    if (existingSlugs.has(slug)) continue;

    const builtIn = getBuiltInService(slug);
    if (!builtIn) continue;

    services.push({
      id: builtIn.id,
      title: builtIn.title,
      subtitle: builtIn.subtitle,
      category: builtIn.category,
      description: builtIn.description,
      price: builtIn.price,
      button_text: builtIn.button_text,
      href: builtIn.href,
      slug: builtIn.slug,
      external_url: builtIn.external_url,
      event_dates: builtIn.event_dates,
      image_url: builtIn.image_url,
      is_visible: builtIn.is_visible,
      sort_order: builtIn.sort_order,
    });
  }

  return (
    <PageShell>
      <WebshopCategories
        services={services as unknown as WebshopService[]}
      />
    </PageShell>
  );
}
