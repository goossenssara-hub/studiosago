import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("availability")
      .select("*")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("AVAILABILITY GET ERROR:", error);

      return NextResponse.json(
        { error: "Beschikbaarheden konden niet geladen worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ availability: data ?? [] });
  } catch (error) {
    console.error("AVAILABILITY GET SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij laden van beschikbaarheden." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
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
      console.error("AVAILABILITY POST ERROR:", error);

      return NextResponse.json(
        { error: "Beschikbaar moment kon niet toegevoegd worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AVAILABILITY POST SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij toevoegen van beschikbaarheid." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

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
      console.error("AVAILABILITY DELETE ERROR:", error);

      return NextResponse.json(
        { error: "Beschikbaar moment kon niet verwijderd worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AVAILABILITY DELETE SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij verwijderen van beschikbaarheid." },
      { status: 500 }
    );
  }
}