import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase env variables ontbreken." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId ontbreekt." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
      })
      .eq("id", bookingId)
      .select("id,status");

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Geen afspraak gevonden." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: data[0],
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return NextResponse.json(
      { error: "Serverfout bij annuleren." },
      { status: 500 }
    );
  }
}