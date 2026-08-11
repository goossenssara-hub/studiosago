import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadLanguage = "nl" | "en";
type LeadRow = {
  product_id: string;
  email: string;
  marketing_consent: boolean;
  first_at: string;
  last_at: string;
  interaction_count: number;
  source: "preview" | "download" | "leerplatform";
  language: LeadLanguage;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase-configuratie ontbreekt.");
  return { url: url.replace(/\/$/, ""), serviceKey };
}

async function loadRows(table: string, select: string, orderColumn: string) {
  const { url, serviceKey } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=${encodeURIComponent(orderColumn)}.desc.nullslast`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, cache: "no-store" }
  );
  if (!response.ok) throw new Error(`${table} kon niet geladen worden: ${await response.text()}`);
  return await response.json() as Record<string, unknown>[];
}

function productLanguage(productId: string): LeadLanguage {
  const normalized = productId.trim().toLowerCase();
  return normalized.includes("-en-") || normalized.endsWith("-en") ? "en" : "nl";
}

export async function GET(request: NextRequest) {
  try {
    const requestedLanguage = request.nextUrl.searchParams.get("language");
    const language: LeadLanguage = requestedLanguage === "en" ? "en" : "nl";

    const [previews, downloads, pioneers] = await Promise.all([
      loadRows("digital_product_preview_leads", "product_id,email,marketing_consent,first_previewed_at,last_previewed_at,preview_count", "last_previewed_at"),
      loadRows("digital_product_leads", "product_id,email,marketing_consent,first_downloaded_at,last_downloaded_at,download_count", "last_downloaded_at"),
      loadRows("learning_platform_pioneers", "email,updates_consent,created_at,updated_at", "updated_at"),
    ]);

    const rows: LeadRow[] = [
      ...previews.map((row) => {
        const productId = String(row.product_id ?? "");
        return {
          product_id: productId,
          email: String(row.email ?? ""),
          marketing_consent: row.marketing_consent === true,
          first_at: String(row.first_previewed_at ?? ""),
          last_at: String(row.last_previewed_at ?? ""),
          interaction_count: Number(row.preview_count ?? 0),
          source: "preview" as const,
          language: productLanguage(productId),
        };
      }),
      ...downloads.map((row) => {
        const productId = String(row.product_id ?? "");
        return {
          product_id: productId,
          email: String(row.email ?? ""),
          marketing_consent: row.marketing_consent === true,
          first_at: String(row.first_downloaded_at ?? ""),
          last_at: String(row.last_downloaded_at ?? ""),
          interaction_count: Number(row.download_count ?? 0),
          source: "download" as const,
          language: productLanguage(productId),
        };
      }),
      ...pioneers.map((row) => ({
        product_id: "leerplatform-pionier",
        email: String(row.email ?? ""),
        marketing_consent: row.updates_consent === true,
        first_at: String(row.created_at ?? ""),
        last_at: String(row.updated_at ?? row.created_at ?? ""),
        interaction_count: 1,
        source: "leerplatform" as const,
        language: "nl" as const,
      })),
    ].filter((row) => row.language === language);

    const merged = new Map<string, {
      email: string;
      productIds: Set<string>;
      sources: Set<string>;
      marketingConsent: boolean;
      firstAt: string;
      lastAt: string;
      interactionCount: number;
      language: LeadLanguage;
    }>();

    for (const row of rows) {
      const email = row.email.trim().toLowerCase();
      if (!email) continue;
      // Language is deliberately part of the key. Consent in one language never
      // grants newsletter permission for the other language list.
      const key = `${row.language}:${email}`;
      const current = merged.get(key);
      if (!current) {
        merged.set(key, {
          email,
          productIds: new Set(row.product_id ? [row.product_id] : []),
          sources: new Set([row.source]),
          marketingConsent: row.marketing_consent,
          firstAt: row.first_at,
          lastAt: row.last_at,
          interactionCount: row.interaction_count,
          language: row.language,
        });
      } else {
        if (row.product_id) current.productIds.add(row.product_id);
        current.sources.add(row.source);
        current.marketingConsent = current.marketingConsent || row.marketing_consent;
        if (row.first_at && (!current.firstAt || row.first_at < current.firstAt)) current.firstAt = row.first_at;
        if (row.last_at && (!current.lastAt || row.last_at > current.lastAt)) current.lastAt = row.last_at;
        current.interactionCount += row.interaction_count;
      }
    }

    const leads = Array.from(merged.values())
      .map((lead) => ({
        email: lead.email,
        productIds: Array.from(lead.productIds),
        sources: Array.from(lead.sources),
        marketingConsent: lead.marketingConsent,
        firstAt: lead.firstAt,
        lastAt: lead.lastAt,
        interactionCount: lead.interactionCount,
        language: lead.language,
      }))
      .sort((a, b) => b.lastAt.localeCompare(a.lastAt));

    return NextResponse.json({
      language,
      leads,
      totals: {
        all: leads.length,
        newsletter: leads.filter((lead) => lead.marketingConsent).length,
        withoutConsent: leads.filter((lead) => !lead.marketingConsent).length,
      },
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("NEWSLETTER LEADS ERROR:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "E-mailadressen konden niet geladen worden." }, { status: 500 });
  }
}
