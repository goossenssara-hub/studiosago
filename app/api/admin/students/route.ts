import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Leerlingen konden niet geladen worden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ students: data ?? [] });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Geen leerling-id ontvangen." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("students")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Leerling kon niet verwijderd worden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}