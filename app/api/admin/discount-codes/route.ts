import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DiscountType = "fixed" | "percentage";

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function nullableText(value: unknown): string | null {
  const result = clean(value);
  return result || null;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || clean(value) === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  return `${part()}-${part()}-${part()}-${part()}`;
}

function validateDiscount(type: DiscountType, value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "Vul een geldige kortingswaarde in.";
  }

  if (type === "percentage" && value > 100) {
    return "Een procentuele korting kan maximaal 100% zijn.";
  }

  return null;
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ codes: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kortingscodes konden niet geladen worden." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const discountType = (clean(body.discount_type) || "fixed") as DiscountType;
    const discountValue = Number(body.discount_value ?? 20);
    const validationError = validateDiscount(discountType, discountValue);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const code = clean(body.code).toUpperCase() || generateCode();
    const maxUses = nullableNumber(body.max_uses);

    if (maxUses !== null && maxUses < 1) {
      return NextResponse.json({ error: "Maximaal gebruik moet minstens 1 zijn." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .insert({
        code,
        description: nullableText(body.description),
        discount_type: discountType,
        discount_value: discountValue,
        product: clean(body.product) || "all",
        email: nullableText(body.email)?.toLowerCase() ?? null,
        customer_name: nullableText(body.customer_name),
        valid_until: nullableText(body.valid_until),
        max_uses: maxUses,
        used_count: 0,
        active: body.active === false ? false : true,
      })
      .select()
      .single();

    if (error) {
      const status = error.code === "23505" ? 409 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ code: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kortingscode kon niet aangemaakt worden." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const id = clean(body.id);

    if (!id) {
      return NextResponse.json({ error: "Geen kortingscode-id ontvangen." }, { status: 400 });
    }

    const discountType = (clean(body.discount_type) || "fixed") as DiscountType;
    const discountValue = Number(body.discount_value);
    const validationError = validateDiscount(discountType, discountValue);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const maxUses = nullableNumber(body.max_uses);
    const usedCount = Math.max(0, Number(body.used_count ?? 0));

    if (maxUses !== null && maxUses < usedCount) {
      return NextResponse.json(
        { error: `Het maximum kan niet lager zijn dan het huidige gebruik (${usedCount}).` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .update({
        code: clean(body.code).toUpperCase(),
        description: nullableText(body.description),
        discount_type: discountType,
        discount_value: discountValue,
        product: clean(body.product) || "all",
        email: nullableText(body.email)?.toLowerCase() ?? null,
        customer_name: nullableText(body.customer_name),
        valid_until: nullableText(body.valid_until),
        max_uses: maxUses,
        active: Boolean(body.active),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      const status = error.code === "23505" ? 409 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    if (!data) {
      return NextResponse.json({ error: "Kortingscode niet gevonden." }, { status: 404 });
    }

    return NextResponse.json({ code: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kortingscode kon niet aangepast worden." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = clean(request.nextUrl.searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "Geen kortingscode-id ontvangen." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Kortingscode niet gevonden." }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kortingscode kon niet verwijderd worden." },
      { status: 500 }
    );
  }
}
