import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FeedbackRequestBody = {
  bookingId?: unknown;
  rating?: unknown;
  comment?: unknown;
};

type BookingRow = {
  id: string;
  customer_email: string | null;
  end_time: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  customer_archived_at: string | null;
};

/*
 * We gebruiken hier bewust geen vast type met file_url.
 * Jouw appointment_files-tabel heeft die kolom momenteel niet.
 */
type AppointmentFileRow = Record<string, unknown>;

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function getNullableString(value: unknown): string | null {
  const result = clean(value);

  return result || null;
}

function getNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function getAppointmentEndTime(booking: BookingRow): Date | null {
  const storedEndTime = clean(booking.end_time);

  if (storedEndTime) {
    const parsedEndTime = new Date(storedEndTime);

    if (!Number.isNaN(parsedEndTime.getTime())) {
      return parsedEndTime;
    }
  }

  const appointmentDate = clean(booking.appointment_date);
  const appointmentTime = clean(booking.appointment_time).slice(0, 5);

  if (!appointmentDate || !appointmentTime) {
    return null;
  }

  const localStartTime = new Date(
    `${appointmentDate}T${appointmentTime}:00`,
  );

  if (Number.isNaN(localStartTime.getTime())) {
    return null;
  }

  /*
   * Standaardduur wanneer end_time ontbreekt.
   */
  return new Date(localStartTime.getTime() + 60 * 60 * 1000);
}

/*
 * Probeert een bruikbare URL of storageverwijzing te vinden.
 *
 * Omdat de exacte kolomnamen van appointment_files nog niet
 * vastliggen, controleren we meerdere mogelijke namen.
 */
function getFileReference(file: AppointmentFileRow): string | null {
  return (
    getNullableString(file.file_url) ||
    getNullableString(file.public_url) ||
    getNullableString(file.url) ||
    getNullableString(file.storage_url) ||
    getNullableString(file.storage_path) ||
    getNullableString(file.file_path) ||
    getNullableString(file.path)
  );
}

function getFileName(file: AppointmentFileRow): string {
  return (
    getNullableString(file.file_name) ||
    getNullableString(file.filename) ||
    getNullableString(file.name) ||
    "Document"
  );
}

