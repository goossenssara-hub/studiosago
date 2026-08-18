import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createR2PresignedUrl,r2IsConfigured } from "@/lib/fotografie/r2";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(request:Request){
 const u=new URL(request.url),slug=u.searchParams.get("slug")||"",token=u.searchParams.get("token")||"",imageId=u.searchParams.get("imageId")||"";
 if(!slug||!token||!imageId)return NextResponse.json({error:"Ongeldige download."},{status:400});
 if(!r2IsConfigured())return NextResponse.json({error:"Download tijdelijk niet beschikbaar."},{status:503});
 const s=getSupabaseAdmin(); const {data:g}=await s.from("photo_galleries").select("id,downloads").eq("slug",slug).eq("share_token",token).eq("status","active").single();
 if(!g||g.downloads==="none"||g.downloads==="disabled")return NextResponse.json({error:"Downloads zijn uitgeschakeld."},{status:403});
 const {data:i}=await s.from("photo_gallery_images").select("r2_original_key,r2_original_name").eq("id",imageId).eq("gallery_id",g.id).single();
 if(!i?.r2_original_key)return NextResponse.json({error:"Voor deze foto is nog geen hoge-resolutiebestand gekoppeld."},{status:404});
 return NextResponse.redirect(createR2PresignedUrl({method:"GET",key:i.r2_original_key,expiresSeconds:900,responseDownloadName:i.r2_original_name||"SaGo-Photography.jpg"}),302);
}