"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

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

type AppointmentEnhancementsProps = {
  booking: EnhancedBooking;
  isDigital: boolean;
  onChanged?: () => Promise<void> | void;
};

type CountdownTone =
  | "future"
  | "soon"
  | "live"
  | "past";

type CountdownResult = {
  text: string;
  tone: CountdownTone;
};

type UploadResponse = {
  success?: boolean;
  error?: string;
};

type FeedbackResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  appointmentArchived?: boolean;
  appointmentDeleted?: boolean;
  documentsMoved?: number;
};

function clean(
  value: unknown,
): string {
  return String(
    value ?? "",
  ).trim();
}

/**
 * De lokale afspraakdatum en het lokale uur krijgen
 * voorrang op start_time.
 *
 * appointment_date en appointment_time bevatten bij jou
 * bijvoorbeeld 2026-07-18 en 09:00:00.
 *
 * start_time kan als UTC opgeslagen zijn, bijvoorbeeld
 * 2026-07-18T07:00:00+00:00.
 *
 * Door deze velden niet door elkaar te gebruiken,
 * vermijden we dat bovenaan 09:00 staat en bij de duur
 * plots 11:00–12:00 of 13:00–14:00 verschijnt.
 */
function getStartDate(
  booking: EnhancedBooking,
): Date | null {
  const appointmentDate =
    clean(
      booking.appointment_date,
    );

  const appointmentTime =
    clean(
      booking.appointment_time,
    ).slice(
      0,
      5,
    );

  if (
    appointmentDate &&
    appointmentTime
  ) {
    const localStart =
      new Date(
        `${appointmentDate}T${appointmentTime}:00`,
      );

    if (
      !Number.isNaN(
        localStart.getTime(),
      )
    ) {
      return localStart;
    }
  }

  const storedStart =
    clean(
      booking.start_time,
    );

  if (!storedStart) {
    return null;
  }

  const parsedStart =
    new Date(
      storedStart,
    );

  if (
    Number.isNaN(
      parsedStart.getTime(),
    )
  ) {
    return null;
  }

  return parsedStart;
}

/**
 * De duur wordt berekend met de echte start_time
 * en end_time uit Supabase.
 *
 * Alleen het verschil tussen deze twee datums is nodig.
 * Daardoor maakt de tijdzone voor de duur geen verschil.
 */
function getDurationMinutes(
  booking: EnhancedBooking,
): number {
  const storedStart =
    clean(
      booking.start_time,
    );

  const storedEnd =
    clean(
      booking.end_time,
    );

  if (
    storedStart &&
    storedEnd
  ) {
    const parsedStart =
      new Date(
        storedStart,
      );

    const parsedEnd =
      new Date(
        storedEnd,
      );

    if (
      !Number.isNaN(
        parsedStart.getTime(),
      ) &&
      !Number.isNaN(
        parsedEnd.getTime(),
      )
    ) {
      const duration =
        Math.round(
          (
            parsedEnd.getTime() -
            parsedStart.getTime()
          ) /
            60_000,
        );

      if (
        Number.isFinite(
          duration,
        ) &&
        duration > 0
      ) {
        return duration;
      }
    }
  }

  return 60;
}

/**
 * Het weergegeven einduur wordt opgebouwd vanaf dezelfde
 * lokale starttijd als het weergegeven beginuur.
 *
 * Zo krijg je bijvoorbeeld consequent:
 *
 * 09:00
 * 09:00 – 10:00
 * 60 minuten
 */
function getEndDate(
  booking: EnhancedBooking,
): Date | null {
  const start =
    getStartDate(
      booking,
    );

  if (!start) {
    return null;
  }

  const durationMinutes =
    getDurationMinutes(
      booking,
    );

  return new Date(
    start.getTime() +
      durationMinutes *
        60_000,
  );
}

function formatClock(
  date: Date | null,
): string {
  if (!date) {
    return "--:--";
  }

  return date.toLocaleTimeString(
    "nl-BE",
    {
      hour:
        "2-digit",
      minute:
        "2-digit",
      hour12:
        false,
    },
  );
}

