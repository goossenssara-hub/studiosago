"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

export type AppointmentFile = {
  id: string;
  file_name: string;
  file_url: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export type AppointmentFeedback = {
  rating: number;
  comment: string | null;
  created_at: string;
};

export type LessonReport = {
  id: string;
  report_date: string | null;
  completed_items: string[];
  next_steps: string[];
  general_feedback: string | null;
};

export type EnhancedBooking = {
  id: string;
  start_time: string | null;
  end_time: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  appointment_type: string | null;
  customer_address: string | null;
  location: string | null;
  instructor_name?: string | null;
  appointment_files?: AppointmentFile[];
  lesson_report?: LessonReport | null;
  feedback?: AppointmentFeedback | null;
};

type Props = {
  booking: EnhancedBooking;
  isDigital: boolean;
  onChanged?: () => Promise<void> | void;
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function getStartDate(booking: EnhancedBooking): Date | null {
  const raw =
    clean(booking.start_time) ||
    (booking.appointment_date && booking.appointment_time
      ? `${booking.appointment_date}T${clean(booking.appointment_time).slice(0, 5)}:00`
      : "");

  if (!raw) return null;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getEndDate(booking: EnhancedBooking): Date | null {
  if (clean(booking.end_time)) {
    const parsed = new Date(clean(booking.end_time));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const start = getStartDate(booking);
  return start ? new Date(start.getTime() + 60 * 60 * 1000) : null;
}

function formatClock(date: Date | null): string {
  if (!date) return "--:--";

  return date.toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCountdown(start: Date | null, now: number): {
  text: string;
  tone: "future" | "soon" | "live" | "past";
} {
  if (!start) {
    return {
      text: "Starttijd onbekend",
      tone: "future",
    };
  }

  const difference = start.getTime() - now;
  const minutes = Math.ceil(Math.abs(difference) / 60_000);

  if (difference <= 0 && difference > -90 * 60_000) {
    return {
      text: "De afspraak is bezig of net gestart",
      tone: "live",
    };
  }

  if (difference <= -90 * 60_000) {
    return {
      text: "Afspraak afgelopen",
      tone: "past",
    };
  }

  if (minutes <= 60) {
    return {
      text: `Start binnen ${minutes} ${minutes === 1 ? "minuut" : "minuten"}`,
      tone: "soon",
    };
  }

  const totalHours = Math.floor(minutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    return {
      text: `Start over ${days} ${days === 1 ? "dag" : "dagen"}${
        hours > 0 ? ` en ${hours} ${hours === 1 ? "uur" : "uur"}` : ""
      }`,
      tone: "future",
    };
  }

  return {
    text: `Start over ${totalHours} ${totalHours === 1 ? "uur" : "uur"}`,
    tone: "future",
  };
}

function formatFileSize(size: number | null): string {
  if (!size || size <= 0) return "";

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function readJson<T>(response: Response): Promise<T> {
  const type = response.headers.get("content-type") || "";

  if (!type.includes("application/json")) {
    throw new Error("De server gaf geen geldig antwoord terug.");
  }

  return (await response.json()) as T;
}

export default function AppointmentEnhancements({
  booking,
  isDigital,
  onChanged,
}: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [uploading, setUploading] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(
    booking.feedback?.rating ?? 0,
  );
  const [feedbackComment, setFeedbackComment] = useState(
    booking.feedback?.comment ?? "",
  );
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [message, setMessage] = useState("");

  const start = useMemo(() => getStartDate(booking), [booking]);
  const end = useMemo(() => getEndDate(booking), [booking]);

  const countdown = useMemo(
    () => getCountdown(start, now),
    [start, now],
  );

  const durationMinutes =
    start && end
      ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000))
      : 60;

  const appointmentFinished =
    Boolean(end) && Date.now() >= (end?.getTime() ?? Number.POSITIVE_INFINITY);

  const address = clean(booking.customer_address || booking.location);
  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : "";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Een bestand mag maximaal 10 MB groot zijn.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("bookingId", booking.id);
      formData.append("file", file);

      const response = await fetch("/api/customer/appointments/files", {
        method: "POST",
        body: formData,
      });

      const result = await readJson<{
        success?: boolean;
        error?: string;
      }>(response);

      if (!response.ok || result.success !== true) {
        throw new Error(result.error || "Het bestand kon niet worden toegevoegd.");
      }

      setMessage("Bestand toegevoegd.");
      await onChanged?.();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Het bestand kon niet worden toegevoegd.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function saveFeedback() {
    if (feedbackRating < 1 || feedbackRating > 5) {
      setMessage("Kies eerst een score van 1 tot 5 sterren.");
      return;
    }

    setSavingFeedback(true);
    setMessage("");

    try {
      const response = await fetch("/api/customer/appointments/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          rating: feedbackRating,
          comment: feedbackComment,
        }),
      });

      const result = await readJson<{
        success?: boolean;
        error?: string;
      }>(response);

      if (!response.ok || result.success !== true) {
        throw new Error(result.error || "Je feedback kon niet worden opgeslagen.");
      }

      setMessage("Bedankt! Je feedback werd opgeslagen.");
      await onChanged?.();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Je feedback kon niet worden opgeslagen.",
      );
    } finally {
      setSavingFeedback(false);
    }
  }

  return (
    <div className="appointment-experience">
      <div
        className={`appointment-countdown appointment-countdown--${countdown.tone}`}
        aria-live="polite"
      >
        <span aria-hidden="true">
          {countdown.tone === "soon"
            ? "🟢"
            : countdown.tone === "live"
              ? "🔴"
              : countdown.tone === "past"
                ? "✓"
                : "⏳"}
        </span>
        <strong>{countdown.text}</strong>
      </div>

      <div className="appointment-extra-grid">
        <div className="appointment-extra-card">
          <span aria-hidden="true">👩‍🏫</span>
          <div>
            <small>Begeleider</small>
            <strong>{clean(booking.instructor_name) || "Sara Goossens"}</strong>
          </div>
        </div>

        <div className="appointment-extra-card">
          <span aria-hidden="true">⏱️</span>
          <div>
            <small>Duur</small>
            <strong>
              {formatClock(start)} – {formatClock(end)}
            </strong>
            <span>{durationMinutes} minuten</span>
          </div>
        </div>
      </div>

      {!isDigital && address && (
        <section className="appointment-location-card">
          <div>
            <span aria-hidden="true">📍</span>
            <div>
              <small>Locatie</small>
              <strong>{address}</strong>
            </div>
          </div>

          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </section>
      )}

      <section className="appointment-files">
        <div className="appointment-subheading">
          <div>
            <span aria-hidden="true">📎</span>
            <div>
              <strong>Bestanden</strong>
              <p>Werkbladen, huiswerk, pdf’s en feedback.</p>
            </div>
          </div>

          <label className="appointment-upload-button">
            {uploading ? "Uploaden..." : "Bestand toevoegen"}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              disabled={uploading}
              onChange={(event) => {
                void uploadFile(event);
              }}
            />
          </label>
        </div>

        {(booking.appointment_files ?? []).length > 0 ? (
          <div className="appointment-file-list">
            {(booking.appointment_files ?? []).map((file) => (
              <a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="appointment-file"
              >
                <span aria-hidden="true">📄</span>
                <span>
                  <strong>{file.file_name}</strong>
                  <small>{formatFileSize(file.size_bytes)}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="appointment-empty-inline">
            Er zijn nog geen bestanden toegevoegd.
          </p>
        )}
      </section>

      {booking.lesson_report && (
        <section className="appointment-report">
          <div className="appointment-subheading">
            <div>
              <span aria-hidden="true">📖</span>
              <div>
                <strong>Lesverslag</strong>
                <p>
                  {booking.lesson_report.report_date
                    ? new Date(
                        `${booking.lesson_report.report_date}T12:00:00`,
                      ).toLocaleDateString("nl-BE", {
                        day: "numeric",
                        month: "long",
                      })
                    : "Laatste verslag"}
                </p>
              </div>
            </div>
          </div>

          {(booking.lesson_report.completed_items ?? []).length > 0 && (
            <div className="appointment-report-block">
              <strong>Geoefend</strong>
              <ul>
                {booking.lesson_report.completed_items.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {(booking.lesson_report.next_steps ?? []).length > 0 && (
            <div className="appointment-report-block">
              <strong>Volgende keer</strong>
              <ul>
                {booking.lesson_report.next_steps.map((item) => (
                  <li key={item}>→ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {booking.lesson_report.general_feedback && (
            <p className="appointment-report-note">
              {booking.lesson_report.general_feedback}
            </p>
          )}
        </section>
      )}

      {appointmentFinished && (
        <section className="appointment-feedback">
          <div className="appointment-subheading">
            <div>
              <span aria-hidden="true">⭐</span>
              <div>
                <strong>Hoe vond je de begeleiding?</strong>
                <p>Je feedback helpt Studio SaGo om verder te verbeteren.</p>
              </div>
            </div>
          </div>

          <div
            className="appointment-stars"
            role="radiogroup"
            aria-label="Beoordeling"
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                type="button"
                key={rating}
                className={rating <= feedbackRating ? "is-selected" : ""}
                onClick={() => setFeedbackRating(rating)}
                aria-label={`${rating} van 5 sterren`}
                aria-checked={feedbackRating === rating}
                role="radio"
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={feedbackComment}
            onChange={(event) => setFeedbackComment(event.target.value)}
            placeholder="Wil je nog iets meegeven? (optioneel)"
            maxLength={1000}
          />

          <button
            type="button"
            className="appointment-feedback-submit"
            disabled={savingFeedback}
            onClick={() => {
              void saveFeedback();
            }}
          >
            {savingFeedback ? "Opslaan..." : "Feedback opslaan"}
          </button>
        </section>
      )}

      {message && (
        <p className="appointment-experience-message" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}
