import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookingRecord = {
  id: string;
  status?: string | null;

  start_time?: string | null;
  appointment_date?: string | null;
  appointment_time?: string | null;
  end_time?: string | null;

  availability_id?: string | null;

  pass_id?: string | null;
  deducted?: boolean | null;
  restored_lesson?: boolean | null;
  credit_refunded?: boolean | null;

  internal_notes?: string | null;
};

type AvailabilityRecord = {
  id: string;
  date?: string | null;
  start_time?: string | null;
  booked_places?: number | null;
  max_places?: number | null;
  capacity?: number | null;
  active?: boolean | null;
};

function normalizeTime(value: unknown) {
  const time = String(value ?? "").trim();

  if (!time) {
    return "";
  }

  /*
   * Ondersteunt:
   * 11:00
   * 11:00:00
   * 2026-07-13T11:00:00
   * 2026-07-13T11:00:00+02:00
   */
  if (time.includes("T")) {
    const timePart = time.split("T")[1] ?? "";
    return timePart.slice(0, 5);
  }

  return time.slice(0, 5);
}

function normalizeDate(value: unknown) {
  const date = String(value ?? "").trim();

  if (!date) {
    return "";
  }

  if (date.includes("T")) {
    return date.split("T")[0];
  }

  return date.slice(0, 10);
}

function buildAppointmentStart(booking: BookingRecord) {
  /*
   * start_time kan een volledige datum en tijd bevatten.
   */
  if (
    booking.start_time &&
    String(booking.start_time).includes("T")
  ) {
    return String(booking.start_time);
  }

  /*
   * appointment_date + appointment_time is de normale fallback.
   */
  if (
    booking.appointment_date &&
    booking.appointment_time
  ) {
    const date = normalizeDate(
      booking.appointment_date
    );

    const time = normalizeTime(
      booking.appointment_time
    );

    if (date && time) {
      return `${date}T${time}:00`;
    }
  }

  /*
   * Soms staat de datum in appointment_date
   * en enkel het uur in start_time.
   */
  if (
    booking.appointment_date &&
    booking.start_time
  ) {
    const date = normalizeDate(
      booking.appointment_date
    );

    const time = normalizeTime(
      booking.start_time
    );

    if (date && time) {
      return `${date}T${time}:00`;
    }
  }

  return null;
}

function getBookingDate(
  booking: BookingRecord,
  appointmentStart: string
) {
  return (
    normalizeDate(
      booking.appointment_date
    ) ||
    normalizeDate(appointmentStart)
  );
}

function getBookingTime(
  booking: BookingRecord,
  appointmentStart: string
) {
  return (
    normalizeTime(
      booking.appointment_time
    ) ||
    normalizeTime(
      booking.start_time
    ) ||
    normalizeTime(appointmentStart)
  );
}

function hoursUntilAppointment(
  startTime: string
) {
  const appointmentDate =
    new Date(startTime);

  const now = new Date();

  return (
    appointmentDate.getTime() -
    now.getTime()
  ) / (1000 * 60 * 60);
}

