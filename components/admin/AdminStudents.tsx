"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./AdminStudents.module.css";

type Student = {
  id: string;
  name: string;
  school: string | null;
  grade: string | null;
  education_level: string | null;
  parent_email: string | null;
  photo_consent: boolean | null;
};

type ApiResponse = {
  students?: Student[];
  error?: string;
};

async function readJsonSafely(
  response: Response
): Promise<ApiResponse> {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as ApiResponse;
  } catch {
    return {};
  }
}

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function getInitials(name: string) {
  return clean(name)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getEducationLabel(student: Student) {
  return (
    clean(student.grade) ||
    clean(student.education_level) ||
    "Leerjaar onbekend"
  );
}

function getSchoolLabel(student: Student) {
  return clean(student.school) || "School onbekend";
}

function getParentLabel(student: Student) {
  const email = clean(student.parent_email);

  if (
    !email ||
    email.toLowerCase().includes(
      "vul_hier_het_oudermailadres_in"
    )
  ) {
    return "Niet gekoppeld";
  }

  return email;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/students",
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Leerlingen konden niet geladen worden."
        );
      }

      setStudents(data.students ?? []);
    } catch (error) {
      console.error("LOAD STUDENTS ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Leerlingen konden niet geladen worden."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const consentCount = useMemo(
    () =>
      students.filter(
        (student) => student.photo_consent === true
      ).length,
    [students]
  );

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <p className={styles.eyebrow}>
            Leerlingen
          </p>

          <h2>Leerlingenoverzicht</h2>

          <p className={styles.headerDescription}>
            Open een leerling om schoolgegevens en
            begeleiding aan te passen.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.stats}>
            <div>
              <strong>{students.length}</strong>
              <span>leerlingen</span>
            </div>

            <div>
              <strong>{consentCount}</strong>
              <span>foto-toestemming</span>
            </div>
          </div>

          <Link
            href="/admin/students/new"
            className={styles.addButton}
          >
            <span aria-hidden="true">+</span>
            Nieuwe leerling
          </Link>
        </div>
      </header>

      {message && (
        <p className={styles.message}>
          {message}
        </p>
      )}

      {loading ? (
        <div className={styles.state}>
          Leerlingen laden…
        </div>
      ) : students.length === 0 ? (
        <div className={styles.state}>
          Er zijn nog geen leerlingen.
        </div>
      ) : (
        <div className={styles.list}>
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/admin/students/${student.id}/edit`}
              className={styles.studentCard}
            >
              <span className={styles.avatar}>
                {getInitials(student.name)}
              </span>

              <span className={styles.details}>
                <strong>{student.name}</strong>

                <span>
                  {getEducationLabel(student)}
                </span>

                <small>
                  {getSchoolLabel(student)}
                </small>
              </span>

              <span className={styles.parentInfo}>
                <small>Ouder</small>

                <strong>
                  {getParentLabel(student)}
                </strong>
              </span>

              <span
                className={`${styles.consent} ${
                  student.photo_consent
                    ? styles.allowed
                    : styles.denied
                }`}
              >
                <span aria-hidden="true">
                  {student.photo_consent
                    ? "📷"
                    : "🚫"}
                </span>

                <strong>
                  {student.photo_consent
                    ? "Foto-toestemming"
                    : "Geen foto-toestemming"}
                </strong>
              </span>

              <span
                className={styles.arrow}
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}