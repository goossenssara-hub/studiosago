import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookingRow = {
  id: string;
  title: string | null;

  customer_name: string | null;
  customer_email: string | null;

  appointment_date: string | null;
  appointment_time: string | null;
  appointment_type: string | null;

  customer_address: string | null;
  location: string | null;
  notes: string | null;

  google_event_id: string | null;
  google_event_url: string | null;
  google_event_link: string | null;
  google_meet_url: string | null;
};

type RequestBody = {
  bookingIds?: unknown;
};

type GoogleScriptResponse = {
  success?: boolean;
  error?: string;

  action?: string;

  eventId?: string;
  htmlLink?: string;
  meetLink?: string;

  conferenceStatus?: string;

  existing?: boolean;
  created?: boolean;
};

type BackfillResult = {
  bookingId: string;
  success: boolean;

  skipped?: boolean;
  message?: string;
  error?: string;

  googleEventId?: string | null;
  googleEventUrl?: string | null;
  googleMeetUrl?: string | null;
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

function normalizeText(
  value: unknown
): string {
  return clean(value).toLowerCase();
}

function isDigitalAppointment(
  booking: BookingRow
): boolean {
  const value = normalizeText(
    [
      booking.appointment_type,
      booking.title,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return (
    value.includes("digital") ||
    value.includes("digitaal") ||
    value.includes("online") ||
    value.includes("video") ||
    value.includes("meet") ||
    value.includes("afstand")
  );
}

function isGoogleMeetUrl(
  value: unknown
): boolean {
  const url = normalizeText(value);

  return (
    url.includes("meet.google.com") ||
    url.includes("hangouts.google.com")
  );
}

function parseBookingIds(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item: unknown) =>
          clean(item)
        )
        .filter(
          (item: string) =>
            item.length > 0
        )
    )
  );
}

