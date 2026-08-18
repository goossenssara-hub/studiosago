import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createR2PresignedUrl, r2IsConfigured } from "@/lib/fotografie/r2";
export const runtime="nodejs"; export const dynamic="force-dynamic";
const MAX=250*1024*1024;
const stem=(v:string)=>v.toLowerCase().replace(/\.jpe?g$/i,"").replace(/[^a-z0-9]+/g,"");
export async function POST(request:Request){
 const auth=await requireAdmin(); if(!auth.ok)return auth.response;
 if(!r2IsConfigured())return NextResponse.json({error:"Cloudflare R2 is nog niet gekoppeld."},{status:503});
 try{
  const b=await request.json(), action=String(b.action||""), galleryId=String(b.galleryId||"");
  const supabase=getSupabaseAdmin(); if(!galleryId)return NextResponse.json({error:"Galerij-id ontbreekt."},{status:400});
  if(action==="prepare-upload"){
   const fileName=String(b.fileName||""), fileSize=Number(b.fileSize||0), requestedImageId=String(b.imageId||"");
   if(!fileSize||fileSize>MAX)return NextResponse.json({error:"Ongeldige bestandsgrootte (max. 250 MB per foto)."},{status:413});
   let image:{id:string;file_name:string|null;r2_original_key:string|null}|null=null;
   if(requestedImageId){
    const exact=await supabase.from("photo_gallery_images").select("id,file_name,r2_original_key").eq("gallery_id",galleryId).eq("id",requestedImageId).single();
    if(exact.error)throw exact.error; image=exact.data;
   }else{
    const {data,error}=await supabase.from("photo_gallery_images").select("id,file_name,r2_original_key").eq("gallery_id",galleryId);
    if(error)throw error; image=(data??[]).find(i=>stem(i.file_name||"")===stem(fileName))??null;
   }
   if(!image)return NextResponse.json({error:`Geen webfoto gevonden voor ${fileName}.`},{status:404});
   const safe=fileName.replace(/[^a-zA-Z0-9._-]/g,"-");
   const key=`galleries/${galleryId}/originals/${image.id}-${randomUUID().slice(0,8)}-${safe}`;
   return NextResponse.json({imageId:image.id,objectKey:key,uploadUrl:createR2PresignedUrl({method:"PUT",key,expiresSeconds:3600})});
  }
  if(action==="complete-upload"){
   const imageId=String(b.imageId||""), key=String(b.objectKey||""), fileName=String(b.fileName||""), fileSize=Number(b.fileSize||0);
   if(!key.startsWith(`galleries/${galleryId}/originals/`))return NextResponse.json({error:"Ongeldige R2-sleutel."},{status:400});
   const {data:current}=await supabase.from("photo_gallery_images").select("r2_original_key").eq("id",imageId).eq("gallery_id",galleryId).single();
   const {error}=await supabase.from("photo_gallery_images").update({r2_original_key:key,r2_original_name:fileName,r2_original_size_bytes:fileSize,r2_original_updated_at:new Date().toISOString()}).eq("id",imageId).eq("gallery_id",galleryId);
   if(error)throw error;
   if(current?.r2_original_key&&current.r2_original_key!==key){try{await fetch(createR2PresignedUrl({method:"DELETE",key:current.r2_original_key,expiresSeconds:300}),{method:"DELETE"});}catch{}}
   return NextResponse.json({ok:true});
  }
  return NextResponse.json({error:"Onbekende actie."},{status:400});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Upload mislukt."},{status:500});}
}