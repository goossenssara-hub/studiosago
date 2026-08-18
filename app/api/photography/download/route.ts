import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createR2PresignedUrl, r2IsConfigured } from "@/lib/fotografie/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "";
  const token = url.searchParams.get("token") || "";
  if (!slug || !token) return NextResponse.json({ error: "Ongeldige downloadlink." }, { status: 400 });
  if (!r2IsConfigured()) return NextResponse.json({ error: "De hoge-resolutiedownload is tijdelijk niet beschikbaar." }, { status: 503 });

  const supabase = getSupabaseAdmin();
  const { data: gallery, error } = await supabase
    .from("photo_galleries")
    .select("download_zip_key,download_zip_name,status")
    .eq("slug", slug)
    .eq("share_token", token)
    .eq("status", "active")
    .single();
  if (error || !gallery?.download_zip_key) return NextResponse.json({ error: "Voor deze galerij is geen hoge-resolutie ZIP beschikbaar." }, { status: 404 });

  const signedUrl = createR2PresignedUrl({
    method: "GET",
    key: gallery.download_zip_key,
    expiresSeconds: 60 * 15,
    responseDownloadName: gallery.download_zip_name || "SaGo-Photography.zip",
  });
  return NextResponse.redirect(signedUrl, 302);
}