async function releaseAvailabilitySlot({
  supabaseAdmin,
  booking,
  appointmentStart,
}: {
  supabaseAdmin: ReturnType<
    typeof getSupabaseAdmin
  >;
  booking: BookingRecord;
  appointmentStart: string;
}) {
  /*
   * Beste methode:
   * gebruik rechtstreeks availability_id
   * wanneer die op de booking is opgeslagen.
   */
  if (booking.availability_id) {
    const {
      data: availability,
      error: availabilityError,
    } = await supabaseAdmin
      .from("availability")
      .select(
        `
          id,
          date,
          start_time,
          booked_places,
          max_places,
          capacity,
          active
        `
      )
      .eq(
        "id",
        booking.availability_id
      )
      .maybeSingle();

    if (availabilityError) {
      throw new Error(
        `Tijdslot kon niet worden opgehaald: ${availabilityError.message}`
      );
    }

    if (availability) {
      const currentBookedPlaces =
        Number(
          availability.booked_places ?? 0
        );

      const newBookedPlaces = Math.max(
        0,
        currentBookedPlaces - 1
      );

      const { error: releaseError } =
        await supabaseAdmin
          .from("availability")
          .update({
            booked_places:
              newBookedPlaces,
            active: true,
          })
          .eq(
            "id",
            availability.id
          );

      if (releaseError) {
        throw new Error(
          `Tijdslot kon niet worden vrijgegeven: ${releaseError.message}`
        );
      }

      return {
        released: true,
        availabilityId:
          availability.id,
        bookedPlaces:
          newBookedPlaces,
      };
    }
  }

  /*
   * Fallback wanneer availability_id
   * nog niet op de booking staat.
   */
  const bookingDate = getBookingDate(
    booking,
    appointmentStart
  );

  const bookingTime = getBookingTime(
    booking,
    appointmentStart
  );

  if (!bookingDate || !bookingTime) {
    return {
      released: false,
      reason:
        "Datum of uur van het tijdslot ontbreekt.",
    };
  }

  /*
   * We halen alle tijdsloten van die datum op
   * en vergelijken de uren genormaliseerd.
   *
   * Daardoor werken zowel 11:00 als 11:00:00.
   */
  const {
    data: availabilityRows,
    error: availabilityError,
  } = await supabaseAdmin
    .from("availability")
    .select(
      `
        id,
        date,
        start_time,
        booked_places,
        max_places,
        capacity,
        active
      `
    )
    .eq("date", bookingDate);

  if (availabilityError) {
    throw new Error(
      `Beschikbaarheid kon niet worden opgehaald: ${availabilityError.message}`
    );
  }

  const matchingAvailability =
    (
      availabilityRows as
        | AvailabilityRecord[]
        | null
    )?.find(
      (availability) =>
        normalizeTime(
          availability.start_time
        ) === bookingTime
    );

  if (!matchingAvailability) {
    return {
      released: false,
      reason: `Geen beschikbaarheid gevonden voor ${bookingDate} om ${bookingTime}.`,
    };
  }

  const currentBookedPlaces =
    Number(
      matchingAvailability.booked_places ??
        0
    );

  const newBookedPlaces = Math.max(
    0,
    currentBookedPlaces - 1
  );

  const { error: releaseError } =
    await supabaseAdmin
      .from("availability")
      .update({
        booked_places:
          newBookedPlaces,
        active: true,
      })
      .eq(
        "id",
        matchingAvailability.id
      );

  if (releaseError) {
    throw new Error(
      `Tijdslot kon niet worden vrijgegeven: ${releaseError.message}`
    );
  }

  return {
    released: true,
    availabilityId:
      matchingAvailability.id,
    bookedPlaces:
      newBookedPlaces,
  };
}

