import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  return `${part()}-${part()}-${part()}-${part()}`;
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ codes: data });
}

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await request.json();

  const code = body.code?.trim().toUpperCase() || generateCode();

  const { data, error } = await supabaseAdmin
    .from("discount_codes")
    .insert({
      code,
      description: body.description || "",
      discount_type: body.discount_type || "fixed",
      discount_value: Number(body.discount_value || 20),
      product: body.product || "all",
      email: body.email || null,
      customer_name: body.customer_name || null,
      valid_until: body.valid_until || null,
      max_uses: body.max_uses ? Number(body.max_uses) : null,
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: data });
}