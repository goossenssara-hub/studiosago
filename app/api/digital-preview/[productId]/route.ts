import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase-configuratie ontbreekt.");
  }

  return { url: url.replace(/\/$/, ""), serviceKey };
}

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;
    const body = (await request.json()) as {
      email?: unknown;
      marketingConsent?: unknown;
    };

    const email = String(body.email ?? "").trim().toLowerCase();
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

    const { url, serviceKey } = getSupabaseConfig();
    const response = await fetch(
      `${url}/rest/v1/rpc/register_digital_product_preview`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        body: JSON.stringify({
          p_product_id: productId,
          p_email: email,
          p_marketing_consent: marketingConsent,
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Supabase previewregistratie:", await response.text());
      throw new Error(`Previewregistratie mislukt (${response.status}).`);
    }

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Digitale previewfout:", error);
    return NextResponse.json(
      { error: "Het voorbeeld kon niet worden geopend. Probeer opnieuw." },
      { status: 500 }
    );
  }
}
