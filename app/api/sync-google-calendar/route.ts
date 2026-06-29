import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const syncSecret = process.env.GOOGLE_CALENDAR_SYNC_SECRET!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${syncSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const { error } = await supabaseAdmin.from("bookings").upsert(
    {
      google_event_id,
      title,
      start_time,
      end_time,
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

  return NextResponse.json({ success: true });
}