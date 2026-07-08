import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { id } = await request.json();
  const supabaseAdmin = getSupabaseAdmin();

  if (!id) {
    return NextResponse.json(
      { error: "Geen beurtenkaart ontvangen." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("passes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}