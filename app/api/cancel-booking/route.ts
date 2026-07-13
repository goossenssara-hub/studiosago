import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type SupabaseAdmin =
  ReturnType<
    typeof getSupabaseAdmin
  >;

type BookingRecord = {
  id: string;
  customer_email?: string | null;
  status?: string | null;

  start_time?: string | null;
  end_time?: string | null;

  appointment_date?: string | null;
  appointment_time?: string | null;
  appointment_type?: string | null;

  availability_id?: string | null;

  pass_id?: string | null;
  deducted?: boolean | null;
  restored_lesson?: boolean | null;
  credit_refunded?: boolean | null;

  google_event_id?: string | null;
  google_event_url?: string | null;
  google_event_link?: string | null;
  google_meet_url?: string | null;

  cancelled_at?: string | null;
  internal_notes?: string | null;
};

type AvailabilityRecord = {
  id: string;
  date: string | null;
  start_time: string | null;
  booked_places: number | null;
  max_places: number | null;
  active: boolean | null;
};

type ReleaseAvailabilityResult =
  | {
      released: true;
      availabilityId: string;
      bookedPlaces: number;
    }
  | {
      released: false;
      reason: string;
    };

type RestoreCreditResult =
  | {
      restored: true;
      remainingCredits: number;
    }
  | {
      restored: false;
      reason: string;
      skipped?: boolean;
    };

type DeleteGoogleEventResult =
  | {
      deleted: true;
      skipped?: boolean;
      alreadyDeleted?: boolean;
    }
  | {
      deleted: false;
      reason: string;
    };

function clean(
  value: unknown
): string {
  return String(
    value ?? ""
  ).trim();
}

function normalizeEmail(
  value: unknown
): string {
  return clean(
    value
  ).toLowerCase();
}

function normalizeDate(
  value: unknown
): string {
  const text =
    clean(value);

  if (!text) {
    return "";
  }

  if (
    text.includes("T")
  ) {
    return (
      text.split("T")[0] ??
      ""
    );
  }

  return text.slice(
    0,
    10
  );
}

function normalizeTime(
  value: unknown
): string {
  const text =
    clean(value);

  if (!text) {
    return "";
  }

  if (
    text.includes("T")
  ) {
    const timePart =
      text.split("T")[1] ??
      "";

    return timePart.slice(
      0,
      5
    );
  }

  return text.slice(
    0,
    5
  );
}

function buildAppointmentStart(
  booking: BookingRecord
): string | null {
  if (
    booking.start_time &&
    booking.start_time.includes(
      "T"
    )
  ) {
    return booking.start_time;
  }

  const date =
    normalizeDate(
      booking.appointment_date
    );

  const time =
    normalizeTime(
      booking.appointment_time
    ) ||
    normalizeTime(
      booking.start_time
    );

  if (
    !date ||
    !time
  ) {
    return null;
  }

  return `${date}T${time}:00`;
}

function hoursUntilAppointment(
  startTime: string
): number {
  const appointmentDate =
    new Date(
      startTime
    );

  return (
    appointmentDate.getTime() -
    Date.now()
  ) / (
    1000 *
    60 *
    60
  );
}

function getBookingDate(
  booking: BookingRecord,
  appointmentStart: string
): string {
  return (
    normalizeDate(
      booking.appointment_date
    ) ||
    normalizeDate(
      appointmentStart
    )
  );
}

function getBookingTime(
  booking: BookingRecord,
  appointmentStart: string
): string {
  return (
    normalizeTime(
      booking.appointment_time
    ) ||
    normalizeTime(
      booking.start_time
    ) ||
    normalizeTime(
      appointmentStart
    )
  );
}

