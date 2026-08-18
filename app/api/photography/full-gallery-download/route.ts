import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import {
  createR2PresignedUrl,
  listR2Objects,
  r2IsConfigured,
} from "@/lib/fotografie/r2";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fileNameFromKey(key: string) {
  return key.split("/").pop() || "volledige-galerij.zip";
}

export async function POST(request: Request) {
  try {
    if (!r2IsConfigured()) {
      return NextResponse.json(
        { error: "Cloudflare R2 is nog niet gekoppeld." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const slug = String(body.slug || "").trim();
    const token = String(body.token || "").trim();
    const preview = body.preview === true;

    if (!slug || !token) {
      return NextResponse.json(
        { error: "Ongeldige galerijlink." },
        { status: 400 },
      );
    }

    if (preview) {
      const auth = await requireAdmin();
      if (!auth.ok) return auth.response;
    }

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("photo_galleries")
      .select(
        "id,title,status,downloads,download_mode,download_zip_key,download_zip_name,download_zip_size_bytes",
      )
      .eq("slug", slug)
      .eq("share_token", token);

    if (!preview) {
      query = query.eq("status", "active");
    }

    const { data: gallery, error } = await query.maybeSingle();

    if (error) {
      console.error("Volledige ZIP: gallery query fout", error);
      throw error;
    }

    if (!gallery) {
      return NextResponse.json(
        { error: "Galerij niet gevonden." },
        { status: 404 },
      );
    }

    const downloadMode =
      gallery.downloads || gallery.download_mode || "individual";

    const allowAll =
      downloadMode === "all" ||
      downloadMode === "individual_and_all";

    if (!allowAll) {
      return NextResponse.json(
        { error: "Download van de volledige galerij is niet ingeschakeld." },
        { status: 403 },
      );
    }

    let zipKey =
      typeof gallery.download_zip_key === "string"
        ? gallery.download_zip_key.trim()
        : "";

    let zipName =
      typeof gallery.download_zip_name === "string"
        ? gallery.download_zip_name.trim()
        : "";

    let zipSize = Number(gallery.download_zip_size_bytes || 0);

    // Robuuste fallback:
    // wanneer de DB-kolom in deze runtime onverwacht leeg binnenkomt,
    // zoek rechtstreeks naar een bestaande ZIP in de vaste R2-downloadmap.
    if (!zipKey) {
      const prefix = `galleries/${gallery.id}/downloads/`;
      const objects = await listR2Objects(prefix);

      const zip = objects
        .filter((item) => /\.zip$/i.test(item.key))
        .sort((a, b) => {
          const aTime = a.lastModified
            ? new Date(a.lastModified).getTime()
            : 0;
          const bTime = b.lastModified
            ? new Date(b.lastModified).getTime()
            : 0;
          return bTime - aTime;
        })[0];

      if (zip) {
        zipKey = zip.key;
        zipName = fileNameFromKey(zip.key);
        zipSize = Number(zip.size || 0);

        // Herstel de DB-koppeling automatisch, zodat volgende downloads
        // niet opnieuw hoeven te zoeken.
        const { error: updateError } = await supabase
          .from("photo_galleries")
          .update({
            download_zip_key: zipKey,
            download_zip_name: zipName,
            download_zip_size_bytes: zipSize,
          })
          .eq("id", gallery.id);

        if (updateError) {
          console.error(
            "Volledige ZIP gevonden in R2 maar DB-koppeling kon niet worden hersteld:",
            updateError,
          );
        }
      }
    }

    if (!zipKey) {
      return NextResponse.json(
        {
          error:
            "Er werd geen volledige galerij-ZIP gevonden in Cloudflare R2.",
        },
        { status: 404 },
      );
    }

    const url = createR2PresignedUrl({
      method: "GET",
      key: zipKey,
      expiresSeconds: 60 * 30,
      responseDownloadName:
        zipName ||
        `${gallery.title || "SaGo-Photography"}-volledige-galerij.zip`,
    });

    return NextResponse.json({
      url,
      key: zipKey,
      name: zipName || fileNameFromKey(zipKey),
      sizeBytes: zipSize,
    });
  } catch (error) {
    console.error("Full gallery download error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De volledige galerij kon niet worden gedownload.",
      },
      { status: 500 },
    );
  }
}
