import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const serviceType = searchParams.get("serviceType");

    if (!date) {
      return NextResponse.json({ slots: [] });
    }

    let query = supabaseAdmin
      .from("availability")
      .select(
        "id, date, start_time, end_time, max_places, booked_places, active, service_type"
      )
      .eq("date", date)
      .eq("active", true)
      .order("start_time", { ascending: true });

    if (serviceType) {
      query = query.eq("service_type", serviceType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("AVAILABILITY PUBLIC GET ERROR:", error);

      return NextResponse.json(
        { error: "Beschikbare momenten konden niet geladen worden." },
        { status: 500 }
      );
    }

    const slots =
      data
        ?.filter((slot) => {
          const maxPlaces = slot.max_places ?? 1;
          const bookedPlaces = slot.booked_places ?? 0;

          return bookedPlaces < maxPlaces;
        })
        .map((slot) => String(slot.start_time).slice(0, 5)) ?? [];

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("AVAILABILITY PUBLIC SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Beschikbare momenten konden niet geladen worden." },
      { status: 500 }
    );
  }
}