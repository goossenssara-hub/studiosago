"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AppointmentEnhancements, { AppointmentFile, AppointmentFeedback, LessonReport } from "@/components/AppointmentEnhancements";

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

  instructor_name?: string | null;
  appointment_files?: AppointmentFile[];
  lesson_report?: LessonReport | null;
  feedback?: AppointmentFeedback | null;
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

type CancelBookingResponse = {
  success?: boolean;
  error?: string;
  message?: string;

  slotReleased?: boolean;
  slotReleaseMessage?: string | null;

  googleEventDeleted?: boolean;
  googleEventDeleteSkipped?: boolean;
  googleDeleteMessage?: string | null;

  lessonRestored?: boolean;
  lessonRestoreMessage?: string | null;
};

type Notice = {
  type: "success" | "error";
  title: string;
  messages: string[];
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeText(value: unknown): string {
  return clean(value).toLowerCase();
}

function isMeetUrl(value: unknown): boolean {
  const url = normalizeText(value);

  return url.includes("meet.google.com") || url.includes("hangouts.google.com");
}

function isDigitalBooking(booking: Booking): boolean {
  const value = normalizeText(
    [booking.appointment_type, booking.title].filter(Boolean).join(" "),
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

function isHomeBooking(booking: Booking): boolean {
  const value = normalizeText(
    [booking.appointment_type, booking.title].filter(Boolean).join(" "),
  );

  return (
    value.includes("home") ||
    value.includes("huis") ||
    value.includes("fysiek") ||
    value.includes("aan huis")
  );
}

function getMeetUrl(booking: Booking): string | null {
  if (isMeetUrl(booking.google_meet_url)) {
    return clean(booking.google_meet_url);
  }

  if (isMeetUrl(booking.google_event_link)) {
    return clean(booking.google_event_link);
  }

  return null;
}

function getCalendarUrl(booking: Booking): string | null {
  if (clean(booking.google_event_url)) {
    return clean(booking.google_event_url);
  }

  /*
   * Oude records kunnen de Agenda-link
   * in google_event_link hebben.
   */
  if (
    clean(booking.google_event_link) &&
    !isMeetUrl(booking.google_event_link)
  ) {
    return clean(booking.google_event_link);
  }

  return null;
}

function formatDate(booking: Booking): string {
  const value = booking.appointment_date || booking.start_time;

  if (!value) {
    return "Datum onbekend";
  }

  const date = booking.appointment_date
    ? new Date(`${booking.appointment_date}T12:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Datum onbekend";
  }

  return date.toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(booking: Booking): string {
  if (booking.appointment_time) {
    return String(booking.appointment_time).slice(0, 5);
  }

const start = booking.start_time
const end = booking.end_time

  if (booking.start_time) {
    const parsedDate = new Date(booking.start_time);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleTimeString("nl-BE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return String(booking.start_time).slice(0, 5);
  }

  return "Tijdstip onbekend";
}

function translateStatus(status: string | null): string {
  switch (normalizeText(status)) {
    case "confirmed":
    case "approved":
      return "Afspraak bevestigd";

    case "pending":
      return "Afspraak in behandeling";

    case "cancelled":
    case "canceled":
      return "Afspraak geannuleerd";

    default:
      return "Afspraak";
  }
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const responseText = await response.text();

    console.error("NON JSON RESPONSE:", responseText);

    throw new Error("De server gaf geen geldig antwoord terug.");
  }

  return (await response.json()) as T;
}

export default function CustomerAppointments() {
  const [mounted, setMounted] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [syncingBookingId, setSyncingBookingId] = useState<string | null>(null);

  const [syncingAll, setSyncingAll] = useState(false);

  const [syncMessage, setSyncMessage] = useState("");

  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const [notice, setNotice] = useState<Notice | null>(null);

  const activeBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const status = normalizeText(booking.status);

        return status !== "cancelled" && status !== "canceled";
      }),
    [bookings],
  );

  const incompleteGoogleBookings = useMemo(
    () =>
      activeBookings.filter((booking) => {
        const isDigital = isDigitalBooking(booking);

        const hasEvent = Boolean(clean(booking.google_event_id));

        const hasMeetLink = Boolean(getMeetUrl(booking));

        return !hasEvent || (isDigital && !hasMeetLink);
      }),
    [activeBookings],
  );

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/customer/appointments", {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await readJsonResponse<AppointmentsResponse>(response);

      if (!response.ok || result.success === false) {
        throw new Error(
          result.details ||
            result.error ||
            "De afspraken konden niet geladen worden.",
        );
      }

      setBookings(Array.isArray(result.bookings) ? result.bookings : []);
    } catch (error) {
      console.error("LOAD CUSTOMER APPOINTMENTS ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "De afspraken konden niet geladen worden.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (!bookingToCancel) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBookingToCancel(null);
      }
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(".sago-modal-backdrop")
        ?.scrollTo({ top: 0, behavior: "auto" });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [bookingToCancel]);

  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(() => {
      setNotice(null);
    }, 6500);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function syncBookingIds(
    bookingIds: string[],
  ): Promise<BackfillResult[]> {
    const validBookingIds = Array.from(
      new Set(bookingIds.map(clean).filter(Boolean)),
    );

    if (validBookingIds.length === 0) {
      throw new Error("Er zijn geen afspraken om te koppelen.");
    }

    const response = await fetch("/api/customer/appointments/backfill-google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        bookingIds: validBookingIds,
      }),
    });

    const result = await readJsonResponse<BackfillResponse>(response);

    if (!response.ok) {
      throw new Error(
        result.error ||
          "De afspraak kon niet aan Google Agenda gekoppeld worden.",
      );
    }

    const results = Array.isArray(result.results) ? result.results : [];

    const failed = results.filter((item) => item.success !== true);

    if (failed.length > 0) {
      const failureMessage = failed
        .map((item) => item.error || item.message)
        .filter(Boolean)
        .join(" ");

      throw new Error(
        failureMessage ||
          "Een of meerdere afspraken konden niet gekoppeld worden.",
      );
    }

    return results;
  }

  async function syncSingleBooking(booking: Booking) {
    setSyncingBookingId(booking.id);

    setSyncMessage("");

    try {
      const results = await syncBookingIds([booking.id]);

      const result = results.find((item) => item.bookingId === booking.id);

      setSyncMessage(
        result?.message ||
          (isDigitalBooking(booking)
            ? "De Google Meet-link werd succesvol aangemaakt."
            : "De afspraak werd aan Google Agenda gekoppeld."),
      );

      await loadBookings();
    } catch (error) {
      console.error("SYNC SINGLE GOOGLE BOOKING ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "De afspraak kon niet gekoppeld worden.";

      setSyncMessage(message);

      setNotice({
        type: "error",
        title: "Google-koppeling mislukt",
        messages: [message],
      });
    } finally {
      setSyncingBookingId(null);
    }
  }

  async function syncExistingBookings() {
    if (incompleteGoogleBookings.length === 0) {
      setSyncMessage(
        "Alle afspraken zijn volledig gekoppeld aan Google Agenda.",
      );

      return;
    }

    setSyncingAll(true);
    setSyncMessage("");

    try {
      const results = await syncBookingIds(
        incompleteGoogleBookings.map((booking) => booking.id),
      );

      const succeeded = results.filter(
        (item) => item.success === true && item.skipped !== true,
      ).length;

      const skipped = results.filter((item) => item.skipped === true).length;

      setSyncMessage(
        [
          `${succeeded} afspraak/afspraken succesvol gekoppeld.`,

          skipped > 0
            ? `${skipped} afspraak/afspraken waren al volledig gekoppeld.`
            : "",
        ]
          .filter(Boolean)
          .join(" "),
      );

      await loadBookings();
    } catch (error) {
      console.error("SYNC GOOGLE BOOKINGS ERROR:", error);

      setSyncMessage(
        error instanceof Error
          ? error.message
          : "De afspraken konden niet gekoppeld worden.",
      );
    } finally {
      setSyncingAll(false);
    }
  }

  async function cancelBooking(booking: Booking) {
    setCancellingId(booking.id);

    try {
      const response = await fetch("/api/cancel-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      });

      const result = await readJsonResponse<CancelBookingResponse>(response);

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error ||
            result.message ||
            "De afspraak kon niet geannuleerd worden.",
        );
      }

      setBookings((current) =>
        current.filter((item) => item.id !== booking.id),
      );

      const messages = [
        "Je afspraak werd geannuleerd.",

        result.slotReleased
          ? "Het tijdstip is opnieuw beschikbaar."
          : result.slotReleaseMessage ||
            "Het tijdstip kon niet automatisch worden vrijgegeven.",

        result.googleEventDeleted
          ? result.googleEventDeleteSkipped
            ? "Er was geen actief Google Agenda-item meer."
            : "De afspraak werd uit Google Agenda verwijderd."
          : result.googleDeleteMessage ||
            "De afspraak kon niet automatisch uit Google Agenda verwijderd worden.",

        result.lessonRestored
          ? "De beurt werd terug toegevoegd aan je beurtenkaart."
          : result.lessonRestoreMessage ||
            "De beurt werd niet terug toegevoegd.",
      ];

      setBookingToCancel(null);

      setNotice({
        type: "success",
        title: "Afspraak geannuleerd",
        messages,
      });

      await loadBookings();
    } catch (error) {
      console.error("CANCEL BOOKING ERROR:", error);

      setNotice({
        type: "error",
        title: "Annuleren mislukt",
        messages: [
          error instanceof Error
            ? error.message
            : "Er ging iets mis bij het annuleren.",
        ],
      });
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <div className="appointments-loading">
        <span className="appointments-spinner" />

        <p>Afspraken laden...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="appointments-error">
        <p>{errorMessage}</p>

        <button type="button" onClick={() => void loadBookings()}>
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (activeBookings.length === 0) {
    return (
      <div className="appointments-empty">
        <p>Er staan momenteel geen actieve afspraken in je dashboard.</p>
      </div>
    );
  }

  return (
    <div className="customer-appointments">
      {incompleteGoogleBookings.length > 1 && (
        <section className="google-sync-card">
          <div className="google-sync-content">
            <span className="google-sync-icon" aria-hidden="true">
              📅
            </span>

            <div>
              <strong>Google-koppelingen aanvullen</strong>

              <p>
                Er zijn {incompleteGoogleBookings.length} afspraken die nog niet
                volledig gekoppeld zijn.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="google-sync-button"
            onClick={() => {
              void syncExistingBookings();
            }}
            disabled={syncingAll || Boolean(syncingBookingId)}
          >
            {syncingAll ? "Afspraken koppelen..." : "Alles koppelen"}
          </button>
        </section>
      )}

      {syncMessage && (
        <p className="google-sync-message" aria-live="polite">
          {syncMessage}
        </p>
      )}

      <div className="agenda-list">
        {activeBookings.map((booking) => {
          const isDigital = isDigitalBooking(booking);

          const isHome = isHomeBooking(booking);

          const meetUrl = getMeetUrl(booking);

          const calendarUrl = getCalendarUrl(booking);

          const hasGoogleEvent = Boolean(
            clean(booking.google_event_id) || calendarUrl,
          );

          const isFullyLinked = isDigital
            ? Boolean(hasGoogleEvent && meetUrl)
            : hasGoogleEvent;

          const normalizedStatus = normalizeText(booking.status);

          const isSyncingThis = syncingBookingId === booking.id;

          return (
            <article className="agenda-item" key={booking.id}>
              <div className="appointment-card-header">
                <div className="appointment-title-block">
                  <strong className="appointment-title">
                    {booking.title ||
                      (isDigital
                        ? "Digitale studiebegeleiding"
                        : "Studiebegeleiding aan huis")}
                  </strong>

                  <p className="appointment-type-label">
                    {isDigital
                      ? "💻 Digitale begeleiding"
                      : isHome
                        ? "🏠 Begeleiding aan huis"
                        : "📚 Studiebegeleiding"}
                  </p>
                </div>

                <div className="appointment-badges">
                  <span
                    className={`appointment-status-badge ${
                      booking.status || "unknown"
                    }`}
                  >
                    {(normalizedStatus === "confirmed" ||
                      normalizedStatus === "approved") &&
                      "✓ "}

                    {normalizedStatus === "pending" && "◷ "}

                    {translateStatus(booking.status)}
                  </span>

                  <span
                    className={`google-status-badge ${
                      isFullyLinked ? "linked" : "not-linked"
                    }`}
                  >
                    {isFullyLinked
                      ? isDigital
                        ? "Google Meet gekoppeld"
                        : "Google gekoppeld"
                      : isDigital && hasGoogleEvent
                        ? "Meet-link ontbreekt"
                        : "Nog niet gekoppeld"}
                  </span>
                </div>
              </div>

              <div className="appointment-details">
                <p>
                  <span className="appointment-detail-icon" aria-hidden="true">
                    📅
                  </span>

                  <span>{formatDate(booking)}</span>
                </p>

                <p>
                  <span className="appointment-detail-icon" aria-hidden="true">
                    🕒
                  </span>

                  <span>{formatTime(booking)}</span>
                </p>

                {isHome && (booking.customer_address || booking.location) && (
                  <p>
                    <span
                      className="appointment-detail-icon"
                      aria-hidden="true"
                    >
                      🏠
                    </span>

                    <span>{booking.customer_address || booking.location}</span>
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

                    <span>{booking.notes}</span>
                  </p>
                )}
              </div>

              <AppointmentEnhancements
                booking={booking}
                isDigital={isDigital}
                onChanged={loadBookings}
              />

              <div className="appointment-actions">
                {calendarUrl && (
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="appointment-action calendar"
                  >
                    <span aria-hidden="true">📅</span>
                    Open in Google Agenda
                  </a>
                )}

                {isDigital && meetUrl && (
                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="appointment-action meet"
                  >
                    <span aria-hidden="true">🎥</span>
                    Deelnemen via Google Meet
                  </a>
                )}

                {(!hasGoogleEvent || (isDigital && !meetUrl)) && (
                  <button
                    type="button"
                    className="appointment-action meet"
                    onClick={() => {
                      void syncSingleBooking(booking);
                    }}
                    disabled={isSyncingThis || syncingAll}
                  >
                    <span aria-hidden="true">🎥</span>

                    {isSyncingThis
                      ? "Google koppelen..."
                      : isDigital && hasGoogleEvent
                        ? "Google Meet-link maken"
                        : isDigital
                          ? "Google Meet koppelen"
                          : "Google Agenda koppelen"}
                  </button>
                )}

                <button
                  type="button"
                  className="appointment-action cancel"
                  onClick={() => {
                    setBookingToCancel(booking);
                  }}
                  disabled={cancellingId === booking.id || isSyncingThis}
                >
                  <span aria-hidden="true">✕</span>

                  {cancellingId === booking.id
                    ? "Annuleren..."
                    : "Afspraak annuleren"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {mounted && bookingToCancel &&
        createPortal(
        <div
          className="sago-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setBookingToCancel(null);
            }
          }}
        >
          <section
            className="sago-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            aria-describedby="cancel-booking-description"
          >
            <button
              type="button"
              className="sago-modal-close"
              aria-label="Venster sluiten"
              onClick={() => setBookingToCancel(null)}
              disabled={cancellingId === bookingToCancel.id}
            >
              ×
            </button>

            <div className="sago-modal-icon" aria-hidden="true">
              !
            </div>
            <p className="sago-modal-eyebrow">Bevestiging nodig</p>
            <h2 id="cancel-booking-title">Afspraak annuleren?</h2>
            <p id="cancel-booking-description" className="sago-modal-intro">
              Ben je zeker dat je deze afspraak wilt annuleren?
            </p>

            <div className="sago-modal-booking">
              <p>
                <span aria-hidden="true">📅</span>
                <strong>{formatDate(bookingToCancel)}</strong>
              </p>
              <p>
                <span aria-hidden="true">🕒</span>
                <strong>{formatTime(bookingToCancel)}</strong>
              </p>
              <p>
                <span aria-hidden="true">
                  {isDigitalBooking(bookingToCancel) ? "💻" : "🏠"}
                </span>
                <strong>
                  {isDigitalBooking(bookingToCancel)
                    ? "Digitale begeleiding"
                    : "Begeleiding aan huis"}
                </strong>
              </p>
            </div>

            <div className="sago-modal-warning">
              <span aria-hidden="true">ℹ️</span>
              <p>
                Bij annulatie minder dan 72 uur vooraf wordt de beurt niet terug
                toegevoegd aan je beurtenkaart.
              </p>
            </div>

            <div className="sago-modal-actions">
              <button
                type="button"
                className="sago-modal-button sago-modal-button--secondary"
                onClick={() => setBookingToCancel(null)}
                disabled={cancellingId === bookingToCancel.id}
              >
                Terug
              </button>

              <button
                type="button"
                className="sago-modal-button sago-modal-button--danger"
                onClick={() => void cancelBooking(bookingToCancel)}
                disabled={cancellingId === bookingToCancel.id}
              >
                {cancellingId === bookingToCancel.id
                  ? "Annuleren..."
                  : "Ja, annuleer afspraak"}
              </button>
            </div>
          </section>
        </div>
      ,
          document.body,
        )}

      {notice && (
        <div
          className={`sago-toast sago-toast--${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <div className="sago-toast-icon" aria-hidden="true">
            {notice.type === "success" ? "✓" : "!"}
          </div>
          <div className="sago-toast-content">
            <strong>{notice.title}</strong>
            {notice.messages.map((message, index) => (
              <p key={`${message}-${index}`}>{message}</p>
            ))}
          </div>
          <button
            type="button"
            className="sago-toast-close"
            aria-label="Melding sluiten"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
