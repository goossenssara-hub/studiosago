import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import styles from "./public-gallery.module.css";
export const dynamic="force-dynamic";
export default async function GalleryPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{token?:string}>}){
 const {slug}=await params; const {token}=await searchParams; if(!token) notFound(); const supabase=getSupabaseAdmin();
 const {data:gallery}=await supabase.from("photo_galleries").select("*").eq("slug",slug).eq("share_token",token).eq("status","active").single(); if(!gallery) notFound();
 const {data:images}=await supabase.from("photo_gallery_images").select("*").eq("gallery_id",gallery.id).order("sort_order");
 const signed=await Promise.all((images??[]).map(async image=>{const {data}=await supabase.storage.from("photo-galleries").createSignedUrl(image.storage_path,3600);return {...image,url:data?.signedUrl};})); const cover=signed.find(i=>i.is_cover)?.url||signed[0]?.url;
 return <main className={styles.page} style={{"--accent":gallery.accent_color} as any}><section className={styles.hero} style={cover?{backgroundImage:`linear-gradient(rgba(13,29,43,.18),rgba(13,29,43,.62)),url(${cover})`}:undefined}><div><span>{gallery.shoot_date}</span><h1>{gallery.intro_title||gallery.title}</h1><p>{gallery.intro_text}</p><a href="#photos">Bekijk jullie foto's ↓</a></div></section><section id="photos" className={styles.content}><header><span>SaGo Photography</span><h2>{gallery.title}</h2><p>{gallery.client_name}{gallery.location?` · ${gallery.location}`:''}</p></header><div className={`${styles.grid} ${styles[gallery.gallery_style]}`}>{signed.map((image,index)=>image.url&&<figure key={image.id} data-index={index}><img src={image.url} alt={`${gallery.title} foto ${index+1}`}/></figure>)}</div><footer>Met zorg vastgelegd door SaGo Photography</footer></section></main>
}