async function readGoogleResponse(
  response: Response
): Promise<GoogleScriptResponse> {
  const responseText =
    await response.text();

  if (!responseText) {
    throw new Error(
      "Google Agenda gaf een leeg antwoord terug."
    );
  }

  try {
    return JSON.parse(
      responseText
    ) as GoogleScriptResponse;
  } catch {
    console.error(
      "GOOGLE SCRIPT NON-JSON RESPONSE:",
      responseText
    );

    throw new Error(
      "Google Agenda gaf geen geldig antwoord terug."
    );
  }
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
      (await request.json()) as RequestBody;

    const bookingIds =
      parseBookingIds(
        body.bookingIds
      );

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

    const scriptUrl =
      clean(
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

    if (!bookingSecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "De Google Apps Script-boekingssleutel ontbreekt in .env.local.",
        },
        {
          status: 500,
        }
      );
    }

    const customerEmail =
      normalizeEmail(
        user.email
      );

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("bookings")
        .select(`
          id,
          title,
          customer_name,
          customer_email,
          appointment_date,
          appointment_time,
          appointment_type,
          customer_address,
          location,
          notes,
          google_event_id,
          google_event_url,
          google_event_link,
          google_meet_url
        `)
        .in(
          "id",
          bookingIds
        )
        .ilike(
          "customer_email",
          customerEmail
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
      (data as BookingRow[] | null) ??
      [];

    const results:
      BackfillResult[] = [];

    for (
      const booking of bookings
    ) {
      const isDigital =
        isDigitalAppointment(
          booking
        );

      const storedMeetUrl =
        isGoogleMeetUrl(
          booking.google_meet_url
        )
          ? clean(
              booking.google_meet_url
            )
          : isGoogleMeetUrl(
                booking.google_event_link
              )
            ? clean(
                booking.google_event_link
              )
            : "";

      const hasGoogleEvent =
        Boolean(
          clean(
            booking.google_event_id
          )
        );

      /*
       * Fysieke afspraak is volledig gekoppeld
       * zodra er een Google event-ID is.
       *
       * Digitale afspraak is pas volledig gekoppeld
       * wanneer er ook een Meet-link is.
       */
      if (
        hasGoogleEvent &&
        (
          !isDigital ||
          Boolean(
            storedMeetUrl
          )
        )
      ) {
        results.push({
          bookingId:
            booking.id,

          success: true,
          skipped: true,

          message:
            isDigital
              ? "Deze digitale afspraak was al volledig gekoppeld."
              : "Deze afspraak was al gekoppeld.",

          googleEventId:
            booking.google_event_id,

          googleEventUrl:
            booking.google_event_url,

          googleMeetUrl:
            storedMeetUrl ||
            null,
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
        /*
         * Wanneer het Agenda-event al bestaat,
         * maar de Meet-link ontbreekt, voegen we
         * de Meet-link toe aan het bestaande event.
         */
        const action =
          hasGoogleEvent &&
          isDigital
            ? "ensureMeetLink"
            : "backfillBooking";

        const googleResponse =
          await fetch(
            scriptUrl,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              cache:
                "no-store",

              redirect:
                "follow",

              body:
                JSON.stringify({
                  action,

                  secret:
                    bookingSecret,

                  bookingId:
                    booking.id,

                  eventId:
                    booking.google_event_id,

                  googleEventId:
                    booking.google_event_id,

                  date:
                    booking.appointment_date,

                  time:
                    clean(
                      booking.appointment_time
                    ).slice(0, 5),

                  email:
                    booking.customer_email,

                  customerName:
                    booking.customer_name,

                  appointmentType:
                    booking.appointment_type,

                  customerAddress:
                    booking.customer_address ||
                    (
                      !isDigital
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

        const googleData =
          await readGoogleResponse(
            googleResponse
          );

        if (
          !googleResponse.ok ||
          googleData.success ===
            false
        ) {
          throw new Error(
            clean(
              googleData.error
            ) ||
              "Google Agenda kon de afspraak niet koppelen."
          );
        }

        const googleEventId =
          clean(
            googleData.eventId
          ) ||
          clean(
            booking.google_event_id
          ) ||
          null;

        const googleEventUrl =
          clean(
            googleData.htmlLink
          ) ||
          clean(
            booking.google_event_url
          ) ||
          null;

        const googleMeetUrl =
          clean(
            googleData.meetLink
          ) ||
          storedMeetUrl ||
          null;

        if (
          isDigital &&
          !googleMeetUrl
        ) {
          throw new Error(
            "Google Agenda werd gekoppeld, maar er werd geen Google Meet-link teruggestuurd."
          );
        }

        const {
          error: updateError,
        } =
          await supabaseAdmin
            .from("bookings")
            .update({
              google_event_id:
                googleEventId,

              google_event_url:
                googleEventUrl,

              /*
               * Dit veld bewaren we als Meet-link.
               */
              google_event_link:
                googleMeetUrl,

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

          message:
            action ===
            "ensureMeetLink"
              ? "De Google Meet-link werd toegevoegd."
              : "De afspraak werd aan Google Agenda gekoppeld.",

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
            backfillError instanceof Error
              ? backfillError.message
              : "Onbekende fout.",
        });
      }
    }

    const foundIds =
      new Set<string>(
        bookings.map(
          (booking) =>
            booking.id
        )
      );

    /*
     * bookingIds is nu expliciet string[],
     * dus requestedId is ook een string.
     */
    for (
      const requestedId of bookingIds
    ) {
      if (
        !foundIds.has(
          requestedId
        )
      ) {
        results.push({
          bookingId:
            requestedId,

          success: false,

          error:
            "De afspraak werd niet gevonden of behoort niet tot dit account.",
        });
      }
    }

    const allSucceeded =
      results.length > 0 &&
      results.every(
        (result) =>
          result.success ===
          true
      );

    return NextResponse.json(
      {
        success:
          allSucceeded,

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