async function preserveAppointmentDocuments(params: {
  admin: ReturnType<typeof getSupabaseAdmin>;
  bookingId: string;
  userId: string;
}): Promise<number> {
  const { admin, bookingId, userId } = params;

  try {
    /*
     * Select("*") voorkomt dat de query faalt op een kolom
     * zoals file_url die in jouw tabel niet bestaat.
     */
    const {
      data: appointmentFilesData,
      error: appointmentFilesError,
    } = await admin
      .from("appointment_files")
      .select("*")
      .eq("booking_id", bookingId);

    if (appointmentFilesError) {
      console.error(
        "OPTIONAL APPOINTMENT FILES LOOKUP ERROR:",
        appointmentFilesError,
      );

      /*
       * Een fout bij documenten mag het verwerken van
       * feedback en het archiveren niet stoppen.
       */
      return 0;
    }

    const appointmentFiles =
      (appointmentFilesData as AppointmentFileRow[] | null) ?? [];

    /*
     * Geen bestanden: niets opslaan en gewoon verdergaan.
     */
    if (appointmentFiles.length === 0) {
      return 0;
    }

    /*
     * Alleen bestanden met een bruikbare verwijzing bewaren.
     */
    const validFiles = appointmentFiles
      .map((file) => {
        const sourceFileId =
          getNullableString(file.id);

        const fileReference =
          getFileReference(file);

        if (!sourceFileId || !fileReference) {
          return null;
        }

        const fileName = getFileName(file);

        return {
          user_id: userId,
          source_booking_id: bookingId,
          source_file_id: sourceFileId,
          file_name: fileName,
          /*
           * De kolom in customer_documents heet voorlopig
           * file_url. Dit mag ook een storage_path bevatten.
           */
          file_url: fileReference,
          mime_type:
            getNullableString(file.mime_type) ||
            getNullableString(file.content_type),
          size_bytes:
            getNullableNumber(file.size_bytes) ||
            getNullableNumber(file.file_size) ||
            getNullableNumber(file.size),
          title: fileName,
          description: "Document uit een afgeronde afspraak.",
          category: "afspraak",
          created_at:
            getNullableString(file.created_at) ||
            new Date().toISOString(),
        };
      })
      .filter(
        (
          row,
        ): row is {
          user_id: string;
          source_booking_id: string;
          source_file_id: string;
          file_name: string;
          file_url: string;
          mime_type: string | null;
          size_bytes: number | null;
          title: string;
          description: string;
          category: string;
          created_at: string;
        } => row !== null,
      );

    /*
     * Er waren rijen, maar geen bruikbare bestandsverwijzingen.
     * Ook dan gaan we gewoon verder.
     */
    if (validFiles.length === 0) {
      console.warn(
        "APPOINTMENT FILES SKIPPED: geen bruikbare URL of storage_path gevonden.",
        {
          bookingId,
          numberOfRows: appointmentFiles.length,
        },
      );

      return 0;
    }

    const {
      error: documentsError,
    } = await admin
      .from("customer_documents")
      .upsert(validFiles, {
        onConflict: "user_id,source_file_id",
        ignoreDuplicates: true,
      });

    if (documentsError) {
      console.error(
        "OPTIONAL CUSTOMER DOCUMENTS SAVE ERROR:",
        documentsError,
      );

      /*
       * Ook deze fout mag het archiveren niet blokkeren.
       */
      return 0;
    }

    return validFiles.length;
  } catch (error) {
    console.error(
      "OPTIONAL DOCUMENT PRESERVATION ERROR:",
      error,
    );

    return 0;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id || !user.email) {
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

    let body: FeedbackRequestBody;

    try {
      body = (await request.json()) as FeedbackRequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "De verzonden gegevens zijn ongeldig.",
        },
        {
          status: 400,
        },
      );
    }

    const bookingId = clean(body.bookingId);
    const rating = Number(body.rating);
    const comment = clean(body.comment).slice(0, 1000) || null;

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: "De afspraak ontbreekt.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Kies een beoordeling van 1 tot 5 sterren.",
        },
        {
          status: 400,
        },
      );
    }

    const admin = getSupabaseAdmin();
    const customerEmail = clean(user.email).toLowerCase();

    /*
     * Afspraak ophalen en controleren of ze bij
     * de aangemelde klant hoort.
     */
    const {
      data: bookingData,
      error: bookingError,
    } = await admin
      .from("bookings")
      .select(
        `
          id,
          customer_email,
          end_time,
          appointment_date,
          appointment_time,
          customer_archived_at
        `,
      )
      .eq("id", bookingId)
      .ilike("customer_email", customerEmail)
      .maybeSingle();

    if (bookingError) {
      console.error(
        "FEEDBACK BOOKING LOOKUP ERROR:",
        bookingError,
      );

      return NextResponse.json(
        {
          success: false,
          error: `De afspraak kon niet worden opgehaald: ${bookingError.message}`,
        },
        {
          status: 500,
        },
      );
    }

    if (!bookingData) {
      return NextResponse.json(
        {
          success: false,
          error:
            "De afspraak werd niet gevonden voor het aangemelde account.",
        },
        {
          status: 404,
        },
      );
    }

    const booking = bookingData as BookingRow;

    /*
     * Wanneer de afspraak al eerder gearchiveerd werd,
     * geven we opnieuw een succesvol antwoord.
     */
    if (booking.customer_archived_at) {
      return NextResponse.json({
        success: true,
        appointmentArchived: true,
        appointmentDeleted: true,
        documentsMoved: 0,
        message: "Bedankt voor je feedback!",
      });
    }

    /*
     * Feedback alleen na afloop toestaan.
     */
    const appointmentEndTime = getAppointmentEndTime(booking);

    if (
      appointmentEndTime &&
      appointmentEndTime.getTime() > Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Je kunt pas feedback geven nadat de afspraak is afgelopen.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Stap 1: feedback opslaan.
     */
    const {
      error: feedbackError,
    } = await admin
      .from("appointment_feedback")
      .upsert(
        {
          booking_id: bookingId,
          customer_user_id: user.id,
          rating,
          comment,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "booking_id",
        },
      );

    if (feedbackError) {
      console.error(
        "APPOINTMENT FEEDBACK UPSERT ERROR:",
        feedbackError,
      );

      return NextResponse.json(
        {
          success: false,
          error: `Je feedback kon niet worden opgeslagen: ${feedbackError.message}`,
        },
        {
          status: 500,
        },
      );
    }

    /*
     * Stap 2: eventuele bestanden proberen bewaren.
     *
     * Geen bestanden of een fout in de bestandentabel
     * verhindert de volgende stap niet.
     */
    const documentsMoved = await preserveAppointmentDocuments({
      admin,
      bookingId,
      userId: user.id,
    });

    /*
     * Stap 3: afspraak altijd uit het klantoverzicht halen
     * nadat de feedback correct werd opgeslagen.
     */
    const archivedAt = new Date().toISOString();

    const {
      data: archivedBooking,
      error: archiveError,
    } = await admin
      .from("bookings")
      .update({
        customer_archived_at: archivedAt,
      })
      .eq("id", bookingId)
      .ilike("customer_email", customerEmail)
      .select("id")
      .maybeSingle();

    if (archiveError) {
      console.error(
        "APPOINTMENT ARCHIVE ERROR:",
        archiveError,
      );

      return NextResponse.json(
        {
          success: false,
          error: `De afspraak kon niet uit je overzicht worden verwijderd: ${archiveError.message}`,
        },
        {
          status: 500,
        },
      );
    }

    if (!archivedBooking) {
      return NextResponse.json(
        {
          success: false,
          error:
            "De feedback werd opgeslagen, maar de afspraak kon niet uit het overzicht worden verwijderd.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      appointmentArchived: true,
      appointmentDeleted: true,
      documentsMoved,
      message: "Bedankt voor je feedback!",
    });
  } catch (error) {
    console.error(
      "APPOINTMENT FEEDBACK ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Je feedback kon niet worden opgeslagen.",
      },
      {
        status: 500,
      },
    );
  }
}