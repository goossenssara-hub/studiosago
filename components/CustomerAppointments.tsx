"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Booking = {
  id: string;
  title: string | null;
  customer_name: string | null;
  customer_email: string | null;

  start_time: string | null;
  end_time: string | null;

  appointment_date: string | null;
  appointment_time: string | null;
  appointment_type: string | null;

  customer_address: string | null;
  location: string | null;
  notes: string | null;
  status: string | null;

  google_event_id: string | null;
  google_event_url: string | null;
  google_event_link: string | null;
  google_meet_url: string | null;
};

type AppointmentsResponse = {
  success?: boolean;
  bookings?: Booking[];
  error?: string;
  details?: string;
};

type BackfillResult = {
  bookingId?: string;
  success?: boolean;
  skipped?: boolean;
  message?: string;
  error?: string;
  googleEventId?: string | null;
  googleEventUrl?: string | null;
  googleMeetUrl?: string | null;
};

type BackfillResponse = {
  success?: boolean;
  results?: BackfillResult[];
  error?: string;
};

function formatDate(
  booking: Booking
): string {
  const value =
    booking.appointment_date ||
    booking.start_time;

  if (!value) {
    return "Datum onbekend";
  }

  const date = booking.appointment_date
    ? new Date(
        `${booking.appointment_date}T12:00:00`
      )
    : new Date(value);

  return date.toLocaleDateString(
    "nl-BE",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatTime(
  booking: Booking
): string {
  if (booking.appointment_time) {
    return booking.appointment_time.slice(
      0,
      5
    );
  }

  if (booking.start_time) {
    return new Date(
      booking.start_time
    ).toLocaleTimeString("nl-BE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return "Tijdstip onbekend";
}

function translateStatus(
  status: string | null
): string {
  switch (status) {
    case "confirmed":
      return "Afspraak bevestigd";

    case "pending":
      return "Afspraak in behandeling";

    case "cancelled":
      return "Afspraak geannuleerd";

    default:
      return "Afspraak";
  }
}

async function readJsonResponse<T>(
  response: Response
): Promise<T> {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    throw new Error(
      "De server gaf geen geldig antwoord terug."
    );
  }

  return (await response.json()) as T;
}

export default function CustomerAppointments() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    cancellingId,
    setCancellingId,
  ] = useState<string | null>(null);

  const [
    syncingGoogle,
    setSyncingGoogle,
  ] = useState(false);

  const [
    syncMessage,
    setSyncMessage,
  ] = useState("");

  const unsyncedBookings =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            !booking.google_event_id &&
            Boolean(
              booking.appointment_date
            ) &&
            Boolean(
              booking.appointment_time
            )
        ),
      [bookings]
    );

  const loadBookings =
    useCallback(async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(
          "/api/customer/appointments",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

        const result =
          await readJsonResponse<AppointmentsResponse>(
            response
          );

        if (!response.ok) {
          throw new Error(
            result.details ||
              result.error ||
              "De afspraken konden niet geladen worden."
          );
        }

        setBookings(
          Array.isArray(
            result.bookings
          )
            ? result.bookings
            : []
        );
      } catch (error) {
        console.error(
          "LOAD CUSTOMER APPOINTMENTS ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "De afspraken konden niet geladen worden."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  async function syncExistingBookings() {
    if (
      unsyncedBookings.length === 0
    ) {
      setSyncMessage(
        "Alle afspraken zijn al gekoppeld aan Google Agenda."
      );

      return;
    }

    setSyncingGoogle(true);
    setSyncMessage("");

    try {
      const response = await fetch(
        "/api/customer/appointments/backfill-google",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            bookingIds:
              unsyncedBookings.map(
                (booking) =>
                  booking.id
              ),
          }),
        }
      );

      const result =
        await readJsonResponse<BackfillResponse>(
          response
        );

      if (!response.ok) {
        throw new Error(
          result.error ||
            "De afspraken konden niet met Google Agenda gekoppeld worden."
        );
      }

      const results = Array.isArray(
        result.results
      )
        ? result.results
        : [];

      const succeeded =
        results.filter(
          (item) =>
            item.success === true &&
            item.skipped !== true
        ).length;

      const skipped =
        results.filter(
          (item) =>
            item.skipped === true
        ).length;

      const failed =
        results.filter(
          (item) =>
            item.success !== true
        );

      if (failed.length > 0) {
        const failureMessages =
          failed
            .map(
              (item) =>
                item.error
            )
            .filter(Boolean)
            .join(" ");

        setSyncMessage(
          `${succeeded} afspraak/afspraken gekoppeld, ${skipped} overgeslagen en ${failed.length} mislukt.${
            failureMessages
              ? ` ${failureMessages}`
              : ""
          }`
        );
      } else {
        setSyncMessage(
          `${succeeded} afspraak/afspraken succesvol gekoppeld aan Google Agenda.${
            skipped > 0
              ? ` ${skipped} afspraak/afspraken waren al gekoppeld.`
              : ""
          }`
        );
      }

      await loadBookings();
    } catch (error) {
      console.error(
        "SYNC GOOGLE BOOKINGS ERROR:",
        error
      );

      setSyncMessage(
        error instanceof Error
          ? error.message
          : "De afspraken konden niet gekoppeld worden."
      );
    } finally {
      setSyncingGoogle(false);
    }
  }

  async function cancelBooking(
    booking: Booking
  ) {
    const confirmed =
      window.confirm(
        "Ben je zeker dat je deze afspraak wilt annuleren?"
      );

    if (!confirmed) return;

    setCancellingId(
      booking.id
    );

    try {
      const response = await fetch(
        "/api/cancel-bookings",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            bookingId:
              booking.id,
          }),
        }
      );

      const result =
        await readJsonResponse<{
          error?: string;
        }>(response);

      if (!response.ok) {
        throw new Error(
          result.error ||
            "De afspraak kon niet geannuleerd worden."
        );
      }

      setBookings(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              booking.id
          )
      );

      window.alert(
        "Je afspraak werd succesvol geannuleerd."
      );
    } catch (error) {
      console.error(
        "CANCEL BOOKING ERROR:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Er ging iets mis."
      );
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <div className="appointments-loading">
        <span className="appointments-spinner" />
        <p>
          Afspraken laden...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="appointments-error">
        <p>{errorMessage}</p>

        <button
          type="button"
          onClick={() =>
            void loadBookings()
          }
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (
    bookings.length === 0
  ) {
    return (
      <div className="appointments-empty">
        <p>
          Er staan momenteel geen
          actieve afspraken in je
          dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="customer-appointments">
      {unsyncedBookings.length >
        0 && (
        <section className="google-sync-card">
          <div className="google-sync-content">
            <span
              className="google-sync-icon"
              aria-hidden="true"
            >
              📅
            </span>

            <div>
              <strong>
                Google Agenda nog
                niet gekoppeld
              </strong>

              <p>
                {unsyncedBookings.length ===
                1
                  ? "Er staat 1 afspraak klaar om met Google Agenda te synchroniseren."
                  : `Er staan ${unsyncedBookings.length} afspraken klaar om met Google Agenda te synchroniseren.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="google-sync-button"
            onClick={
              syncExistingBookings
            }
            disabled={
              syncingGoogle
            }
          >
            {syncingGoogle
              ? "Afspraken koppelen..."
              : "Koppelen aan Google Agenda"}
          </button>

          {syncMessage && (
            <p className="google-sync-message">
              {syncMessage}
            </p>
          )}
        </section>
      )}

      <div className="agenda-list">
        {bookings.map(
          (booking) => {
            const calendarUrl =
              booking.google_event_url;

            const meetUrl =
              booking.google_meet_url ||
              (booking.appointment_type ===
              "digital"
                ? booking.google_event_link
                : null);

            const isGoogleLinked =
              Boolean(
                booking.google_event_id ||
                  booking.google_event_url
              );

            return (
              <article
                className="agenda-item"
                key={booking.id}
              >
                <div className="appointment-card-header">
                  <div className="appointment-title-block">
                    <strong className="appointment-title">
                      {booking.title ||
                        "Afspraak Studio SaGo"}
                    </strong>

                    <p className="appointment-type-label">
                      {booking.appointment_type ===
                      "digital"
                        ? "💻 Digitale begeleiding"
                        : "🏠 Begeleiding aan huis"}
                    </p>
                  </div>

                  <div className="appointment-badges">
                    <span
                      className={`appointment-status-badge ${
                        booking.status ||
                        "unknown"
                      }`}
                    >
                      {booking.status ===
                        "confirmed" &&
                        "✓ "}

                      {booking.status ===
                        "pending" &&
                        "◷ "}

                      {translateStatus(
                        booking.status
                      )}
                    </span>

                    <span
                      className={`google-status-badge ${
                        isGoogleLinked
                          ? "linked"
                          : "not-linked"
                      }`}
                    >
                      {isGoogleLinked
                        ? "Google gekoppeld"
                        : "Nog niet gekoppeld"}
                    </span>
                  </div>
                </div>

                <div className="appointment-details">
                  <p>
                    <span
                      className="appointment-detail-icon"
                      aria-hidden="true"
                    >
                      📅 
                    </span>

                    <span>
                      {formatDate(
                        booking
                      )}
                    </span>
                  </p>

                  <p>
                    <span
                      className="appointment-detail-icon"
                      aria-hidden="true"
                    >
                      🕒 
                    </span>

                    <span>
                      {formatTime(
                        booking
                      )}
                    </span>
                  </p>

                  {booking.appointment_type ===
                    "home" &&
                    (booking.customer_address ||
                      booking.location) && (
                      <p>
                        <span
                          className="appointment-detail-icon"
                          aria-hidden="true"
                        >
                          🏠 
                        </span>

                        <span>
                          {booking.customer_address ||
                            booking.location}
                        </span>
                      </p>
                    )}

                  {booking.notes && (
                    <p>
                      <span
                        className="appointment-detail-icon"
                        aria-hidden="true"
                      >
                        📝 
                      </span>

                      <span>
                        {booking.notes}
                      </span>
                    </p>
                  )}
                </div>

                <div className="appointment-actions">
                  {calendarUrl && (
                    <a
                      href={
                        calendarUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="appointment-action calendar"
                    >
                      <span
                        aria-hidden="true"
                      >
                        📅 
                      </span>

                      Open in Google
                      Agenda
                    </a>
                  )}

                  {booking.appointment_type ===
                    "digital" &&
                    meetUrl && (
                      <a
                        href={meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="appointment-action meet"
                      >
                        <span
                          aria-hidden="true"
                        >
                          🎥 
                        </span>

                         Deelnemen via
                        Google Meet
                      </a>
                    )}

                  <button
                    type="button"
                    className="appointment-action cancel"
                    onClick={() =>
                      cancelBooking(
                        booking
                      )
                    }
                    disabled={
                      cancellingId ===
                      booking.id
                    }
                  >
<span aria-hidden="true">
  ✕ 
</span>
                    {cancellingId ===
                    booking.id
                      ? "Annuleren..."
                      : "Afspraak annuleren"}
                  </button>
                </div>
              </article>
            );
          }
        )}
      </div>
    </div>
  );
}