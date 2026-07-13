import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function normalizeServiceBody(body: Record<string, unknown>) {
  return {
    title: String(body.title ?? "").trim(),
    subtitle: body.subtitle ? String(body.subtitle).trim() : null,
    category: String(body.category ?? "Begeleiding").trim() || "Begeleiding",
    description: body.description ? String(body.description).trim() : null,
    price: Number(body.price ?? 0),
    button_text: String(body.button_text ?? "Bekijk").trim() || "Bekijk",
    href: String(body.href ?? "").trim(),
    event_dates: body.event_dates ? String(body.event_dates).trim() : null,
    image_url: body.image_url ? String(body.image_url).trim() : null,
    is_visible: body.is_visible !== false,
    sort_order: Number.isFinite(Number(body.sort_order))
      ? Number(body.sort_order)
      : 0,
  };
}

export async function GET() {
  const adminSession = await requireAdmin();
  if (!adminSession.ok) return adminSession.response;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Diensten laden is mislukt: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ services: data ?? [] });
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

export async function POST(request: NextRequest) {
  const adminSession = await requireAdmin();
  if (!adminSession.ok) return adminSession.response;

  const rawBody = (await request.json()) as Record<string, unknown>;
  const body = normalizeServiceBody(rawBody);

  if (!body.title) {
    return NextResponse.json(
      { error: "Een titel is verplicht." },
      { status: 400 }
    );
  }

  if (!body.href) {
    return NextResponse.json(
      { error: "Een link is verplicht." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(body.price) || body.price < 0) {
    return NextResponse.json(
      { error: "De prijs is ongeldig." },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("services")
      .insert(body)
      .select("*");

    if (error) {
      return NextResponse.json(
        { error: `Dienst toevoegen is mislukt: ${error.message}` },
        { status: 500 }
      );
    }

    const service = data?.[0];

    if (!service) {
      return NextResponse.json(
        { error: "De dienst werd niet opgeslagen." },
        { status: 500 }
      );
    }

    return NextResponse.json({ service }, { status: 201 });
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
