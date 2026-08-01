"use client";

import { useState } from "react";

type Props = {
  requestId: string;
  fileName: string;
  onDeleted?: (requestId: string) => void;
  className?: string;
};

export default function DeleteTextCorrectionRequestButton({
  requestId,
  fileName,
  onDeleted,
  className,
}: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Ben je zeker dat je "${fileName}" definitief wilt verwijderen?\n\nHet document wordt ook uit de beveiligde opslag verwijderd. De betaaltransactie blijft bewaard.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/text-corrections/${encodeURIComponent(requestId)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : { error: await response.text() };

      if (!response.ok) {
        throw new Error(
          result.error || "De aanvraag kon niet worden verwijderd."
        );
      }

      onDeleted?.(requestId);
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "De aanvraag kon niet worden verwijderd."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className={className}
        onClick={handleDelete}
        disabled={deleting}
        aria-busy={deleting}
        style={
          className
            ? undefined
            : {
                minHeight: 48,
                padding: "12px 20px",
                border: "1px solid rgba(180, 35, 24, 0.18)",
                borderRadius: 999,
                background: "rgba(180, 35, 24, 0.08)",
                color: "#b42318",
                font: "inherit",
                fontWeight: 850,
                cursor: deleting ? "wait" : "pointer",
                opacity: deleting ? 0.65 : 1,
              }
        }
      >
        {deleting ? "Verwijderen…" : "Verwijderen"}
      </button>

      {error ? (
        <p
          role="alert"
          style={{
            margin: "10px 0 0",
            color: "#b42318",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
