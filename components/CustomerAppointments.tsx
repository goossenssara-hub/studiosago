"use client";

import { useCallback, useEffect, useState } from "react";

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

function formatDate(booking: Booking): string {
  const value =
    booking.appointment_date ||
    booking.start_time;

  if (!value) {
    return "Datum onbekend";
  }

  /*
   * Voor appointment_date voegen we een lokaal uur toe,
   * zodat de datum niet door een tijdzone verschuift.
   */
  const date =
    booking.appointment_date
      ? new Date(
          `${booking.appointment_date}T12:00:00`
        )
      : new Date(value);

  return date.toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(booking: Booking): string {
  if (booking.appointment_time) {
    return booking.appointment_time.slice(0, 5);
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

export default function CustomerAppointments() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [cancellingId, setCancellingId] =
    useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "/api/customer/appointments",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "De server gaf geen geldig antwoord terug."
        );
      }

      const result =
        (await response.json()) as AppointmentsResponse;

      if (!response.ok) {
        throw new Error(
          result.details ||
            result.error ||
            "De afspraken konden niet geladen worden."
        );
      }

      setBookings(
        Array.isArray(result.bookings)
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

  async function cancelBooking(
    booking: Booking
  ) {
    const confirmed = window.confirm(
      "Ben je zeker dat je deze afspraak wilt annuleren?"
    );

    if (!confirmed) return;

    setCancellingId(booking.id);

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
            bookingId: booking.id,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      const result =
        contentType.includes(
          "application/json"
        )
          ? await response.json()
          : {};

      if (!response.ok) {
        throw new Error(
          result.error ||
            "De afspraak kon niet geannuleerd worden."
        );
      }

      setBookings((current) =>
        current.filter(
          (item) =>
            item.id !== booking.id
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
      <p className="appointments-loading">
        Afspraken laden...
      </p>
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

  if (bookings.length === 0) {
    return (
      <p>
        Er staan momenteel geen actieve afspraken
        in je dashboard.
      </p>
    );
  }

  return (
    <div className="agenda-list">
      {bookings.map((booking) => {
        const calendarUrl =
          booking.google_event_url;

        const meetUrl =
          booking.google_meet_url ||
          (
            booking.appointment_type ===
              "digital"
              ? booking.google_event_link
              : null
          );

        return (
          <article
            className="agenda-item"
            key={booking.id}
          >
            <div className="appointment-card-header">
              <div>
                <strong>
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

              <span
                className={`appointment-status-badge ${
                  booking.status ||
                  "unknown"
                }`}
              >
                {booking.status ===
                  "confirmed" && "✓ "}

                {booking.status ===
                  "pending" && "◷ "}

                {translateStatus(
                  booking.status
                )}
              </span>
            </div>

            <div className="appointment-details">
              <p>
                <span>📅</span>
                {formatDate(booking)}
              </p>

              <p>
                <span>🕒</span>
                {formatTime(booking)}
              </p>

              {booking.appointment_type ===
                "home" &&
                (
                  booking.customer_address ||
                  booking.location
                ) && (
                  <p>
                    <span>🏠</span>
                    {booking.customer_address ||
                      booking.location}
                  </p>
                )}

              {booking.notes && (
                <p>
                  <span>📝</span>
                  {booking.notes}
                </p>
              )}
            </div>

            <div className="appointment-actions">
              {calendarUrl && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="appointment-action secondary"
                >
                  Open in Google Agenda
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
                    Deelnemen via Google Meet
                  </a>
                )}

              <button
                type="button"
                className="cancel-bookings"
                onClick={() =>
                  cancelBooking(booking)
                }
                disabled={
                  cancellingId === booking.id
                }
              >
                {cancellingId === booking.id
                  ? "Annuleren..."
                  : "Afspraak annuleren"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}