function getCountdown(
  start: Date | null,
  end: Date | null,
  now: number,
): CountdownResult {
  if (!start) {
    return {
      text:
        "Starttijd onbekend",
      tone:
        "future",
    };
  }

  const startDifference =
    start.getTime() -
    now;

  const endDifference =
    end
      ? end.getTime() -
        now
      : null;

  if (
    startDifference <= 0 &&
    (
      endDifference === null ||
      endDifference > 0
    )
  ) {
    return {
      text:
        "De afspraak is bezig",
      tone:
        "live",
    };
  }

  if (
    endDifference !== null &&
    endDifference <= 0
  ) {
    return {
      text:
        "Afspraak afgelopen",
      tone:
        "past",
    };
  }

  if (
    startDifference <=
    -90 *
      60_000
  ) {
    return {
      text:
        "Afspraak afgelopen",
      tone:
        "past",
    };
  }

  const totalMinutes =
    Math.max(
      1,
      Math.ceil(
        startDifference /
          60_000,
      ),
    );

  if (
    totalMinutes <= 60
  ) {
    return {
      text:
        `Start binnen ${totalMinutes} ${
          totalMinutes ===
          1
            ? "minuut"
            : "minuten"
        }`,
      tone:
        "soon",
    };
  }

  const totalHours =
    Math.floor(
      totalMinutes /
        60,
    );

  const days =
    Math.floor(
      totalHours /
        24,
    );

  const remainingHours =
    totalHours %
    24;

  if (days > 0) {
    return {
      text: [
        `Start over ${days} ${
          days === 1
            ? "dag"
            : "dagen"
        }`,

        remainingHours >
        0
          ? `en ${remainingHours} ${
              remainingHours ===
              1
                ? "uur"
                : "uur"
            }`
          : "",
      ]
        .filter(
          Boolean,
        )
        .join(
          " ",
        ),

      tone:
        "future",
    };
  }

  return {
    text:
      `Start over ${totalHours} ${
        totalHours === 1
          ? "uur"
          : "uur"
      }`,

    tone:
      "future",
  };
}

function formatFileSize(
  size: number | null,
): string {
  if (
    !size ||
    size <= 0
  ) {
    return "";
  }

  if (
    size < 1024
  ) {
    return `${size} B`;
  }

  if (
    size <
    1024 *
      1024
  ) {
    return `${Math.round(
      size /
        1024,
    )} KB`;
  }

  return `${(
    size /
    (
      1024 *
      1024
    )
  ).toFixed(
    1,
  )} MB`;
}

async function readJsonResponse<T>(
  response: Response,
): Promise<T> {
  const contentType =
    response.headers.get(
      "content-type",
    ) || "";

  if (
    !contentType.includes(
      "application/json",
    )
  ) {
    const responseText =
      await response.text();

    console.error(
      "APPOINTMENT ENHANCEMENTS NON-JSON RESPONSE:",
      responseText,
    );

    throw new Error(
      "De server gaf geen geldig antwoord terug.",
    );
  }

  return (
    await response.json()
  ) as T;
}

