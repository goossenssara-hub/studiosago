import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PassRow = {
  id: string;
  customer_email: string | null;
  status: string | null;
  remaining_sessions: number | null;
  remaining_credits: number | null;
  total_sessions: number | null;
  total_credits: number | null;
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function makeLocalDateTime(
  date: string,
  time: string
): string {
  return `${date}T${clean(time).slice(0, 5)}:00`;
}

function addMinutesLocal(
  date: string,
  time: string,
  minutes: number
): string {
  const start = new Date(
    `${date}T${clean(time).slice(0, 5)}:00`
  );

  start.setMinutes(
    start.getMinutes() + minutes
  );

  const year = start.getFullYear();

  const month = String(
    start.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    start.getDate()
  ).padStart(2, "0");

  const hours = String(
    start.getHours()
  ).padStart(2, "0");

  const mins = String(
    start.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${mins}:00`;
}

function getRemainingCredits(
  pass: PassRow
): number {
  const value =
    pass.remaining_sessions ??
    pass.remaining_credits ??
    0;

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function getTotalCredits(
  pass: PassRow
): number {
  const value =
    pass.total_sessions ??
    pass.total_credits ??
    0;

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export async function POST(
  request: Request
): Promise<NextResponse> {
  try {
    const supabaseAdmin =
      getSupabaseAdmin();

    const body = await request.json();

    const passId = clean(body.passId);
    const email = normalizeEmail(body.email);
    const customerName = clean(
      body.customerName
    );

    const date = clean(body.date);
    const time = clean(body.time).slice(0, 5);

    const appointmentType = clean(
      body.appointmentType
    );

    const customerAddress = clean(
      body.customerAddress
    );

    const notes = clean(body.notes);

    const cancellationPolicyAccepted =
      body.cancellationPolicyAccepted === true;

    if (
      !passId ||
      !email ||
      !customerName ||
      !date ||
      !time ||
      !appointmentType ||
      !notes
    ) {
      return NextResponse.json(
        {
          error:
            "Niet alle verplichte velden zijn ingevuld.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      appointmentType !== "digital" &&
      appointmentType !== "home"
    ) {
      return NextResponse.json(
        {
          error:
            "Het gekozen type afspraak is ongeldig.",
        },
        {
          status: 400,
        }
      );
    }

    if (!cancellationPolicyAccepted) {
      return NextResponse.json(
        {
          error:
            "Je moet akkoord gaan met de annuleringsvoorwaarden.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      appointmentType === "home" &&
      !customerAddress
    ) {
      return NextResponse.json(
        {
          error:
            "Vul je adres in voor begeleiding aan huis.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Beurtenkaart ophalen.
     *
     * De e-mailcontrole gebeurt hieronder genormaliseerd,
     * zodat hoofdletters in de database geen probleem vormen.
     */
    const {
      data: passData,
      error: passError,
    } = await supabaseAdmin
      .from("passes")
      .select(
        `
          id,
          customer_email,
          status,
          remaining_sessions,
          remaining_credits,
          total_sessions,
          total_credits
        `
      )
      .eq("id", passId)
      .maybeSingle();

    const pass = passData as
      | PassRow
      | null;

    if (passError) {
      console.error(
        "PASS FIND ERROR:",
        passError
      );

      return NextResponse.json(
        {
          error:
            "De beurtenkaart kon niet gecontroleerd worden.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !pass ||
      pass.status !== "active" ||
      normalizeEmail(
        pass.customer_email
      ) !== email
    ) {
      return NextResponse.json(
        {
          error:
            "Geen geldige beurtenkaart gevonden.",
        },
        {
          status: 404,
        }
      );
    }

    const remaining =
      getRemainingCredits(pass);

    const total =
      getTotalCredits(pass);

    if (remaining <= 0) {
      return NextResponse.json(
        {
          error:
            "Er zijn geen beurten meer beschikbaar.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Controleren of het tijdstip ondertussen
     * al door iemand anders geboekt werd.
     */
    const {
      data: existingBooking,
      error: existingBookingError,
    } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("appointment_date", date)
      .eq("appointment_time", time)
      .neq("status", "cancelled")
      .limit(1)
      .maybeSingle();

    if (existingBookingError) {
      console.error(
        "EXISTING BOOKING CHECK ERROR:",
        existingBookingError
      );

      return NextResponse.json(
        {
          error:
            "Het gekozen tijdstip kon niet gecontroleerd worden.",
        },
        {
          status: 500,
        }
      );
    }

    if (existingBooking) {
      return NextResponse.json(
        {
          error:
            "Dit tijdstip is intussen al geboekt.",
        },
        {
          status: 409,
        }
      );
    }

    const appointmentStart =
      makeLocalDateTime(date, time);

    const appointmentEnd =
      addMinutesLocal(
        date,
        time,
        60
      );

    const title =
      appointmentType === "home"
        ? "Studiebegeleiding aan huis"
        : "Digitale studiebegeleiding";

    /*
     * Eerst de afspraak opslaan.
     */
    const {
      data: booking,
      error: bookingError,
    } = await supabaseAdmin
      .from("bookings")
      .insert({
        pass_id: pass.id,
        title,
        customer_email: email,
        customer_name:
          customerName || null,
        appointment_date: date,
        appointment_time: time,
        start_time: appointmentStart,
        end_time: appointmentEnd,
        location:
          appointmentType === "home"
            ? customerAddress
            : "Digitaal",
        notes,
        service_type:
          "begeleiding",
        appointment_type:
          appointmentType,
        status: "confirmed",
        payment_status:
          "paid_with_pass",
        deducted: true,
        restored_lesson: false,
        credit_refunded: false,
        confirmed_at:
          new Date().toISOString(),
        cancellation_policy_accepted:
          true,
        updated_at:
          new Date().toISOString(),
      })
      .select("*")
      .single();

    if (bookingError || !booking) {
      console.error(
        "BOOKING INSERT ERROR:",
        bookingError
      );

      return NextResponse.json(
        {
          error:
            bookingError?.message ||
            "Afspraak kon niet opgeslagen worden.",
        },
        {
          status: 500,
        }
      );
    }

    const newRemaining =
      remaining - 1;

    /*
     * Alleen kolommen meesturen die werkelijk
     * door deze beurtenkaart gebruikt worden.
     *
     * Hierdoor schrijven we geen null naar een
     * verplichte kolom en wordt updated_at niet
     * aangepast wanneer die kolom niet bestaat.
     */
    const passUpdate: Record<
      string,
      number
    > = {};

    if (
      pass.remaining_sessions !== null &&
      pass.remaining_sessions !==
        undefined
    ) {
      passUpdate.remaining_sessions =
        newRemaining;
    }

    if (
      pass.remaining_credits !== null &&
      pass.remaining_credits !==
        undefined
    ) {
      passUpdate.remaining_credits =
        newRemaining;
    }

    if (
      Object.keys(passUpdate).length === 0
    ) {
      const {
        error: rollbackError,
      } = await supabaseAdmin
        .from("bookings")
        .delete()
        .eq("id", booking.id);

      if (rollbackError) {
        console.error(
          "BOOKING ROLLBACK ERROR:",
          rollbackError
        );
      }

      return NextResponse.json(
        {
          error:
            "De beurtenkaart bevat geen geldig veld voor het resterende aantal beurten.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Optimistische controle:
     * de update lukt alleen wanneer het aantal
     * sinds het ophalen niet gewijzigd is.
     */
    let updateQuery =
      supabaseAdmin
        .from("passes")
        .update(passUpdate)
        .eq("id", pass.id)
        .eq("status", "active");

    if (
      pass.remaining_sessions !== null &&
      pass.remaining_sessions !==
        undefined
    ) {
      updateQuery =
        updateQuery.eq(
          "remaining_sessions",
          Number(
            pass.remaining_sessions
          )
        );
    } else {
      updateQuery =
        updateQuery.eq(
          "remaining_credits",
          Number(
            pass.remaining_credits
          )
        );
    }

    const {
      data: updatedPass,
      error: passUpdateError,
    } = await updateQuery
      .select(
        `
          id,
          remaining_sessions,
          remaining_credits
        `
      )
      .maybeSingle();

    if (
      passUpdateError ||
      !updatedPass
    ) {
      console.error(
        "PASS UPDATE ERROR:",
        passUpdateError
      );

      /*
       * De afspraak verwijderen wanneer het
       * afboeken van de beurt mislukt.
       */
      const {
        error: rollbackError,
      } = await supabaseAdmin
        .from("bookings")
        .delete()
        .eq("id", booking.id);

      if (rollbackError) {
        console.error(
          "BOOKING ROLLBACK ERROR:",
          rollbackError
        );

        return NextResponse.json(
          {
            error:
              "De afspraak werd aangemaakt, maar kon niet volledig verwerkt worden. Neem contact op met Studio SaGo.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "De afspraak kon niet volledig verwerkt worden. Er werd geen beurt afgetrokken en de afspraak werd niet behouden.",
        },
        {
          status: 500,
        }
      );
    }

    const finalRemaining = Number(
      updatedPass.remaining_sessions ??
        updatedPass.remaining_credits ??
        newRemaining
    );

    return NextResponse.json(
      {
        success: true,
        booking,
        pass: {
          id: pass.id,
          total,
          remaining:
            finalRemaining,
        },
        remainingSessions:
          finalRemaining,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PASS GOOGLE BOOKING ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Serverfout bij afspraak maken.",
      },
      {
        status: 500,
      }
    );
  }
}