export async function POST(
  request: Request
) {
  try {
    const supabaseAdmin =
      getSupabaseAdmin();

    const body = await request.json();

    const bookingId = String(
      body?.bookingId ?? ""
    ).trim();

    if (!bookingId) {
      return NextResponse.json(
        {
          error:
            "bookingId ontbreekt.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: bookingData,
      error: bookingError,
    } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    const booking =
      bookingData as
        | BookingRecord
        | null;

    if (
      bookingError ||
      !booking
    ) {
      return NextResponse.json(
        {
          error:
            "Geen afspraak gevonden.",
        },
        {
          status: 404,
        }
      );
    }

    const normalizedStatus = String(
      booking.status ?? ""
    )
      .trim()
      .toLowerCase();

    if (
      normalizedStatus ===
        "cancelled" ||
      normalizedStatus ===
        "canceled"
    ) {
      return NextResponse.json({
        success: true,
        alreadyCancelled: true,
        message:
          "Deze afspraak was al geannuleerd.",
      });
    }

    const appointmentStart =
      buildAppointmentStart(booking);

    if (!appointmentStart) {
      return NextResponse.json(
        {
          error:
            "Geen geldig afspraakmoment gevonden.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedAppointmentStart =
      new Date(appointmentStart);

    if (
      Number.isNaN(
        parsedAppointmentStart.getTime()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Het afspraakmoment heeft geen geldig datumformaat.",
        },
        {
          status: 400,
        }
      );
    }

    const hoursBefore =
      hoursUntilAppointment(
        appointmentStart
      );

    const mayRestoreLesson =
      hoursBefore >= 72;

    /*
     * We zetten de booking eerst op cancelled.
     *
     * De extra eq("status", booking.status)
     * voorkomt dat twee annulatieverzoeken
     * dezelfde booking tegelijk verwerken.
     */
    const {
      data: cancelledBooking,
      error: cancelError,
    } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at:
          new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq(
        "status",
        booking.status
      )
      .select("*")
      .maybeSingle();

    if (cancelError) {
      return NextResponse.json(
        {
          error:
            cancelError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!cancelledBooking) {
      return NextResponse.json(
        {
          error:
            "De afspraak werd ondertussen al gewijzigd. Vernieuw de pagina.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Tijdslot opnieuw vrijgeven.
     */
    let slotReleased = false;
    let slotReleaseMessage = "";

    try {
      const releaseResult =
        await releaseAvailabilitySlot({
          supabaseAdmin,
          booking,
          appointmentStart,
        });

      slotReleased =
        releaseResult.released;

if (!releaseResult.released) {
  slotReleaseMessage =
    releaseResult.reason ??
    "Het tijdslot kon niet automatisch worden vrijgegeven.";
}    } catch (releaseError) {
      console.error(
        "RELEASE AVAILABILITY ERROR:",
        releaseError
      );

      slotReleaseMessage =
        releaseError instanceof Error
          ? releaseError.message
          : "Tijdslot kon niet worden vrijgegeven.";
    }

    /*
     * Beurt terugzetten wanneer minstens
     * 72 uur vooraf geannuleerd werd.
     */
    let lessonRestored = false;

    if (
      mayRestoreLesson &&
      booking.pass_id &&
      booking.deducted === true &&
      booking.restored_lesson !== true
    ) {
      const {
        data: pass,
        error: passError,
      } = await supabaseAdmin
        .from("passes")
        .select("*")
        .eq(
          "id",
          booking.pass_id
        )
        .maybeSingle();

      if (
        passError ||
        !pass
      ) {
        console.error(
          "Beurtenkaart niet gevonden:",
          passError
        );
      } else {
        const currentRemaining =
          Number(
            pass.remaining_credits ??
              pass.remaining_sessions ??
              0
          );

        const total = Number(
          pass.total_credits ??
            pass.total_sessions ??
            10
        );

        const newRemaining =
          Math.min(
            currentRemaining + 1,
            total
          );

        const {
          error: passUpdateError,
        } = await supabaseAdmin
          .from("passes")
          .update({
            remaining_credits:
              newRemaining,
            remaining_sessions:
              newRemaining,
            status: "active",
          })
          .eq(
            "id",
            pass.id
          );

        if (passUpdateError) {
          console.error(
            "Beurt kon niet worden teruggezet:",
            passUpdateError
          );
        } else {
          lessonRestored = true;
        }
      }
    }

    const noteParts = [
      booking.internal_notes || "",
      slotReleased
        ? "Het tijdslot werd opnieuw vrijgegeven in de agenda."
        : `Het tijdslot kon niet automatisch worden vrijgegeven${
            slotReleaseMessage
              ? `: ${slotReleaseMessage}`
              : "."
          }`,
      lessonRestored
        ? "Annulatie minstens 72u op voorhand: beurt terug toegevoegd."
        : mayRestoreLesson
          ? "De beurt kon niet automatisch worden teruggezet."
          : "Annulatie minder dan 72u op voorhand: beurt blijft aangerekend.",
    ].filter(Boolean);

    const {
      data: updatedBooking,
      error: updateError,
    } = await supabaseAdmin
      .from("bookings")
      .update({
        restored_lesson:
          lessonRestored,
        credit_refunded:
          lessonRestored,
        internal_notes:
          noteParts.join("\n"),
      })
      .eq("id", bookingId)
      .select("*")
      .single();

    if (updateError) {
      console.error(
        "Bookingnotities konden niet worden bijgewerkt:",
        updateError
      );
    }

    return NextResponse.json({
      success: true,
      booking:
        updatedBooking ??
        cancelledBooking,
      lessonRestored,
      slotReleased,
      slotReleaseMessage:
        slotReleased
          ? null
          : slotReleaseMessage,
      message: [
        "Afspraak geannuleerd.",
        slotReleased
          ? "Het tijdstip is opnieuw beschikbaar in de agenda."
          : "Het tijdstip kon niet automatisch worden vrijgegeven.",
        lessonRestored
          ? "De beurt werd terug toegevoegd aan de beurtenkaart."
          : mayRestoreLesson
            ? "De beurt kon niet automatisch worden teruggezet."
            : "De beurt blijft aangerekend omdat de annulatie minder dan 72 uur op voorhand gebeurde.",
      ].join(" "),
    });
  } catch (error) {
    console.error(
      "CANCEL BOOKING SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Serverfout bij annuleren.",
      },
      {
        status: 500,
      }
    );
  }
}