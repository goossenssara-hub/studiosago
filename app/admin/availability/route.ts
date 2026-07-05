import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("availability")
    .select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Beschikbaarheden konden niet geladen worden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ availability: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();

  const date = String(body.date || "");
  const startTime = String(body.startTime || "");
  const endTime = String(body.endTime || "");
const maxPlaces = Math.max(1, Number(body.maxPlaces || 1));
  if (!date || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Vul datum, startuur en einduur in." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("availability").insert({
    date,
    start_time: startTime,
    end_time: endTime,
    max_places: maxPlaces,
    booked_places: 0,
    active: true,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Beschikbaar moment kon niet toegevoegd worden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Geen id ontvangen." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("availability")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Beschikbaar moment kon niet verwijderd worden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}