async function releaseAvailabilitySlot({
  supabaseAdmin,
  booking,
  appointmentStart,
}: {
  supabaseAdmin:
    SupabaseAdmin;
  booking:
    BookingRecord;
  appointmentStart:
    string;
}): Promise<ReleaseAvailabilityResult> {
  let availability:
    | AvailabilityRecord
    | null = null;

  if (
    booking.availability_id
  ) {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "availability"
        )
        .select(`
          id,
          date,
          start_time,
          booked_places,
          max_places,
          active
        `)
        .eq(
          "id",
          booking.availability_id
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Het gekoppelde tijdslot kon niet geladen worden: ${error.message}`
      );
    }

    availability =
      data as
        | AvailabilityRecord
        | null;
  }

  if (!availability) {
    const bookingDate =
      getBookingDate(
        booking,
        appointmentStart
      );

    const bookingTime =
      getBookingTime(
        booking,
        appointmentStart
      );

    if (
      !bookingDate ||
      !bookingTime
    ) {
      return {
        released: false,
        reason:
          "De datum of het uur van het tijdslot ontbreekt.",
      };
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "availability"
        )
        .select(`
          id,
          date,
          start_time,
          booked_places,
          max_places,
          active
        `)
        .eq(
          "date",
          bookingDate
        );

    if (error) {
      throw new Error(
        `De beschikbaarheid kon niet geladen worden: ${error.message}`
      );
    }

    const rows =
      (
        data as
          | AvailabilityRecord[]
          | null
      ) ?? [];

    availability =
      rows.find(
        (slot) =>
          normalizeTime(
            slot.start_time
          ) ===
          bookingTime
      ) ?? null;

    if (!availability) {
      return {
        released: false,
        reason:
          `Geen tijdslot gevonden voor ${bookingDate} om ${bookingTime}.`,
      };
    }
  }

  const currentBookedPlaces =
    Math.max(
      0,
      Number(
        availability
          .booked_places ??
          0
      )
    );

  const newBookedPlaces =
    Math.max(
      0,
      currentBookedPlaces -
        1
    );

  const {
    error: updateError,
  } =
    await supabaseAdmin
      .from(
        "availability"
      )
      .update({
        booked_places:
          newBookedPlaces,
        active: true,
      })
      .eq(
        "id",
        availability.id
      );

  if (updateError) {
    throw new Error(
      `Het tijdslot kon niet worden vrijgegeven: ${updateError.message}`
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

async function restorePassCredit({
  supabaseAdmin,
  booking,
}: {
  supabaseAdmin:
    SupabaseAdmin;
  booking:
    BookingRecord;
}): Promise<RestoreCreditResult> {
  if (
    !booking.pass_id
  ) {
    return {
      restored: false,
      skipped: true,
      reason:
        "De afspraak is niet aan een beurtenkaart gekoppeld.",
    };
  }

  if (
    booking.deducted !==
    true
  ) {
    return {
      restored: false,
      skipped: true,
      reason:
        "Voor deze afspraak werd geen beurt afgeschreven.",
    };
  }

  if (
    booking.restored_lesson ===
      true ||
    booking.credit_refunded ===
      true
  ) {
    return {
      restored: false,
      skipped: true,
      reason:
        "De beurt werd eerder al teruggezet.",
    };
  }

  const {
    data: pass,
    error: passError,
  } =
    await supabaseAdmin
      .from("passes")
      .select(`
        id,
        total_credits,
        total_sessions,
        remaining_credits,
        remaining_sessions,
        status
      `)
      .eq(
        "id",
        booking.pass_id
      )
      .maybeSingle();

  if (
    passError ||
    !pass
  ) {
    throw new Error(
      passError?.message ||
        "De beurtenkaart werd niet gevonden."
    );
  }

  const total =
    Number(
      pass.total_credits ??
        pass.total_sessions ??
        0
    );

  const currentRemaining =
    Number(
      pass.remaining_credits ??
        pass.remaining_sessions ??
        0
    );

  if (
    !Number.isFinite(
      total
    ) ||
    total <= 0
  ) {
    throw new Error(
      "Het totaal aantal beurten is ongeldig."
    );
  }

  const newRemaining =
    Math.min(
      total,
      Math.max(
        0,
        currentRemaining
      ) + 1
    );

  const updateData: {
    remaining_credits?: number;
    remaining_sessions?: number;
    status: string;
  } = {
    status: "active",
  };

  if (
    pass.remaining_credits !==
      null &&
    pass.remaining_credits !==
      undefined
  ) {
    updateData.remaining_credits =
      newRemaining;
  }

  if (
    pass.remaining_sessions !==
      null &&
    pass.remaining_sessions !==
      undefined
  ) {
    updateData.remaining_sessions =
      newRemaining;
  }

  if (
    updateData.remaining_credits ===
      undefined &&
    updateData.remaining_sessions ===
      undefined
  ) {
    updateData.remaining_credits =
      newRemaining;
  }

  const {
    error: updateError,
  } =
    await supabaseAdmin
      .from("passes")
      .update(
        updateData
      )
      .eq(
        "id",
        pass.id
      );

  if (updateError) {
    throw new Error(
      `De beurt kon niet worden teruggezet: ${updateError.message}`
    );
  }

  return {
    restored: true,
    remainingCredits:
      newRemaining,
  };
}

async function deleteGoogleCalendarEvent({
  booking,
}: {
  booking:
    BookingRecord;
}): Promise<DeleteGoogleEventResult> {
  const eventId =
    clean(
      booking.google_event_id
    );

  const bookingId =
    clean(
      booking.id
    );

  if (
    !eventId &&
    !bookingId
  ) {
    return {
      deleted: true,
      skipped: true,
    };
  }

  const scriptUrl =
    clean(
      process.env
        .GOOGLE_APPS_SCRIPT_AVAILABILITY_URL
    );

  if (!scriptUrl) {
    return {
      deleted: false,
      reason:
        "De Google Apps Script-URL ontbreekt.",
    };
  }

  const secret =
    clean(
      process.env
        .GOOGLE_APPS_SCRIPT_BOOKING_SECRET
    );

  try {
    const response =
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
              action:
                "cancelBooking",

              secret,

              bookingId,

              eventId,

              googleEventId:
                eventId,
            }),
        }
      );

    const responseText =
      await response.text();

    let result:
      Record<
        string,
        unknown
      >;

    try {
      result =
        JSON.parse(
          responseText
        ) as Record<
          string,
          unknown
        >;
    } catch {
      return {
        deleted: false,
        reason:
          "Google Agenda gaf geen geldig JSON-antwoord terug.",
      };
    }

    if (
      !response.ok ||
      result.success ===
        false
    ) {
      return {
        deleted: false,
        reason:
          clean(
            result.error
          ) ||
          "Het evenement kon niet uit Google Agenda verwijderd worden.",
      };
    }

    return {
      deleted: true,
      skipped:
        result.skipped ===
        true,
      alreadyDeleted:
        result.alreadyDeleted ===
        true,
    };
  } catch (error) {
    return {
      deleted: false,
      reason:
        error instanceof Error
          ? error.message
          : "Google Agenda kon niet bereikt worden.",
    };
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
      await request.json();

    const bookingId =
      clean(
        body?.bookingId
      );

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "bookingId ontbreekt.",
        },
        {
          status: 400,
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
      data: bookingData,
      error: bookingError,
    } =
      await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq(
          "id",
          bookingId
        )
        .ilike(
          "customer_email",
          customerEmail
        )
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
          success: false,
          error:
            "De afspraak werd niet gevonden.",
        },
        {
          status: 404,
        }
      );
    }

    const normalizedStatus =
      clean(
        booking.status
      ).toLowerCase();

    const alreadyCancelled =
      normalizedStatus ===
        "cancelled" ||
      normalizedStatus ===
        "canceled";

    const appointmentStart =
      buildAppointmentStart(
        booking
      );

    if (!appointmentStart) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Geen geldig afspraakmoment gevonden.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedStart =
      new Date(
        appointmentStart
      );

    if (
      Number.isNaN(
        parsedStart.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
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

    let cancelledBooking:
      BookingRecord =
      booking;

    if (
      !alreadyCancelled
    ) {
      const {
        data,
        error:
          cancelError,
      } =
        await supabaseAdmin
          .from("bookings")
          .update({
            status:
              "cancelled",
            cancelled_at:
              new Date()
                .toISOString(),
          })
          .eq(
            "id",
            booking.id
          )
          .eq(
            "status",
            booking.status
          )
          .select("*")
          .maybeSingle();

      if (cancelError) {
        return NextResponse.json(
          {
            success: false,
            error:
              cancelError.message,
          },
          {
            status: 500,
          }
        );
      }

      if (!data) {
        return NextResponse.json(
          {
            success: false,
            error:
              "De afspraak werd ondertussen gewijzigd. Vernieuw de pagina.",
          },
          {
            status: 409,
          }
        );
      }

      cancelledBooking =
        data as BookingRecord;
    }

    let slotReleased =
      false;

    let slotReleaseMessage =
      "";

    /*
     * Alleen bij de eerste annulering.
     */
    if (
      !alreadyCancelled
    ) {
      try {
        const releaseResult =
          await releaseAvailabilitySlot({
            supabaseAdmin,
            booking,
            appointmentStart,
          });

        slotReleased =
          releaseResult.released;

        if (
          !releaseResult.released
        ) {
          slotReleaseMessage =
            releaseResult.reason;
        }
      } catch (error) {
        console.error(
          "RELEASE AVAILABILITY ERROR:",
          error
        );

        slotReleaseMessage =
          error instanceof Error
            ? error.message
            : "Het tijdslot kon niet worden vrijgegeven.";
      }
    } else {
      slotReleased = true;

      slotReleaseMessage =
        "Het tijdslot was eerder al verwerkt.";
    }

    /*
     * Google mag ook bij een reeds geannuleerde
     * afspraak nog worden opgeschoond.
     */
    let googleEventDeleted =
      false;

    let googleEventDeleteSkipped =
      false;

    let googleDeleteMessage =
      "";

    try {
      const deleteResult =
        await deleteGoogleCalendarEvent({
          booking,
        });

      googleEventDeleted =
        deleteResult.deleted;

      if (
        deleteResult.deleted
      ) {
        googleEventDeleteSkipped =
          deleteResult.skipped ===
            true ||
          deleteResult.alreadyDeleted ===
            true;
      } else {
        googleDeleteMessage =
          deleteResult.reason;
      }
    } catch (error) {
      console.error(
        "DELETE GOOGLE EVENT ERROR:",
        error
      );

      googleDeleteMessage =
        error instanceof Error
          ? error.message
          : "Het Google Agenda-evenement kon niet verwijderd worden.";
    }

    let lessonRestored =
      false;

    let lessonRestoreMessage =
      "";

    let restoredRemainingCredits:
      | number
      | null =
      null;

    /*
     * Alleen bij eerste annulering,
     * anders zou de beurt tweemaal worden toegevoegd.
     */
    if (
      mayRestoreLesson &&
      !alreadyCancelled
    ) {
      try {
        const restoreResult =
          await restorePassCredit({
            supabaseAdmin,
            booking,
          });

        lessonRestored =
          restoreResult.restored;

        if (
          restoreResult.restored
        ) {
          restoredRemainingCredits =
            restoreResult
              .remainingCredits;
        } else {
          lessonRestoreMessage =
            restoreResult.reason;
        }
      } catch (error) {
        console.error(
          "RESTORE PASS CREDIT ERROR:",
          error
        );

        lessonRestoreMessage =
          error instanceof Error
            ? error.message
            : "De beurt kon niet worden teruggezet.";
      }
    } else if (
      alreadyCancelled
    ) {
      lessonRestored =
        booking.restored_lesson ===
          true ||
        booking.credit_refunded ===
          true;

      lessonRestoreMessage =
        "De beurtenkaart was eerder al verwerkt.";
    }

    const notes = [
      booking.internal_notes ||
        "",

      alreadyCancelled
        ? "Opnieuw opruimen van reeds geannuleerde afspraak uitgevoerd."
        : "",

      slotReleased
        ? "Tijdslot vrijgegeven in de websiteagenda."
        : `Tijdslot niet automatisch vrijgegeven${
            slotReleaseMessage
              ? `: ${slotReleaseMessage}`
              : "."
          }`,

      googleEventDeleted
        ? googleEventDeleteSkipped
          ? "Google Agenda-evenement was al verwijderd of niet gekoppeld."
          : "Afspraak verwijderd uit Google Agenda."
        : `Afspraak niet automatisch verwijderd uit Google Agenda${
            googleDeleteMessage
              ? `: ${googleDeleteMessage}`
              : "."
          }`,

      lessonRestored
        ? "Beurt is terug toegevoegd aan de beurtenkaart."
        : mayRestoreLesson
          ? `Beurt niet teruggezet${
              lessonRestoreMessage
                ? `: ${lessonRestoreMessage}`
                : "."
            }`
          : "Annulatie minder dan 72 uur vooraf: beurt blijft aangerekend.",
    ]
      .filter(Boolean)
      .join("\n");

    const finalUpdate: {
      restored_lesson: boolean;
      credit_refunded: boolean;
      internal_notes: string;

      google_event_id?: null;
      google_event_url?: null;
      google_event_link?: null;
      google_meet_url?: null;
    } = {
      restored_lesson:
        alreadyCancelled
          ? Boolean(
              booking.restored_lesson
            )
          : lessonRestored,

      credit_refunded:
        alreadyCancelled
          ? Boolean(
              booking.credit_refunded
            )
          : lessonRestored,

      internal_notes:
        notes,
    };

    if (
      googleEventDeleted
    ) {
      finalUpdate.google_event_id =
        null;

      finalUpdate.google_event_url =
        null;

      finalUpdate.google_event_link =
        null;

      finalUpdate.google_meet_url =
        null;
    }

    const {
      data:
        updatedBooking,
      error:
        finalUpdateError,
    } =
      await supabaseAdmin
        .from("bookings")
        .update(
          finalUpdate
        )
        .eq(
          "id",
          booking.id
        )
        .select("*")
        .maybeSingle();

    if (
      finalUpdateError
    ) {
      console.error(
        "FINAL CANCEL UPDATE ERROR:",
        finalUpdateError
      );
    }

    return NextResponse.json({
      success: true,

      alreadyCancelled,

      booking:
        updatedBooking ??
        cancelledBooking,

      hoursBefore,
      mayRestoreLesson,

      slotReleased,
      slotReleaseMessage:
        slotReleaseMessage ||
        null,

      googleEventDeleted,
      googleEventDeleteSkipped,

      googleDeleteMessage:
        googleDeleteMessage ||
        null,

      lessonRestored,
      restoredRemainingCredits,

      lessonRestoreMessage:
        lessonRestoreMessage ||
        null,

      message: [
        alreadyCancelled
          ? "De reeds geannuleerde afspraak werd opnieuw gecontroleerd."
          : "De afspraak werd geannuleerd.",

        slotReleased
          ? "Het tijdstip is beschikbaar op de website."
          : "Het tijdstip kon niet automatisch worden vrijgegeven.",

        googleEventDeleted
          ? googleEventDeleteSkipped
            ? "Het Google Agenda-evenement was al verwijderd of niet gekoppeld."
            : "De afspraak werd uit Google Agenda verwijderd."
          : "De afspraak kon niet automatisch uit Google Agenda worden verwijderd.",

        lessonRestored
          ? "De beurt staat op de beurtenkaart."
          : mayRestoreLesson
            ? lessonRestoreMessage ||
              "De beurt kon niet automatisch worden teruggezet."
            : "De beurt blijft aangerekend omdat de annulering minder dan 72 uur vooraf gebeurde.",
      ].join(" "),
    });
  } catch (error) {
    console.error(
      "CANCEL BOOKING SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Serverfout bij annuleren.",
      },
      {
        status: 500,
      }
    );
  }
}