export default function AppointmentEnhancements({
  booking,
  isDigital,
  onChanged,
}: AppointmentEnhancementsProps) {
  const [
    now,
    setNow,
  ] = useState(0);

  const [
    uploading,
    setUploading,
  ] = useState(
    false,
  );

  const [
    feedbackRating,
    setFeedbackRating,
  ] = useState(
    booking.feedback
      ?.rating ??
      0,
  );

  const [
    feedbackComment,
    setFeedbackComment,
  ] = useState(
    booking.feedback
      ?.comment ??
      "",
  );

  const [
    savingFeedback,
    setSavingFeedback,
  ] = useState(
    false,
  );

  const [
    message,
    setMessage,
  ] = useState(
    "",
  );

  const start =
    useMemo(
      () =>
        getStartDate(
          booking,
        ),
      [
        booking,
      ],
    );

  const durationMinutes =
    useMemo(
      () =>
        getDurationMinutes(
          booking,
        ),
      [
        booking,
      ],
    );

  const end =
    useMemo(
      () =>
        getEndDate(
          booking,
        ),
      [
        booking,
      ],
    );

  const countdown =
    useMemo<CountdownResult>(
      () => {
        if (now === 0) {
          return {
            text: "Afspraak laden...",
            tone: "future",
          };
        }

        return getCountdown(
          start,
          end,
          now,
        );
      },
      [
        start,
        end,
        now,
      ],
    );

  const appointmentFinished =
    now > 0 &&
    Boolean(
      end,
    ) &&
    now >=
      (
        end?.getTime() ??
        Number.POSITIVE_INFINITY
      );

  const address =
    clean(
      booking.customer_address ||
        booking.location,
    );

  const mapsUrl =
    address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          address,
        )}`
      : "";

  useEffect(
    () => {
      setNow(
        Date.now(),
      );

      const timer =
        window.setInterval(
          () => {
            setNow(
              Date.now(),
            );
          },
          30_000,
        );

      return () => {
        window.clearInterval(
          timer,
        );
      };
    },
    [],
  );

  useEffect(
    () => {
      setFeedbackRating(
        booking.feedback
          ?.rating ??
          0,
      );

      setFeedbackComment(
        booking.feedback
          ?.comment ??
          "",
      );
    },
    [
      booking.feedback,
    ],
  );

  async function uploadFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    if (
      file.size >
      10 *
        1024 *
        1024
    ) {
      setMessage(
        "Een bestand mag maximaal 10 MB groot zijn.",
      );

      return;
    }

    setUploading(
      true,
    );

    setMessage(
      "",
    );

    try {
      const formData =
        new FormData();

      formData.append(
        "bookingId",
        booking.id,
      );

      formData.append(
        "file",
        file,
      );

      const response =
        await fetch(
          "/api/customer/appointments/files",
          {
            method:
              "POST",
            body:
              formData,
          },
        );

      const result =
        await readJsonResponse<UploadResponse>(
          response,
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.error ||
            "Het bestand kon niet worden toegevoegd.",
        );
      }

      setMessage(
        "Bestand toegevoegd.",
      );

      await onChanged?.();
    } catch (
      error
    ) {
      console.error(
        "APPOINTMENT FILE UPLOAD ERROR:",
        error,
      );

      setMessage(
        error instanceof
          Error
          ? error.message
          : "Het bestand kon niet worden toegevoegd.",
      );
    } finally {
      setUploading(
        false,
      );
    }
  }

  async function saveFeedback() {
    if (
      feedbackRating <
        1 ||
      feedbackRating >
        5
    ) {
      setMessage(
        "Kies eerst een score van 1 tot 5 sterren.",
      );

      return;
    }

    setSavingFeedback(
      true,
    );

    setMessage(
      "",
    );

    try {
      const response =
        await fetch(
          "/api/customer/appointments/feedback",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify({
                bookingId:
                  booking.id,

                rating:
                  feedbackRating,

                comment:
                  feedbackComment,
              }),
          },
        );

      const result =
        await readJsonResponse<FeedbackResponse>(
          response,
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.error ||
            "Je feedback kon niet worden opgeslagen.",
        );
      }

      const documentsMoved =
        Math.max(
          0,
          result.documentsMoved ??
            0,
        );

      const documentMessage =
        documentsMoved > 0
          ? `\n\n${documentsMoved} ${
              documentsMoved === 1
                ? "document werd"
                : "documenten werden"
            } bewaard bij Documenten.`
          : "";

      window.alert(
        `Bedankt voor je feedback! ⭐\n\nJe feedback werd opgeslagen en de afspraak wordt uit je overzicht verwijderd.${documentMessage}`,
      );

      try {
        await onChanged?.();
      } catch (refreshError) {
        console.error(
          "APPOINTMENT REFRESH AFTER FEEDBACK ERROR:",
          refreshError,
        );
      }

      window.location.reload();
    } catch (
      error
    ) {
      console.error(
        "APPOINTMENT FEEDBACK ERROR:",
        error,
      );

      setMessage(
        error instanceof
          Error
          ? error.message
          : "Je feedback kon niet worden opgeslagen.",
      );
    } finally {
      setSavingFeedback(
        false,
      );
    }
  }

  return (
    <div className="appointment-experience">
      <div
        className={`appointment-countdown appointment-countdown--${countdown.tone}`}
        aria-live="polite"
      >
        <span aria-hidden="true">
          {countdown.tone ===
          "soon"
            ? "🟢"
            : countdown.tone ===
                "live"
              ? "🔴"
              : countdown.tone ===
                  "past"
                ? "✓"
                : "⏳"}
        </span>

        <strong>
          {countdown.text}
        </strong>
      </div>

      <div className="appointment-extra-grid">
        <div className="appointment-extra-card">
          <span aria-hidden="true">
            👩‍🏫
          </span>

          <div>
            <small>
              Begeleider
            </small>

            <strong>
              {clean(
                booking.instructor_name,
              ) ||
                "Sara Goossens"}
            </strong>
          </div>
        </div>

        <div className="appointment-extra-card">
          <span aria-hidden="true">
            ⏱️
          </span>

          <div>
            <small>
              Duur
            </small>

            <strong>
              {formatClock(
                start,
              )}{" "}
              –{" "}
              {formatClock(
                end,
              )}
            </strong>

            <span>
              {durationMinutes}{" "}
              {durationMinutes ===
              1
                ? "minuut"
                : "minuten"}
            </span>
          </div>
        </div>
      </div>

      {!isDigital &&
        address && (
          <section className="appointment-location-card">
            <div>
              <span aria-hidden="true">
                📍
              </span>

              <div>
                <small>
                  Locatie
                </small>

                <strong>
                  {address}
                </strong>
              </div>
            </div>

            <a
              href={
                mapsUrl
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          </section>
        )}

      <section className="appointment-files">
        <div className="appointment-subheading">
          <div>
            <span aria-hidden="true">
              📎
            </span>

            <div>
              <strong>
                Bestanden
              </strong>

              <p>
                Werkbladen, huiswerk, pdf&apos;s en feedback.
              </p>
            </div>
          </div>

          <label className="appointment-upload-button">
            {uploading
              ? "Uploaden..."
              : "Bestand toevoegen"}

            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              disabled={
                uploading
              }
              onChange={(
                event,
              ) => {
                void uploadFile(
                  event,
                );
              }}
            />
          </label>
        </div>

        {(
          booking.appointment_files ??
          []
        ).length >
        0 ? (
          <div className="appointment-file-list">
            {(
              booking.appointment_files ??
              []
            ).map(
              (
                file,
              ) => (
                <a
                  key={
                    file.id
                  }
                  href={
                    file.file_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="appointment-file"
                >
                  <span aria-hidden="true">
                    📄
                  </span>

                  <span>
                    <strong>
                      {
                        file.file_name
                      }
                    </strong>

                    <small>
                      {formatFileSize(
                        file.size_bytes,
                      )}
                    </small>
                  </span>

                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
              ),
            )}
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
              <span aria-hidden="true">
                📖
              </span>

              <div>
                <strong>
                  Lesverslag
                </strong>

                <p>
                  {booking
                    .lesson_report
                    .report_date
                    ? new Date(
                        `${booking.lesson_report.report_date}T12:00:00`,
                      ).toLocaleDateString(
                        "nl-BE",
                        {
                          day:
                            "numeric",
                          month:
                            "long",
                        },
                      )
                    : "Laatste verslag"}
                </p>
              </div>
            </div>
          </div>

          {(
            booking
              .lesson_report
              .completed_items ??
            []
          ).length >
            0 && (
            <div className="appointment-report-block">
              <strong>
                Geoefend
              </strong>

              <ul>
                {(
                  booking
                    .lesson_report
                    .completed_items ??
                  []
                ).map(
                  (
                    item,
                  ) => (
                    <li
                      key={
                        item
                      }
                    >
                      ✓{" "}
                      {
                        item
                      }
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {(
            booking
              .lesson_report
              .next_steps ??
            []
          ).length >
            0 && (
            <div className="appointment-report-block">
              <strong>
                Volgende keer
              </strong>

              <ul>
                {(
                  booking
                    .lesson_report
                    .next_steps ??
                  []
                ).map(
                  (
                    item,
                  ) => (
                    <li
                      key={
                        item
                      }
                    >
                      →{" "}
                      {
                        item
                      }
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {booking
            .lesson_report
            .general_feedback && (
            <p className="appointment-report-note">
              {
                booking
                  .lesson_report
                  .general_feedback
              }
            </p>
          )}
        </section>
      )}

      {appointmentFinished && (
        <section className="appointment-feedback">
          <div className="appointment-subheading">
            <div>
              <span aria-hidden="true">
                ⭐
              </span>

              <div>
                <strong>
                  Hoe vond je de begeleiding?
                </strong>

                <p>
                  Je feedback helpt Studio SaGo om verder te verbeteren.
                </p>
              </div>
            </div>
          </div>

          <div
            className="appointment-stars"
            role="radiogroup"
            aria-label="Beoordeling"
          >
            {[
              1,
              2,
              3,
              4,
              5,
            ].map(
              (
                rating,
              ) => (
                <button
                  type="button"
                  key={
                    rating
                  }
                  className={
                    rating <=
                    feedbackRating
                      ? "is-selected"
                      : ""
                  }
                  onClick={() =>
                    setFeedbackRating(
                      rating,
                    )
                  }
                  aria-label={`${rating} van 5 sterren`}
                  aria-checked={
                    feedbackRating ===
                    rating
                  }
                  role="radio"
                >
                  ★
                </button>
              ),
            )}
          </div>

          <textarea
            value={
              feedbackComment
            }
            onChange={(
              event,
            ) =>
              setFeedbackComment(
                event.target
                  .value,
              )
            }
            placeholder="Wil je nog iets meegeven? (optioneel)"
            maxLength={
              1000
            }
          />

          <button
            type="button"
            className="appointment-feedback-submit"
            disabled={
              savingFeedback
            }
            onClick={() => {
              void saveFeedback();
            }}
          >
            {savingFeedback
              ? "Opslaan..."
              : "Feedback opslaan"}
          </button>
        </section>
      )}

      {message && (
        <p
          className="appointment-experience-message"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}