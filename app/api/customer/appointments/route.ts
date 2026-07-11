import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json(
        {
          error: "Je bent niet aangemeld.",
        },
        {
          status: 401,
        }
      );
    }

    const email = normalizeEmail(user.email);
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        title,
        customer_name,
        customer_email,
        start_time,
        end_time,
        appointment_date,
        appointment_time,
        appointment_type,
        customer_address,
        location,
        notes,
        status,
        google_event_id,
        google_event_url,
        google_event_link,
        google_meet_url
      `)
      .ilike("customer_email", email)
      .neq("status", "cancelled")
      .order("appointment_date", {
        ascending: true,
        nullsFirst: false,
      })
      .order("appointment_time", {
        ascending: true,
        nullsFirst: false,
      });

    if (error) {
      console.error(
        "CUSTOMER APPOINTMENTS DATABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "De afspraken konden niet geladen worden.",
          details: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        bookings: data ?? [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "CUSTOMER APPOINTMENTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De afspraken konden niet geladen worden.",
      },
      {
        status: 500,
      }
    );
  }
}