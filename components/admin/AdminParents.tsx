"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./AdminParents.module.css";

type Student = {
  id: string;
  name: string;
  parent_email: string | null;
  school: string | null;
  grade: string | null;
  education_level: string | null;
  photo_consent: boolean | null;
};

type Parent = {
  email: string;
  name: string;
  students: Student[];
};

type ApiResponse = {
  parents?: Parent[];
  unlinkedStudents?: Student[];
  success?: boolean;
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

function getStudentEducation(student: Student) {
  return (
    clean(student.grade) ||
    clean(student.education_level) ||
    "Leerjaar onbekend"
  );
}

function getStudentSchool(student: Student) {
  return clean(student.school) || "School onbekend";
}

function getParentDisplayName(parent: Parent) {
  const name = clean(parent.name);

  if (
    name &&
    !name.includes("@") &&
    name.toLowerCase() !==
      "naam ouder niet ingevuld"
  ) {
    return name;
  }

  return "Naam ouder niet ingevuld";
}

export default function AdminParents() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [unlinkedStudents, setUnlinkedStudents] =
    useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  const [deletingEmail, setDeletingEmail] =
    useState<string | null>(null);

  const [editingEmail, setEditingEmail] =
    useState<string | null>(null);

  const [savingKey, setSavingKey] =
    useState<string | null>(null);

  const loadParents = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/parents",
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
            "Ouders konden niet geladen worden."
        );
      }

      setParents(data.parents ?? []);
      setUnlinkedStudents(
        data.unlinkedStudents ?? []
      );
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Ouders konden niet geladen worden."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadParents();
  }, [loadParents]);

  const totalStudents = useMemo(
    () =>
      parents.reduce(
        (total, parent) =>
          total + parent.students.length,
        0
      ) + unlinkedStudents.length,
    [parents, unlinkedStudents]
  );

  async function updateParentName(
    event: FormEvent<HTMLFormElement>,
    parent: Parent
  ) {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget
    );

    const name = clean(
      formData.get("parentName")
    );

    setSavingKey(parent.email);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/parents",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "renameParent",
            email: parent.email,
            name,
          }),
        }
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "De oudernaam kon niet aangepast worden."
        );
      }

      setParents((current) =>
        current.map((item) =>
          item.email === parent.email
            ? {
                ...item,
                name,
              }
            : item
        )
      );

      setEditingEmail(null);
      setMessageType("success");
      setMessage("Oudernaam aangepast.");
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "De oudernaam kon niet aangepast worden."
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function assignStudent(
    event: FormEvent<HTMLFormElement>,
    student: Student
  ) {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget
    );

    const parentName = clean(
      formData.get("parentName")
    );

    const parentEmail = clean(
      formData.get("parentEmail")
    );

    setSavingKey(student.id);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/parents",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "assignStudent",
            studentId: student.id,
            parentName,
            parentEmail,
          }),
        }
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "De leerling kon niet gekoppeld worden."
        );
      }

      setMessageType("success");
      setMessage(
        `${student.name} werd aan ${parentName} gekoppeld.`
      );

      await loadParents();
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "De leerling kon niet gekoppeld worden."
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function deleteParent(email: string) {
    const confirmed = window.confirm(
      "Ben je zeker dat je dit ouderaccount wilt verwijderen? De leerlingen blijven bestaan en worden alleen ontkoppeld."
    );

    if (!confirmed) {
      return;
    }

    setDeletingEmail(email);

    try {
      const response = await fetch(
        `/api/admin/parents?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Ouder kon niet verwijderd worden."
        );
      }

      setMessageType("success");
      setMessage(
        "Ouder verwijderd. De leerlingen zijn niet verwijderd."
      );

      await loadParents();
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Ouder kon niet verwijderd worden."
      );
    } finally {
      setDeletingEmail(null);
    }
  }

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <p className={styles.eyebrow}>
            Ouders & leerlingen
          </p>

          <h2>Gezinnenoverzicht</h2>

          <p className={styles.description}>
            Beheer ouderaccounts en koppel leerlingen
            aan het juiste gezin.
          </p>
        </div>

        <div className={styles.headerStats}>
          <div className={styles.statCard}>
            <strong>{parents.length}</strong>
            <span>ouders</span>
          </div>

          <div className={styles.statCard}>
            <strong>{totalStudents}</strong>
            <span>leerlingen</span>
          </div>
        </div>
      </header>

      {message && (
        <div
          className={`${styles.message} ${
            messageType === "error"
              ? styles.errorMessage
              : styles.successMessage
          }`}
        >
          {message}
        </div>
      )}

      {loading && (
        <div className={styles.state}>
          <span className={styles.spinner} />
          <p>Ouderaccounts laden…</p>
        </div>
      )}

      {!loading && (
        <>
          <div className={styles.parentList}>
            {parents.map((parent) => {
              const isEditing =
                editingEmail === parent.email;

              return (
                <article
                  key={parent.email}
                  className={styles.parentCard}
                >
                  <div className={styles.parentHeader}>
                    <div
                      className={styles.parentIdentity}
                    >
                      <span
                        className={styles.parentIcon}
                      >
                        👨‍👩‍👧
                      </span>

                      <div
                        className={styles.parentDetails}
                      >
                        <span
                          className={styles.parentLabel}
                        >
                          Ouderaccount
                        </span>

                        {isEditing ? (
                          <form
                            className={
                              styles.parentNameForm
                            }
                            onSubmit={(event) =>
                              void updateParentName(
                                event,
                                parent
                              )
                            }
                          >
                            <input
                              name="parentName"
                              defaultValue={
                                getParentDisplayName(
                                  parent
                                ) ===
                                "Naam ouder niet ingevuld"
                                  ? ""
                                  : getParentDisplayName(
                                      parent
                                    )
                              }
                              placeholder="Voornaam en naam"
                              autoFocus
                              required
                            />

                            <button
                              type="submit"
                              disabled={
                                savingKey === parent.email
                              }
                            >
                              {savingKey === parent.email
                                ? "Opslaan…"
                                : "Opslaan"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingEmail(null)
                              }
                            >
                              Annuleren
                            </button>
                          </form>
                        ) : (
                          <div
                            className={
                              styles.parentNameRow
                            }
                          >
                            <h3>
                              {getParentDisplayName(
                                parent
                              )}
                            </h3>

                            <button
                              type="button"
                              className={
                                styles.editNameButton
                              }
                              onClick={() =>
                                setEditingEmail(
                                  parent.email
                                )
                              }
                            >
                              ✏️ Naam aanpassen
                            </button>
                          </div>
                        )}

                        <a
                          href={`mailto:${parent.email}`}
                          className={
                            styles.parentEmail
                          }
                        >
                          {parent.email}
                        </a>

                        <p>
                          {parent.students.length} gekoppelde{" "}
                          {parent.students.length === 1
                            ? "leerling"
                            : "leerlingen"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={
                        styles.deleteParentButton
                      }
                      disabled={
                        deletingEmail === parent.email
                      }
                      onClick={() =>
                        void deleteParent(parent.email)
                      }
                    >
                      🗑️{" "}
                      {deletingEmail === parent.email
                        ? "Verwijderen…"
                        : "Ouder verwijderen"}
                    </button>
                  </div>

                  <div className={styles.studentList}>
                    {parent.students.map((student) => (
                      <Link
                        key={student.id}
                        href={`/admin/students/${student.id}/edit`}
                        className={styles.studentCard}
                      >
                        <span
                          className={
                            styles.studentAvatar
                          }
                        >
                          {getInitials(student.name)}
                        </span>

                        <span
                          className={
                            styles.studentInformation
                          }
                        >
                          <strong>
                            {student.name}
                          </strong>
                          <span>
                            {getStudentEducation(student)}
                          </span>
                          <small>
                            {getStudentSchool(student)}
                          </small>
                        </span>

                        <span
                          className={`${styles.consentBadge} ${
                            student.photo_consent
                              ? styles.consentAllowed
                              : styles.consentDenied
                          }`}
                        >
                          {student.photo_consent
                            ? "📷 Foto-toestemming"
                            : "🚫 Geen foto-toestemming"}
                        </span>

                        <span
                          className={styles.openProfile}
                        >
                          Profiel openen
                          <strong>→</strong>
                        </span>
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {unlinkedStudents.length > 0 && (
            <section
              className={styles.unlinkedSection}
            >
              <div
                className={styles.unlinkedHeader}
              >
                <div>
                  <p className={styles.eyebrow}>
                    Actie nodig
                  </p>
                  <h3>
                    Nog niet gekoppelde leerlingen
                  </h3>
                  <p>
                    Victor en Lou verschijnen hier zolang
                    er geen geldig ouderadres is ingevuld.
                  </p>
                </div>

                <strong>
                  {unlinkedStudents.length}
                </strong>
              </div>

              <div
                className={styles.unlinkedGrid}
              >
                {unlinkedStudents.map((student) => (
                  <article
                    key={student.id}
                    className={
                      styles.unlinkedCard
                    }
                  >
                    <div
                      className={
                        styles.unlinkedStudent
                      }
                    >
                      <span
                        className={
                          styles.studentAvatar
                        }
                      >
                        {getInitials(student.name)}
                      </span>

                      <div>
                        <h4>{student.name}</h4>
                        <p>
                          {getStudentEducation(student)}
                          {" · "}
                          {getStudentSchool(student)}
                        </p>
                      </div>
                    </div>

                    <form
                      className={styles.assignForm}
                      onSubmit={(event) =>
                        void assignStudent(
                          event,
                          student
                        )
                      }
                    >
                      <label>
                        Naam ouder
                        <input
                          name="parentName"
                          placeholder="Voornaam en naam"
                          required
                        />
                      </label>

                      <label>
                        E-mailadres ouder
                        <input
                          name="parentEmail"
                          type="email"
                          placeholder="ouder@email.be"
                          required
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={
                          savingKey === student.id
                        }
                      >
                        {savingKey === student.id
                          ? "Koppelen…"
                          : "Leerling koppelen"}
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </section>
  );
}