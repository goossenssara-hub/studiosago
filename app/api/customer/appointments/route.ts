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
          success: false,
          error: "Je bent niet aangemeld.",
        },
        {
          status: 401,
        },
      );
    }

    const email = normalizeEmail(user.email);
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(
        `
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
          google_meet_url,
          customer_archived_at
        `,
      )
      .ilike("customer_email", email)

      /*
       * Belangrijk:
       * afspraken die na feedback werden gearchiveerd,
       * mogen niet meer in het dashboard verschijnen.
       */
      .is("customer_archived_at", null)

      .neq("status", "cancelled")
      .not("appointment_date", "is", null)
      .not("appointment_time", "is", null)
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
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error: "De afspraken konden niet geladen worden.",
          details: error.message,
        },
        {
          status: 500,
        },
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
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error(
      "CUSTOMER APPOINTMENTS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "De afspraken konden niet geladen worden.",
      },
      {
        status: 500,
      },
    );
  }
}