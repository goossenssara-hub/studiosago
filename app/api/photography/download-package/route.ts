import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createR2PresignedUrl, r2IsConfigured } from "@/lib/fotografie/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ZIP_BYTES = 5 * 1024 * 1024 * 1024; // 5 GiB per rechtstreeks PUT-object

function safeName(value: string) {
  const base = value.replace(/\.zip$/i, "").normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "galerij";
  return `${base}.zip`;
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  if (!r2IsConfigured()) {
    return NextResponse.json({ error: "Cloudflare R2 is nog niet gekoppeld. Voeg eerst de R2-variabelen toe aan .env.local." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const action = String(body.action || "");
    const galleryId = String(body.galleryId || "");
    if (!galleryId) return NextResponse.json({ error: "Galerij-id ontbreekt." }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: gallery, error } = await supabase.from("photo_galleries").select("id,title,download_zip_key,download_zip_name").eq("id", galleryId).single();
    if (error || !gallery) return NextResponse.json({ error: "Galerij niet gevonden." }, { status: 404 });

    if (action === "prepare-upload") {
      const fileName = safeName(String(body.fileName || `${gallery.title}.zip`));
      const fileSize = Number(body.fileSize || 0);
      if (!fileSize || fileSize < 1) return NextResponse.json({ error: "ZIP-bestand is leeg." }, { status: 400 });
      if (fileSize > MAX_ZIP_BYTES) return NextResponse.json({ error: "Deze ZIP is groter dan 5 GB. Splits de download in twee ZIP-bestanden." }, { status: 413 });

      const objectKey = `galleries/${galleryId}/${Date.now()}-${randomUUID().slice(0, 8)}-${fileName}`;
      const uploadUrl = createR2PresignedUrl({ method: "PUT", key: objectKey, expiresSeconds: 60 * 60 });
      return NextResponse.json({ uploadUrl, objectKey, fileName, maxBytes: MAX_ZIP_BYTES });
    }

    if (action === "complete-upload") {
      const objectKey = String(body.objectKey || "");
      const fileName = safeName(String(body.fileName || `${gallery.title}.zip`));
      const fileSize = Number(body.fileSize || 0);
      if (!objectKey.startsWith(`galleries/${galleryId}/`)) return NextResponse.json({ error: "Ongeldige R2-sleutel." }, { status: 400 });
      if (!fileSize || fileSize > MAX_ZIP_BYTES) return NextResponse.json({ error: "Ongeldige ZIP-grootte." }, { status: 400 });

      const previousKey = gallery.download_zip_key as string | null;
      const { error: updateError } = await supabase.from("photo_galleries").update({
        download_zip_key: objectKey,
        download_zip_name: fileName,
        download_zip_size_bytes: fileSize,
        download_zip_updated_at: new Date().toISOString(),
        downloads: "all",
      }).eq("id", galleryId);
      if (updateError) throw updateError;

      if (previousKey && previousKey !== objectKey) {
        try {
          const deleteUrl = createR2PresignedUrl({ method: "DELETE", key: previousKey, expiresSeconds: 300 });
          await fetch(deleteUrl, { method: "DELETE" });
        } catch (cleanupError) {
          console.warn("Oude R2 ZIP kon niet automatisch verwijderd worden:", cleanupError);
        }
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "remove") {
      const previousKey = gallery.download_zip_key as string | null;
      if (previousKey) {
        const deleteUrl = createR2PresignedUrl({ method: "DELETE", key: previousKey, expiresSeconds: 300 });
        const response = await fetch(deleteUrl, { method: "DELETE" });
        if (!response.ok && response.status !== 404) throw new Error(`R2 verwijderen mislukte (${response.status}).`);
      }
      const { error: updateError } = await supabase.from("photo_galleries").update({
        download_zip_key: null,
        download_zip_name: null,
        download_zip_size_bytes: 0,
        download_zip_updated_at: null,
        downloads: "none",
      }).eq("id", galleryId);
      if (updateError) throw updateError;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
  } catch (error) {
    console.error("R2 download package error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "R2-actie mislukt." }, { status: 500 });
  }
}
