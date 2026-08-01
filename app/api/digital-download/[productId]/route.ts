import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt."
    );
  }

  return { url: url.replace(/\/$/, ""), serviceKey };
}

function headers(serviceKey: string) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
}

async function readCount(productId: string): Promise<number> {
  const { url, serviceKey } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/digital_product_downloads?product_id=eq.${encodeURIComponent(productId)}&select=download_count&limit=1`,
    { headers: headers(serviceKey), cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Downloadteller lezen mislukt (${response.status}).`);
  }

  const rows = (await response.json()) as Array<{ download_count?: number }>;
  return Number(rows[0]?.download_count ?? 0);
}

async function incrementCount(productId: string): Promise<number> {
  const { url, serviceKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/rpc/increment_digital_product_download`, {
    method: "POST",
    headers: headers(serviceKey),
    body: JSON.stringify({ p_product_id: productId }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Downloadteller verhogen mislukt (${response.status}).`);
  }

  return Number(await response.json());
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;

    if (!productId) {
      return NextResponse.json({ error: "Product-ID ontbreekt." }, { status: 400 });
    }

    if (request.nextUrl.searchParams.get("count") === "1") {
      const count = await readCount(productId);
      return NextResponse.json(
        { count },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const file = request.nextUrl.searchParams.get("file") ?? "";
    if (!file.startsWith("/downloads/") || !file.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Ongeldig downloadbestand." },
        { status: 400 }
      );
    }

    await incrementCount(productId);
    return NextResponse.redirect(new URL(file, request.url), 307);
  } catch (error) {
    console.error("Digitale downloadfout:", error);
    return NextResponse.json(
      { error: "De download kon niet worden geregistreerd." },
      { status: 500 }
    );
  }
}
