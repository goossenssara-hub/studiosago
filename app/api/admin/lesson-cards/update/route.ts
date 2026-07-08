import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const supabaseAdmin = getSupabaseAdmin();

  if (!body.id) {
    return NextResponse.json(
      { error: "Geen beurtenkaart ontvangen." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("passes")
    .update({
      title: body.title || null,
      product: body.product || null,
      total_credits: body.total_credits ?? body.total_sessions ?? 0,
      remaining_credits:
        body.remaining_credits ?? body.remaining_sessions ?? 0,
      total_sessions: body.total_sessions ?? body.total_credits ?? 0,
      remaining_sessions:
        body.remaining_sessions ?? body.remaining_credits ?? 0,
      status: body.status || "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}