"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FrenchCertificateSync.module.css";

type Props = {
  completedExercises: number;
  totalExercises: number;
  score: number;
};

type ApiResponse = {
  success?: boolean;
  alreadyExists?: boolean;
  message?: string;
  error?: string;
};

const SESSION_KEY =
  "studiosago:voorbereiding-frans:certificate-requested";

export default function FrenchCertificateSync({
  completedExercises,
  totalExercises,
  score,
}: Props) {
  const requestedRef = useRef(false);
  const [status, setStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const isCompleted =
    totalExercises > 0 &&
    completedExercises === totalExercises &&
    score >= 75;

  useEffect(() => {
    if (!isCompleted || requestedRef.current) {
      return;
    }

    if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
      return;
    }

    requestedRef.current = true;
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setStatus("saving");
    setMessage("Je certificaat wordt aangemaakt…");

    void (async () => {
      try {
        const response = await fetch(
          "/api/student/modules/voorbereiding-frans/complete",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              completed: true,
              completedExercises,
              totalExercises,
              score,
            }),
          }
        );

        const result = (await response.json()) as ApiResponse;

        if (!response.ok || result.success !== true) {
          throw new Error(
            result.error ||
              "Het certificaat kon niet aangemaakt worden."
          );
        }

        setStatus("success");
        setMessage(
          result.message ||
            "Je certificaat staat nu bij je documenten."
        );
      } catch (error) {
        window.sessionStorage.removeItem(SESSION_KEY);
        requestedRef.current = false;
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Het certificaat kon niet aangemaakt worden."
        );
      }
    })();
  }, [
    completedExercises,
    isCompleted,
    score,
    totalExercises,
  ]);

  if (!isCompleted || status === "idle") {
    return null;
  }

  return (
    <aside
      className={`${styles.notice} ${styles[status]}`}
      aria-live="polite"
    >
      <span aria-hidden="true">
        {status === "saving"
          ? "⏳"
          : status === "success"
            ? "🏆"
            : "⚠️"}
      </span>

      <div>
        <strong>
          {status === "saving"
            ? "Certificaat wordt klaargezet"
            : status === "success"
              ? "Certificaat behaald"
              : "Certificaat nog niet opgeslagen"}
        </strong>
        <p>{message}</p>

        {status === "success" && (
          <a href="/dashboard/leerling/documenten">
            Naar mijn documenten →
          </a>
        )}

        {status === "error" && (
          <button
            type="button"
            onClick={() => {
              window.sessionStorage.removeItem(SESSION_KEY);
              window.location.reload();
            }}
          >
            Opnieuw proberen
          </button>
        )}
      </div>
    </aside>
  );
}
