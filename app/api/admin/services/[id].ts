import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const allowedFields = new Set([
  "title",
  "subtitle",
  "category",
  "description",
  "price",
  "button_text",
  "href",
  "event_dates",
  "image_url",
  "is_visible",
  "sort_order",
]);

function sanitizePatch(body: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (!allowedFields.has(key)) continue;

    if (
      ["title", "category", "button_text", "href"].includes(key) &&
      typeof value === "string"
    ) {
      patch[key] = value.trim();
      continue;
    }

    if (
      ["subtitle", "description", "event_dates", "image_url"].includes(key)
    ) {
      patch[key] =
        typeof value === "string" && value.trim() ? value.trim() : null;
      continue;
    }

    if (key === "price") {
      patch[key] = Number(value);
      continue;
    }

    if (key === "sort_order") {
      patch[key] = Number.isFinite(Number(value)) ? Number(value) : 0;
      continue;
    }

    if (key === "is_visible") {
      patch[key] = Boolean(value);
    }
  }

  return patch;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const adminSession = await requireAdmin();
  if (!adminSession.ok) return adminSession.response;

  const { id } = await context.params;
  const rawBody = (await request.json()) as Record<string, unknown>;
  const patch = sanitizePatch(rawBody);

  if (!id) {
    return NextResponse.json(
      { error: "De dienst-id ontbreekt." },
      { status: 400 }
    );
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "Er werden geen geldige wijzigingen ontvangen." },
      { status: 400 }
    );
  }

  if (
    "price" in patch &&
    (!Number.isFinite(Number(patch.price)) || Number(patch.price) < 0)
  ) {
    return NextResponse.json(
      { error: "De prijs is ongeldig." },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("services")
      .update(patch)
      .eq("id", id)
      .select("*");

    if (error) {
      return NextResponse.json(
        { error: `Dienst aanpassen is mislukt: ${error.message}` },
        { status: 500 }
      );
    }

    const service = data?.[0];

    if (!service) {
      return NextResponse.json(
        {
          error:
            "De dienst werd niet gevonden. Vernieuw de pagina en probeer opnieuw.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ service });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De adminverbinding kon niet worden gemaakt.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const adminSession = await requireAdmin();
  if (!adminSession.ok) return adminSession.response;

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "De dienst-id ontbreekt." },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("services")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      return NextResponse.json(
        { error: `Dienst verwijderen is mislukt: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data?.length) {
      return NextResponse.json(
        {
          error:
            "De dienst werd niet gevonden of was al verwijderd. Vernieuw de pagina.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De adminverbinding kon niet worden gemaakt.",
      },
      { status: 500 }
    );
  }
}
