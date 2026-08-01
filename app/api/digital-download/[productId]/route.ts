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

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isAllowedDownloadFile(value: string): boolean {
  return (
    value.startsWith("/downloads/") &&
    value.toLowerCase().endsWith(".pdf") &&
    !value.includes("..")
  );
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

async function registerDownload(input: {
  productId: string;
  email: string;
  marketingConsent: boolean;
}): Promise<number> {
  const { url, serviceKey } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/rpc/register_digital_product_download`,
    {
      method: "POST",
      headers: headers(serviceKey),
      body: JSON.stringify({
        p_product_id: input.productId,
        p_email: input.email,
        p_marketing_consent: input.marketingConsent,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error("Supabase downloadregistratie:", detail);
    throw new Error(`Download registreren mislukt (${response.status}).`);
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

    if (request.nextUrl.searchParams.get("count") !== "1") {
      return NextResponse.json(
        { error: "Voor downloaden is een e-mailadres vereist." },
        { status: 405, headers: { Allow: "POST" } }
      );
    }

    const count = await readCount(productId);
    return NextResponse.json(
      { count },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Downloadtellerfout:", error);
    return NextResponse.json(
      { error: "De downloadteller kon niet worden geladen." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;
    const body = (await request.json()) as {
      email?: unknown;
      file?: unknown;
      marketingConsent?: unknown;
    };

    const email = String(body.email ?? "").trim().toLowerCase();
    const file = String(body.file ?? "").trim();
    const marketingConsent = body.marketingConsent === true;

    if (!productId) {
      return NextResponse.json({ error: "Product-ID ontbreekt." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Vul een geldig e-mailadres in." },
        { status: 400 }
      );
    }

    if (!isAllowedDownloadFile(file)) {
      return NextResponse.json(
        { error: "Ongeldig downloadbestand." },
        { status: 400 }
      );
    }

    const count = await registerDownload({
      productId,
      email,
      marketingConsent,
    });

    return NextResponse.json(
      { count, downloadUrl: file },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Digitale downloadfout:", error);
    return NextResponse.json(
      { error: "De download kon niet worden geregistreerd." },
      { status: 500 }
    );
  }
}
