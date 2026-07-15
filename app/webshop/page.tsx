import PageShell from "@/components/PageShell";
import WebshopCategories, { type WebshopService } from "@/components/WebshopCategories";
import { createClient } from "@/lib/supabase/server";
export const dynamic="force-dynamic"; export const revalidate=0;
export default async function WebshopPage(){const supabase=await createClient();const {data,error}=await supabase.from("services").select("id,title,subtitle,category,description,price,button_text,href,slug,external_url,event_dates,image_url,is_visible,sort_order").eq("is_visible",true).order("sort_order").order("created_at");if(error)console.error(error);return <PageShell><WebshopCategories services={(data??[]) as unknown as WebshopService[]}/></PageShell>}
