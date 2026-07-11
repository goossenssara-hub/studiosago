import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookingRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  appointment_type: string | null;
  customer_address: string | null;
  location: string | null;
  notes: string | null;
  google_event_id: string | null;
};

function clean(
  value: unknown
): string {
  return String(value ?? "").trim();
}

function normalizeEmail(
  value: unknown
): string {
  return clean(value).toLowerCase();
}

export async function POST(
  request: Request
): Promise<NextResponse> {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user?.email
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Je bent niet aangemeld.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const bookingIds =
      Array.isArray(
        body.bookingIds
      )
        ? body.bookingIds
            .map(clean)
            .filter(Boolean)
        : [];

    if (
      bookingIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Er werden geen afspraken geselecteerd.",
        },
        {
          status: 400,
        }
      );
    }

    const scriptUrl = clean(
      process.env
        .GOOGLE_APPS_SCRIPT_AVAILABILITY_URL
    );

    if (!scriptUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "De Google Apps Script-URL ontbreekt.",
        },
        {
          status: 500,
        }
      );
    }

    const bookingSecret =
      clean(
        process.env
          .GOOGLE_APPS_SCRIPT_BOOKING_SECRET
      );

    const email =
      normalizeEmail(
        user.email
      );

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        customer_name,
        customer_email,
        appointment_date,
        appointment_time,
        appointment_type,
        customer_address,
        location,
        notes,
        google_event_id
      `)
      .in("id", bookingIds)
      .ilike(
        "customer_email",
        email
      );

    if (error) {
      console.error(
        "BACKFILL READ ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "De bestaande afspraken konden niet geladen worden.",
          details:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    const bookings =
      (data as
        | BookingRow[]
        | null) ?? [];

    const results = [];

    for (
      const booking of bookings
    ) {
      if (
        booking.google_event_id
      ) {
        results.push({
          bookingId:
            booking.id,
          success: true,
          skipped: true,
          message:
            "Deze afspraak was al gekoppeld.",
        });

        continue;
      }

      if (
        !booking.customer_name ||
        !booking.customer_email ||
        !booking.appointment_date ||
        !booking.appointment_time ||
        !booking.appointment_type
      ) {
        results.push({
          bookingId:
            booking.id,
          success: false,
          error:
            "De afspraak bevat onvoldoende gegevens.",
        });

        continue;
      }

      try {
        const googleResponse =
          await fetch(
            scriptUrl,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              cache:
                "no-store",

              redirect:
                "follow",

              body:
                JSON.stringify({
                  action:
                    "backfillBooking",

                  secret:
                    bookingSecret,

                  bookingId:
                    booking.id,

                  date:
                    booking.appointment_date,

                  time:
                    booking.appointment_time,

                  email:
                    booking.customer_email,

                  customerName:
                    booking.customer_name,

                  appointmentType:
                    booking.appointment_type,

                  customerAddress:
                    booking.customer_address ||
                    (
                      booking.appointment_type ===
                      "home"
                        ? booking.location ||
                          ""
                        : ""
                    ),

                  notes:
                    booking.notes ||
                    "",
                }),
            }
          );

        const responseText =
          await googleResponse.text();

        let googleData:
          Record<
            string,
            unknown
          > = {};

        try {
          googleData =
            JSON.parse(
              responseText
            );
        } catch {
          throw new Error(
            "Google Agenda gaf geen geldig antwoord terug."
          );
        }

        if (
          !googleResponse.ok ||
          googleData.success ===
            false
        ) {
          throw new Error(
            clean(
              googleData.error
            ) ||
              "Google Agenda kon de afspraak niet aanmaken."
          );
        }

        const googleEventId =
          clean(
            googleData.eventId
          ) || null;

        const googleEventUrl =
          clean(
            googleData.htmlLink
          ) || null;

        const googleMeetUrl =
          clean(
            googleData.meetLink
          ) || null;

        const {
          error:
            updateError,
        } = await supabaseAdmin
          .from("bookings")
          .update({
            google_event_id:
              googleEventId,

            google_event_url:
              googleEventUrl,

            google_event_link:
              googleMeetUrl ||
              googleEventUrl,

            google_meet_url:
              googleMeetUrl,

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            "id",
            booking.id
          );

        if (updateError) {
          throw new Error(
            updateError.message
          );
        }

        results.push({
          bookingId:
            booking.id,

          success: true,

          googleEventId,
          googleEventUrl,
          googleMeetUrl,
        });
      } catch (
        backfillError
      ) {
        console.error(
          "BACKFILL BOOKING ERROR:",
          booking.id,
          backfillError
        );

        results.push({
          bookingId:
            booking.id,

          success: false,

          error:
            backfillError instanceof
            Error
              ? backfillError.message
              : "Onbekende fout.",
        });
      }
    }

    return NextResponse.json(
      {
        success:
          results.every(
            (result) =>
              result.success ===
              true
          ),

        results,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "BACKFILL GOOGLE BOOKINGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "De afspraken konden niet gekoppeld worden.",
      },
      {
        status: 500,
      }
    );
  }
}