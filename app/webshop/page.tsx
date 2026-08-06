import PageShell from "@/components/PageShell";
import WebshopCategories, {
  type WebshopService,
} from "@/components/WebshopCategories";
import { createClient } from "@/lib/supabase/server";
import { getBuiltInService } from "@/lib/webshopService";

// De webshop mag kort gecachet worden. Zo wordt de services-tabel niet bij elke
// paginabezoeker opnieuw uit Supabase opgehaald.
export const revalidate = 300;

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

  function isLegacyTextCorrectionService(service: Record<string, unknown>): boolean {
    const slug = normalizeServiceValue(service.slug);
    const title = normalizeServiceValue(service.title);

    return (
      slug === "tekstcorrectie" ||
      slug === "teksten-nalezen" ||
      slug === "teksten-nalezen-auteurs" ||
      title === "tekstcorrectie" ||
      title === "teksten nalezen" ||
      title === "teksten nalezen voor auteurs"
    );
  }

  const services = [...(data ?? [])].filter(
    (service) =>
      !isRemovedFirstGradeWorkshop(service) &&
      !isLegacyTextCorrectionService(service)
  ) as Array<Record<string, unknown>>;


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
    download_count: 0,
  });

  // Gratis digitaal product: Memoryspel bij het Studio SaGo Ontdekkingsbord.
  // Plaats de PDF in: public/downloads/studio-sago-memoryspel-ontdekkingsbord.pdf
  // Plaats de cover in: public/images/studio-sago-memoryspel-cover.png
  const memoryspelHref =
    "/downloads/studio-sago-memoryspel-ontdekkingsbord.pdf";

  services.push({
    id: "studio-sago-memoryspel-ontdekkingsbord-gratis",
    title: "Memoryspel bij het Ontdekkingsbord",
    subtitle:
      "Een gratis memoryspel dat aansluit bij het Studio SaGo Ontdekkingsbord.",
    category: "Digitale producten",
    description:
      "Download en print het memoryspel dat bij het Ontdekkingsbord hoort. Kinderen oefenen spelenderwijs hun waarneming, geheugen, woordenschat en concentratie.",
    price: 0,
    button_text: "Gratis downloaden",
    href: memoryspelHref,
    slug: "studio-sago-memoryspel-ontdekkingsbord",
    external_url: null,
    event_dates: "Gratis PDF-download",
    image_url: "/images/studio-sago-memoryspel-cover.png",
    is_visible: true,
    sort_order: 2,
    download_count: 0,
  });

  const textCorrection = getBuiltInService("tekstcorrectie");

  if (textCorrection) {
    services.push({
      id: textCorrection.id,
      title: textCorrection.title,
      subtitle: textCorrection.subtitle,
      category: textCorrection.category,
      description: textCorrection.description,
      price: textCorrection.price,
      button_text: textCorrection.button_text,
      href: textCorrection.href,
      slug: textCorrection.slug,
      external_url: textCorrection.external_url,
      event_dates: textCorrection.event_dates,
      image_url: textCorrection.image_url,
      is_visible: textCorrection.is_visible,
      sort_order: textCorrection.sort_order,
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
