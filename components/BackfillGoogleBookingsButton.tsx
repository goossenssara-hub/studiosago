"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

type ApiResponse = {
  success?: boolean;
  results?: BackfillResult[];
  error?: string;
};

type BackfillGoogleBookingsButtonProps = {
  bookingIds: string[];
  label?: string;
};

function clean(
  value: unknown
): string {
  return String(
    value ?? ""
  ).trim();
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
    const responseText =
      await response.text();

    console.error(
      "BACKFILL NON-JSON RESPONSE:",
      responseText
    );

    throw new Error(
      "De server gaf geen geldig antwoord terug."
    );
  }

  return (
    await response.json()
  ) as T;
}

export default function BackfillGoogleBookingsButton({
  bookingIds,
  label,
}: BackfillGoogleBookingsButtonProps) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const validBookingIds =
    Array.from(
      new Set(
        bookingIds
          .map(clean)
          .filter(Boolean)
      )
    );

  async function handleBackfill() {
    if (
      validBookingIds.length ===
      0
    ) {
      setMessage(
        "Er zijn geen afspraken om te koppelen."
      );

      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/customer/appointments/backfill-google",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            cache: "no-store",
            body:
              JSON.stringify({
                bookingIds:
                  validBookingIds,
              }),
          }
        );

      const data =
        await readJsonResponse<ApiResponse>(
          response
        );

      if (!response.ok) {
        throw new Error(
          data.error ||
            "De afspraken konden niet gekoppeld worden."
        );
      }

      const results =
        Array.isArray(
          data.results
        )
          ? data.results
          : [];

      const succeeded =
        results.filter(
          (result) =>
            result.success ===
              true &&
            result.skipped !== true
        );

      const skipped =
        results.filter(
          (result) =>
            result.skipped ===
            true
        );

      const failed =
        results.filter(
          (result) =>
            result.success !==
            true
        );

      if (
        failed.length > 0
      ) {
        const errors =
          failed
            .map(
              (result) =>
                result.error ||
                result.message
            )
            .filter(Boolean)
            .join(" ");

        setMessage(
          [
            `${succeeded.length} gekoppeld.`,
            `${skipped.length} overgeslagen.`,
            `${failed.length} mislukt.`,
            errors,
          ]
            .filter(Boolean)
            .join(" ")
        );

        return;
      }

      setMessage(
        [
          `${succeeded.length} afspraak/afspraken succesvol gekoppeld.`,

          skipped.length > 0
            ? `${skipped.length} afspraak/afspraken waren al gekoppeld.`
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      );

      router.refresh();

      window.setTimeout(
        () => {
          window.location.reload();
        },
        800
      );
    } catch (error) {
      console.error(
        "BACKFILL BUTTON ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Er ging iets mis."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="google-backfill">
      <button
        type="button"
        onClick={() => {
          void handleBackfill();
        }}
        disabled={
          loading ||
          validBookingIds.length ===
            0
        }
        className="primary-action"
      >
        {loading
          ? "Afspraken koppelen..."
          : label ||
            (
              validBookingIds.length ===
              1
                ? "Afspraak koppelen aan Google"
                : `${validBookingIds.length} afspraken koppelen aan Google`
            )}
      </button>

      {message && (
        <p
          className="google-backfill-message"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}