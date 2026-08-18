"use client";

import { FormEvent, useMemo, useState } from "react";

export type PremiumMessage = {
  id: string;
  sender_role: "customer" | "admin";
  message: string;
  created_at: string;
};

export type PremiumAppointmentData = {
  bookingId: string;
  instructorName: string;
  instructorPhotoUrl: string | null;
  usedCredits: number | null;
  totalCredits: number | null;
  remainingCredits: number | null;
  homework: string[];
  nextAppointment: {
    id: string;
    start_time: string | null;
    appointment_date: string | null;
    appointment_time: string | null;
    appointment_type: string | null;
  } | null;
  paymentStatus: "paid" | "open" | "pending" | "refunded" | "unknown";
  invoiceUrl: string | null;
  molliePaymentId: string | null;
  messages: PremiumMessage[];
};

type Props = {
  bookingId: string;
  startTime: string | null;
  endTime: string | null;
  title: string;
  location: string | null;
  description: string | null;
  premium: PremiumAppointmentData | null;
  onRefresh?: () => Promise<void> | void;
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function formatDateTime(value: string | null): string {
  if (!value) return "Nog niet gepland";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Nog niet gepland";
  }

  return date.toLocaleString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProgress(
  used: number | null,
  total: number | null,
): number {
  if (!total || total <= 0 || used === null) return 0;

  return Math.min(100, Math.max(0, Math.round((used / total) * 100)));
}

function paymentLabel(status: PremiumAppointmentData["paymentStatus"]): string {
  switch (status) {
    case "paid":
      return "Betaald";
    case "open":
      return "Openstaand";
    case "pending":
      return "In verwerking";
    case "refunded":
      return "Terugbetaald";
    default:
      return "Niet beschikbaar";
  }
}

export default function AppointmentPremiumPanel({
  bookingId,
  startTime,
  endTime,
  title,
  location,
  description,
  premium,
  onRefresh,
}: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const passProgress = useMemo(
    () =>
      getProgress(
        premium?.usedCredits ?? null,
        premium?.totalCredits ?? null,
      ),
    [premium],
  );

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = clean(message);

    if (!trimmedMessage) {
      setStatusMessage("Schrijf eerst een bericht.");
      return;
    }

    setSending(true);
    setStatusMessage("");

    try {
      const response = await fetch(
        "/api/customer/appointments/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            bookingId,
            message: trimmedMessage,
          }),
        },
      );

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error || "Je bericht kon niet worden verzonden.",
        );
      }

      setMessage("");
      setStatusMessage("Je bericht werd verzonden.");
      await onRefresh?.();
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Je bericht kon niet worden verzonden.",
      );
    } finally {
      setSending(false);
    }
  }

  const appleCalendarUrl =
    `/api/customer/appointments/calendar?bookingId=${encodeURIComponent(
      bookingId,
    )}&provider=apple`;

  const outlookCalendarUrl =
    `/api/customer/appointments/calendar?bookingId=${encodeURIComponent(
      bookingId,
    )}&provider=outlook`;

  return (
    <section className="appointment-premium-panel">
      <div className="appointment-premium-grid">
        <article className="appointment-premium-card appointment-instructor-card">
          <div className="appointment-instructor-avatar">
            {premium?.instructorPhotoUrl ? (
              <img
                src={premium.instructorPhotoUrl}
                alt={premium.instructorName}
              />
            ) : (
              <span aria-hidden="true">👩‍🏫</span>
            )}
          </div>

          <div>
            <small>Begeleider</small>
            <strong>
              {premium?.instructorName || "Sara Goossens"}
            </strong>
            <span>Studio SaGo</span>
          </div>
        </article>

        <article className="appointment-premium-card">
          <div className="appointment-premium-heading">
            <span aria-hidden="true">🎫</span>
            <div>
              <small>Beurtenkaart</small>
              <strong>
                {premium?.remainingCredits !== null &&
                premium?.remainingCredits !== undefined
                  ? `${premium.remainingCredits} beurten resterend`
                  : "Geen beurtenkaart gekoppeld"}
              </strong>
            </div>
          </div>

          {premium?.totalCredits ? (
            <>
              <div
                className="appointment-pass-progress"
                aria-label={`${passProgress}% gebruikt`}
              >
                <span style={{ width: `${passProgress}%` }} />
              </div>

              <p>
                {premium.usedCredits ?? 0}/{premium.totalCredits} beurten gebruikt
              </p>
            </>
          ) : null}
        </article>
      </div>

      <article className="appointment-premium-card appointment-homework-card">
        <div className="appointment-premium-heading">
          <span aria-hidden="true">📚</span>
          <div>
            <small>Huiswerk</small>
            <strong>Voor de volgende begeleiding</strong>
          </div>
        </div>

        {(premium?.homework ?? []).length > 0 ? (
          <ul>
            {(premium?.homework ?? []).map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        ) : (
          <p>Er werd nog geen huiswerk toegevoegd.</p>
        )}
      </article>

      <article className="appointment-premium-card appointment-next-card">
        <div className="appointment-premium-heading">
          <span aria-hidden="true">📅</span>
          <div>
            <small>Volgende afspraak</small>
            <strong>
              {premium?.nextAppointment
                ? formatDateTime(
                    premium.nextAppointment.start_time ||
                      (
                        premium.nextAppointment.appointment_date &&
                        premium.nextAppointment.appointment_time
                          ? `${premium.nextAppointment.appointment_date}T${premium.nextAppointment.appointment_time}`
                          : null
                      ),
                  )
                : "Nog geen volgende afspraak gepland"}
            </strong>
          </div>
        </div>
      </article>

      <article className="appointment-premium-card appointment-payment-card">
        <div className="appointment-premium-heading">
          <span aria-hidden="true">💳</span>
          <div>
            <small>Betaling</small>
            <strong>
              {paymentLabel(premium?.paymentStatus ?? "unknown")}
            </strong>
          </div>
        </div>

        <div className="appointment-payment-actions">
          {premium?.invoiceUrl && (
            <a
              href={premium.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Factuur bekijken
            </a>
          )}

          {premium?.molliePaymentId && (
            <span>
              Referentie: {premium.molliePaymentId}
            </span>
          )}
        </div>
      </article>

      <article className="appointment-premium-card appointment-calendar-card">
        <div className="appointment-premium-heading">
          <span aria-hidden="true">🗓️</span>
          <div>
            <small>Agenda</small>
            <strong>Voeg deze afspraak toe</strong>
          </div>
        </div>

        <div className="appointment-calendar-actions">
          <a href={appleCalendarUrl}>
            Apple Agenda
          </a>

          <a href={outlookCalendarUrl}>
            Outlook
          </a>
        </div>
      </article>

      <article className="appointment-premium-card appointment-chat-card">
        <div className="appointment-premium-heading">
          <span aria-hidden="true">💬</span>
          <div>
            <small>Berichten</small>
            <strong>Vraag iets over deze afspraak</strong>
          </div>
        </div>

        <div className="appointment-message-list">
          {(premium?.messages ?? []).length > 0 ? (
            premium?.messages.map((item) => (
              <div
                key={item.id}
                className={`appointment-message appointment-message--${item.sender_role}`}
              >
                <strong>
                  {item.sender_role === "admin"
                    ? "Studio SaGo"
                    : "Jij"}
                </strong>
                <p>{item.message}</p>
                <time>
                  {new Date(item.created_at).toLocaleString("nl-BE", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            ))
          ) : (
            <p className="appointment-empty-inline">
              Er zijn nog geen berichten bij deze afspraak.
            </p>
          )}
        </div>

        <form
          className="appointment-message-form"
          onSubmit={(event) => {
            void sendMessage(event);
          }}
        >
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Schrijf je bericht..."
            maxLength={2000}
          />

          <button type="submit" disabled={sending}>
            {sending ? "Verzenden..." : "Bericht verzenden"}
          </button>
        </form>

        {statusMessage && (
          <p className="appointment-experience-message">
            {statusMessage}
          </p>
        )}
      </article>
    </section>
  );
}
