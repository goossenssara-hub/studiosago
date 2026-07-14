"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./StudentDocuments.module.css";

type StudentDocument = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  mime_type: string;
  score: number | null;
  module_slug: string | null;
  created_at: string;
};

type DocumentsResponse = {
  success?: boolean;
  documents?: StudentDocument[];
  error?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function StudentDocuments() {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/student/documents", {
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const result = (await response.json()) as DocumentsResponse;

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error || "Documenten konden niet geladen worden."
        );
      }

      setDocuments(result.documents ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Documenten konden niet geladen worden."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  if (loading) {
    return <div className={styles.state}>Documenten laden…</div>;
  }

  if (error) {
    return (
      <div className={styles.state}>
        <p>{error}</p>
        <button type="button" onClick={() => void loadDocuments()}>
          Opnieuw laden
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={styles.state}>
        <span aria-hidden="true">📄</span>
        <h2>Nog geen documenten</h2>
        <p>
          Certificaten en andere leerlingdocumenten verschijnen hier
          automatisch.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {documents.map((document) => (
        <article className={styles.card} key={document.id}>
          <div className={styles.icon} aria-hidden="true">
            {document.category === "certificaat" ? "🏆" : "📄"}
          </div>

          <div className={styles.content}>
            <span className={styles.category}>
              {document.category}
            </span>
            <h2>{document.title}</h2>

            {document.description && (
              <p>{document.description}</p>
            )}

            <div className={styles.meta}>
              <span>{formatDate(document.created_at)}</span>
              {typeof document.score === "number" && (
                <strong>{document.score}%</strong>
              )}
            </div>

            <a
              className={styles.openButton}
              href={`/api/student/documents/${document.id}/download`}
              target="_blank"
              rel="noreferrer"
            >
              Open document →
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
