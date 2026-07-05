import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ slots: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("availability")
      .select("id, date, start_time, end_time, max_places, booked_places, active")
      .eq("date", date)
      .eq("active", true)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Availability error:", error);
      return NextResponse.json(
        { error: "Beschikbare momenten konden niet geladen worden." },
        { status: 500 }
      );
    }

    const availableSlots =
      data
        ?.filter((slot) => {
          const maxPlaces = slot.max_places ?? 1;
          const bookedPlaces = slot.booked_places ?? 0;

          return bookedPlaces < maxPlaces;
        })
        .map((slot) => String(slot.start_time).slice(0, 5)) ?? [];

    return NextResponse.json({
      slots: availableSlots,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Beschikbare momenten konden niet geladen worden." },
      { status: 500 }
    );
  }
}