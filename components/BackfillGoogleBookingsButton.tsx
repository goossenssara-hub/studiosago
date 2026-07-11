"use client";

import { useState } from "react";

const bookingIds = [
  "d1d9592a-52e3-4af6-b995-26baf460a531",
  "c5d56f2c-de25-4a89-aeaa-5c2fa2ef757b",
];

type BackfillResult = {
  bookingId?: string;
  success?: boolean;
  skipped?: boolean;
  message?: string;
  error?: string;
  googleEventUrl?: string | null;
  googleMeetUrl?: string | null;
};

type ApiResponse = {
  success?: boolean;
  results?: BackfillResult[];
  error?: string;
};

export default function BackfillGoogleBookingsButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleBackfill() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/customer/appointments/backfill-google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingIds,
          }),
        }
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "De afspraken konden niet met Google Agenda gekoppeld worden."
        );
      }

      const results = Array.isArray(data.results)
        ? data.results
        : [];

      const succeeded = results.filter(
        (result) => result.success && !result.skipped
      ).length;

      const skipped = results.filter(
        (result) => result.skipped
      ).length;

      const failed = results.filter(
        (result) => !result.success
      );

      if (failed.length > 0) {
        setMessage(
          `${succeeded} afspraak/afspraken gekoppeld, ${skipped} overgeslagen en ${failed.length} mislukt. ${failed
            .map((result) => result.error)
            .filter(Boolean)
            .join(" ")}`
        );

        return;
      }

      setMessage(
        `${succeeded} afspraak/afspraken succesvol gekoppeld aan Google Agenda.${
          skipped > 0
            ? ` ${skipped} afspraak/afspraken waren al gekoppeld.`
            : ""
        }`
      );
    } catch (error) {
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
        onClick={handleBackfill}
        disabled={loading}
        className="primary-action"
      >
        {loading
          ? "Afspraken koppelen..."
          : "Bestaande afspraken koppelen aan Google Agenda"}
      </button>

      {message && (
        <p className="google-backfill-message">
          {message}
        </p>
      )}
    </div>
  );
}