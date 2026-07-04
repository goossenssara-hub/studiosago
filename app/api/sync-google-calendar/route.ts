import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const syncSecret = process.env.GOOGLE_CALENDAR_SYNC_SECRET;

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey || !syncSecret) {
      return NextResponse.json(
        { error: "Supabase of Google sync env variables ontbreken." },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${syncSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await request.json();

    const {
      google_event_id,
      title,
      start_time,
      end_time,
      customer_email,
      customer_name,
      location,
      notes,
      status,
    } = body;

    if (!google_event_id || !start_time) {
      return NextResponse.json(
        { error: "google_event_id en start_time zijn verplicht." },
        { status: 400 }
      );
    }

    const startDate = new Date(start_time);

    const appointmentDate = startDate.toLocaleDateString("sv-SE", {
      timeZone: "Europe/Brussels",
    });

    const appointmentTime = startDate.toLocaleTimeString("nl-BE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Brussels",
    });

    const { error } = await supabaseAdmin.from("bookings").upsert(
      {
        google_event_id,
        title: title || "Afspraak Studio SaGo",
        start_time,
        end_time,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        customer_email,
        customer_name,
        location,
        notes,
        status: status ?? "confirmed",
        payment_status: "unpaid",
        confirmed_at: new Date().toISOString(),
      },
      {
        onConflict: "google_event_id",
      }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
    });
  } catch (error) {
    console.error("Google Calendar sync error:", error);

    return NextResponse.json(
      { error: "Synchronisatie mislukt." },
      { status: 500 }
    );
  }
}