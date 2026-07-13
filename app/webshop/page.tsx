import PageShell from "@/components/PageShell";
import WebshopCategories, {
  type WebshopService,
} from "@/components/WebshopCategories";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Webshop | Studio SaGo",
  description:
    "Ontdek de begeleiding, overgangstrajecten en tekstdiensten van Studio SaGo.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WebshopPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select(`
      id,
      title,
      subtitle,
      category,
      description,
      price,
      button_text,
      href,
      event_dates,
      image_url,
      is_visible,
      sort_order
    `)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("WEBSHOP SERVICES LOAD ERROR:", error);
  }

  /*
   * De expliciete omzetting via unknown voorkomt de TypeScript-fout
   * GenericStringError[] wanneer Supabase de dynamische select-string
   * niet correct kan afleiden.
   */
  const services = (data ?? []) as unknown as WebshopService[];

  return (
    <PageShell>
      <WebshopCategories services={services} />
    </PageShell>
  );
}
