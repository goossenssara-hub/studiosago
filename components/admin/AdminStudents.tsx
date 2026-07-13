"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

type Student = {
  id: string;
  name: string;
  birth_date: string | null;
  school: string | null;
  grade: string | null;
  education_level: string | null;
  secondary_track: string | null;
  finality: string | null;
  parent_name: string | null;
  parent_relation: string | null;
  parent_email: string | null;
  diagnosis: string | null;
  support_needs: string | null;
  goals: string | null;
  preferred_subjects: string | null;
  medical_info: string | null;
  doctor_name: string | null;
  doctor_phone: string | null;
  notes: string | null;
  photo_consent: boolean | null;
  auth_user_id?: string | null;
  student_email?: string | null;
};

type StudentForm = {
  name: string;
  birth_date: string;
  school: string;
  grade: string;
  education_level: string;
  secondary_track: string;
  finality: string;
  parent_name: string;
  parent_relation: string;
  parent_email: string;
  diagnosis: string;
  support_needs: string;
  goals: string;
  preferred_subjects: string;
  medical_info: string;
  doctor_name: string;
  doctor_phone: string;
  notes: string;
  photo_consent: boolean;
};

const emptyForm: StudentForm = {
  name: "",
  birth_date: "",
  school: "",
  grade: "",
  education_level: "",
  secondary_track: "",
  finality: "",
  parent_name: "",
  parent_relation: "",
  parent_email: "",
  diagnosis: "",
  support_needs: "",
  goals: "",
  preferred_subjects: "",
  medical_info: "",
  doctor_name: "",
  doctor_phone: "",
  notes: "",
  photo_consent: false,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date: string | null) {
  if (!date) return "Niet ingevuld";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}


async function readJsonResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const rawText = await response.text();

    console.error("API gaf geen JSON terug:", {
      status: response.status,
      url: response.url,
      body: rawText.slice(0, 500),
    });

    throw new Error(
      response.status === 404
        ? "De API-route werd niet gevonden."
        : fallbackMessage
    );
  }

  return (await response.json()) as T;
}

export default function AdminStudents() {
  const pathname = usePathname();
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [form, setForm] = useState<StudentForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingAccount, setGeneratingAccount] =
    useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function clearMessageTimer() {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
  }

  function showTemporaryMessage(nextMessage: string) {
    clearMessageTimer();
    setMessage(nextMessage);

    messageTimerRef.current = setTimeout(() => {
      setMessage("");
      messageTimerRef.current = null;
    }, 5 * 60 * 1000);
  }

  async function loadStudents() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/students/create", {
        method: "GET",
        cache: "no-store",
      });

      const data = await readJsonResponse<{
        students?: Student[];
        error?: string;
      }>(
        response,
        "Leerlingen konden niet geladen worden."
      );

      if (!response.ok) {
        throw new Error(
          data.error || "Leerlingen konden niet geladen worden."
        );
      }

      setStudents(
        Array.isArray(data.students) ? data.students : []
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Leerlingen konden niet geladen worden."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    clearMessageTimer();
    setMessage("");
  }, [pathname]);

  useEffect(() => {
    return () => {
      clearMessageTimer();
    };
  }, []);

  useEffect(() => {
    if (!showAddForm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        setShowAddForm(false);
        setForm(emptyForm);
        setErrorMessage("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAddForm, saving]);

  function updateField(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updatePhotoConsent(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setForm((current) => ({
      ...current,
      photo_consent: event.target.checked,
    }));
  }

  function openAddForm() {
    setSelectedStudent(null);

    setForm({
      ...emptyForm,
      name: "Shaniyah Kinsabil",
      grade: "1e middelbaar",
      education_level: "middelbaar",
      parent_name: "Alain Kinsabil",
      parent_relation: "Vader",
    });

    clearMessageTimer();
    setMessage("");
    setErrorMessage("");
    setShowAddForm(true);
  }

  function closeAddForm() {
    if (saving) return;

    setShowAddForm(false);
    setForm(emptyForm);
    setErrorMessage("");
  }

  async function createStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "De leerling kon niet toegevoegd worden."
        );
      }

      setShowAddForm(false);
      setForm(emptyForm);
      showTemporaryMessage(
        `${data.student?.name || "De leerling"} werd toegevoegd.`
      );

      await loadStudents();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "De leerling kon niet toegevoegd worden."
      );
    } finally {
      setSaving(false);
    }
  }

  async function generateStudentAccount(
    student: Student
  ) {
    if (student.auth_user_id || student.student_email) {
      setErrorMessage(
        "Voor deze leerling bestaat al een leerlingaccount."
      );
      return;
    }

    setGeneratingAccount(true);
    setErrorMessage("");
    clearMessageTimer();
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/students/generate-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            studentId: student.id,
          }),
        }
      );

      const data = await readJsonResponse<{
        student?: Student;
        credentials?: {
          name: string;
          email: string;
          password: string;
          loginUrl: string;
        };
        error?: string;
      }>(
        response,
        "Het leerlingaccount kon niet gegenereerd worden."
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Het leerlingaccount kon niet gegenereerd worden."
        );
      }

      if (data.student) {
        setStudents((current) =>
          current.map((item) =>
            item.id === data.student?.id
              ? data.student!
              : item
          )
        );

        setSelectedStudent(data.student);
      }

      if (data.credentials) {
        window.alert(
          [
            "Leerlingaccount succesvol aangemaakt",
            "",
            `Naam: ${data.credentials.name}`,
            `E-mailadres: ${data.credentials.email}`,
            `Wachtwoord: ${data.credentials.password}`,
            `Loginpagina: ${data.credentials.loginUrl}`,
            "",
            "Bewaar deze gegevens. Het wachtwoord wordt alleen nu getoond.",
          ].join("\\n")
        );
      }

      showTemporaryMessage(
        `Het leerlingaccount voor ${student.name} werd aangemaakt.`
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Het leerlingaccount kon niet gegenereerd worden."
      );
    } finally {
      setGeneratingAccount(false);
    }
  }

  async function deleteStudent(studentId: string) {
    const confirmDelete = window.confirm(
      "Ben je zeker dat je deze leerling wilt verwijderen?"
    );

    if (!confirmDelete) return;

    setErrorMessage("");
    clearMessageTimer();
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/students?id=${encodeURIComponent(studentId)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "De leerling kon niet verwijderd worden."
        );
      }

      setSelectedStudent(null);
      showTemporaryMessage("De leerling werd verwijderd.");

      await loadStudents();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "De leerling kon niet verwijderd worden."
      );
    }
  }

  return (
    <div className="admin-request-list">
      <div className="admin-request-card students-page-header">
        <div>
          <h2>Leerlingen</h2>
          <p>
            Overzicht van alle leerlingen die klanten of de
            beheerder hebben toegevoegd.
          </p>
        </div>

        <button
          type="button"
          className="primary-action student-add-button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            openAddForm();
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
          }}
        >
          + Nieuwe leerling
        </button>
      </div>

      {message && (
        <div className="admin-request-card student-success-message">
          <p>{message}</p>
        </div>
      )}

      {errorMessage && (
        <div className="admin-request-card student-error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      {loading && (
        <div className="admin-request-card">
          <p>Laden...</p>
        </div>
      )}

      {!loading &&
        !selectedStudent &&
        students.length === 0 && (
          <div className="admin-request-card">
            <p>Er zijn nog geen leerlingen toegevoegd.</p>
          </div>
        )}

      {!loading &&
        !selectedStudent &&
        students.map((student) => (
          <button
            key={student.id}
            type="button"
            className="student-profile-card"
            onClick={() => {
              setShowAddForm(false);
              setSelectedStudent(student);
            }}
          >
            <div className="student-avatar">
              {getInitials(student.name)}
            </div>

            <div className="student-card-info">
              <strong>{student.name}</strong>

              <span>
                {student.grade || "Leerjaar onbekend"}
              </span>

              <small>
                {student.school || "School onbekend"}
              </small>

              {student.parent_name && (
                <small>
                  {student.parent_relation || "Ouder"}:{" "}
                  {student.parent_name}
                </small>
              )}
            </div>

            <div className="student-photo-status">
              {student.photo_consent ? (
                <>
                  <span className="camera-icon allowed">
                    📷
                  </span>
                  <small>Foto-toestemming</small>
                </>
              ) : (
                <>
                  <span className="camera-icon denied">
                    📷❌
                  </span>
                  <small>Geen foto-toestemming</small>
                </>
              )}
            </div>
          </button>
        ))}

      {selectedStudent && (
        <div className="admin-request-card student-detail-card">
          <div className="student-detail-heading">
            <div className="student-avatar">
              {getInitials(selectedStudent.name)}
            </div>

            <div>
              <h2>{selectedStudent.name}</h2>
              <p>
                {selectedStudent.grade ||
                  "Leerjaar niet ingevuld"}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "16px",
                }}
              >
                {selectedStudent.auth_user_id ||
                selectedStudent.student_email ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: "44px",
                      padding: "10px 16px",
                      borderRadius: "999px",
                      background: "rgba(40, 185, 170, 0.14)",
                      color: "#087f76",
                      fontWeight: 800,
                    }}
                  >
                    ✓ Leerlingaccount actief
                  </span>
                ) : (
                  <button
                    type="button"
                    className="primary-action"
                    onClick={() =>
                      void generateStudentAccount(
                        selectedStudent
                      )
                    }
                    disabled={generatingAccount}
                  >
                    {generatingAccount
                      ? "Account genereren..."
                      : "Account genereren"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="student-detail-grid">
            <section>
              <h3>Leerlingportaal</h3>

              <p>
                <strong>Status:</strong>{" "}
                {selectedStudent.auth_user_id
                  ? "Account actief"
                  : "Nog geen account"}
              </p>

              <p>
                <strong>E-mailadres:</strong>{" "}
                {selectedStudent.student_email ||
                  "Nog niet gegenereerd"}
              </p>
            </section>

            <section>
              <h3>Ouder of voogd</h3>

              <p>
                <strong>Naam:</strong>{" "}
                {selectedStudent.parent_name ||
                  "Niet ingevuld"}
              </p>

              <p>
                <strong>Relatie:</strong>{" "}
                {selectedStudent.parent_relation ||
                  "Niet ingevuld"}
              </p>

              <p>
                <strong>E-mailadres:</strong>{" "}
                {selectedStudent.parent_email ||
                  "Niet ingevuld"}
              </p>
            </section>

            <section>
              <h3>Algemene gegevens</h3>

              <p>
                <strong>Geboortedatum:</strong>{" "}
                {formatDate(selectedStudent.birth_date)}
              </p>

              <p>
                <strong>School:</strong>{" "}
                {selectedStudent.school || "Niet ingevuld"}
              </p>

              <p>
                <strong>Leerjaar:</strong>{" "}
                {selectedStudent.grade || "Niet ingevuld"}
              </p>

              <p>
                <strong>Onderwijsniveau:</strong>{" "}
                {selectedStudent.education_level ||
                  "Niet ingevuld"}
              </p>
            </section>

            {selectedStudent.education_level ===
              "middelbaar" && (
              <section>
                <h3>Secundair onderwijs</h3>

                <p>
                  <strong>Richting:</strong>{" "}
                  {selectedStudent.secondary_track ||
                    "Niet ingevuld"}
                </p>

                <p>
                  <strong>Finaliteit:</strong>{" "}
                  {selectedStudent.finality ||
                    "Niet ingevuld"}
                </p>
              </section>
            )}

            <section>
              <h3>Begeleiding</h3>

              <p>
                <strong>Vakken / leerinhoud:</strong>{" "}
                {selectedStudent.preferred_subjects ||
                  "Niet ingevuld"}
              </p>

              <p>
                <strong>Diagnose / zorginfo:</strong>{" "}
                {selectedStudent.diagnosis ||
                  "Niet ingevuld"}
              </p>

              <p>
                <strong>Ondersteuningsnoden:</strong>{" "}
                {selectedStudent.support_needs ||
                  "Niet ingevuld"}
              </p>

              <p>
                <strong>Doelen:</strong>{" "}
                {selectedStudent.goals || "Niet ingevuld"}
              </p>
            </section>

            <section>
              <h3>Medische informatie</h3>

              <p>
                <strong>Medische info:</strong>{" "}
                {selectedStudent.medical_info ||
                  "Niet ingevuld"}
              </p>

              <p>
                <strong>Huisarts:</strong>{" "}
                {selectedStudent.doctor_name ||
                  "Niet ingevuld"}
              </p>

              <p>
                <strong>Telefoon huisarts:</strong>{" "}
                {selectedStudent.doctor_phone ||
                  "Niet ingevuld"}
              </p>

              <p>
                <strong>Foto-toestemming:</strong>{" "}
                {selectedStudent.photo_consent
                  ? "Ja"
                  : "Nee"}
              </p>
            </section>

            <section>
              <h3>Extra informatie</h3>

              <p>
                <strong>Notities:</strong>{" "}
                {selectedStudent.notes || "Geen notities"}
              </p>
            </section>
          </div>

          <div className="student-detail-actions">
            <button
              type="button"
              className="availability-delete equal-button"
              onClick={() =>
                deleteStudent(selectedStudent.id)
              }
            >
              Leerling verwijderen
            </button>

            <button
              type="button"
              className="secondary-action equal-button"
              onClick={() => setSelectedStudent(null)}
            >
              Terug naar overzicht
            </button>
          </div>
        </div>
      )}

      {portalReady && showAddForm &&
        createPortal(
          <div
          className="student-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddForm();
            }
          }}
        >
          <div
            className="student-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-student-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="student-modal-header">
              <div>
                <span className="student-modal-eyebrow">
                  Nieuwe leerling
                </span>

                <h2 id="add-student-title">
                  Leerling toevoegen
                </h2>

                <p>
                  Vul de gegevens in en sla de leerling
                  rechtstreeks op.
                </p>
              </div>

              <button
                type="button"
                className="student-modal-close"
                onClick={closeAddForm}
                aria-label="Formulier sluiten"
              >
                ×
              </button>
            </div>

            <form
              className="student-form"
              onSubmit={createStudent}
            >
              <section className="student-form-section">
                <div className="student-form-section-heading">
                  <span>01</span>

                  <div>
                    <h3>Gegevens leerling</h3>
                    <p>
                      Naam, geboortedatum en schoolgegevens.
                    </p>
                  </div>
                </div>

                <div className="student-form-grid">
                  <label className="student-form-field student-form-field-wide">
                    <span>Volledige naam *</span>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      placeholder="Bijvoorbeeld Shaniyah Kinsabil"
                      required
                    />
                  </label>

                  <label className="student-form-field">
                    <span>Geboortedatum</span>

                    <input
                      type="date"
                      name="birth_date"
                      value={form.birth_date}
                      onChange={updateField}
                    />
                  </label>

                  <label className="student-form-field">
                    <span>School</span>

                    <input
                      type="text"
                      name="school"
                      value={form.school}
                      onChange={updateField}
                      placeholder="Naam van de school"
                    />
                  </label>

                  <label className="student-form-field">
                    <span>Onderwijsniveau *</span>

                    <select
                      name="education_level"
                      value={form.education_level}
                      onChange={updateField}
                      required
                    >
                      <option value="">
                        Kies onderwijsniveau
                      </option>

                      <option value="kleuter">
                        Kleuteronderwijs
                      </option>

                      <option value="lager">
                        Lager onderwijs
                      </option>

                      <option value="middelbaar">
                        Secundair onderwijs
                      </option>

                      <option value="hoger">
                        Hoger onderwijs
                      </option>

                      <option value="anders">Anders</option>
                    </select>
                  </label>

                  <label className="student-form-field">
                    <span>Leerjaar *</span>

                    <input
                      type="text"
                      name="grade"
                      value={form.grade}
                      onChange={updateField}
                      placeholder="Bijvoorbeeld 1e middelbaar"
                      required
                    />
                  </label>

                  {form.education_level === "middelbaar" && (
                    <>
                      <label className="student-form-field">
                        <span>Studierichting</span>

                        <input
                          type="text"
                          name="secondary_track"
                          value={form.secondary_track}
                          onChange={updateField}
                          placeholder="Bijvoorbeeld STEM"
                        />
                      </label>

                      <label className="student-form-field">
                        <span>Finaliteit</span>

                        <select
                          name="finality"
                          value={form.finality}
                          onChange={updateField}
                        >
                          <option value="">
                            Kies finaliteit
                          </option>

                          <option value="doorstroom">
                            Doorstroomfinaliteit
                          </option>

                          <option value="dubbele">
                            Dubbele finaliteit
                          </option>

                          <option value="arbeidsmarkt">
                            Arbeidsmarktfinaliteit
                          </option>

                          <option value="nog-niet-van-toepassing">
                            Nog niet van toepassing
                          </option>
                        </select>
                      </label>
                    </>
                  )}
                </div>
              </section>

              <section className="student-form-section">
                <div className="student-form-section-heading">
                  <span>02</span>

                  <div>
                    <h3>Ouder of voogd</h3>
                    <p>
                      De contactpersoon die aan de leerling
                      gekoppeld wordt.
                    </p>
                  </div>
                </div>

                <div className="student-form-grid">
                  <label className="student-form-field">
                    <span>Naam ouder of voogd *</span>

                    <input
                      type="text"
                      name="parent_name"
                      value={form.parent_name}
                      onChange={updateField}
                      placeholder="Bijvoorbeeld Alain Kinsabil"
                      required
                    />
                  </label>

                  <label className="student-form-field">
                    <span>Relatie tot leerling</span>

                    <select
                      name="parent_relation"
                      value={form.parent_relation}
                      onChange={updateField}
                    >
                      <option value="">
                        Kies een relatie
                      </option>

                      <option value="Vader">Vader</option>
                      <option value="Moeder">Moeder</option>
                      <option value="Voogd">Voogd</option>
                      <option value="Plusouder">
                        Plusouder
                      </option>
                      <option value="Andere">Andere</option>
                    </select>
                  </label>

                  <label className="student-form-field student-form-field-wide">
                    <span>E-mailadres ouder</span>

                    <input
                      type="email"
                      name="parent_email"
                      value={form.parent_email}
                      onChange={updateField}
                      placeholder="naam@voorbeeld.be"
                    />

                    <small>
                      Laat leeg wanneer de ouder nog geen
                      e-mailadres of account heeft.
                    </small>
                  </label>
                </div>
              </section>

              <section className="student-form-section">
                <div className="student-form-section-heading">
                  <span>03</span>

                  <div>
                    <h3>Begeleiding</h3>
                    <p>
                      Informatie die relevant is voor de
                      ondersteuning.
                    </p>
                  </div>
                </div>

                <div className="student-form-grid">
                  <label className="student-form-field student-form-field-wide">
                    <span>Vakken of leerinhoud</span>

                    <textarea
                      name="preferred_subjects"
                      value={form.preferred_subjects}
                      onChange={updateField}
                      rows={3}
                      placeholder="Bijvoorbeeld Nederlands, wiskunde en leren plannen"
                    />
                  </label>

                  <label className="student-form-field">
                    <span>Diagnose of zorginformatie</span>

                    <textarea
                      name="diagnosis"
                      value={form.diagnosis}
                      onChange={updateField}
                      rows={4}
                      placeholder="Optionele informatie"
                    />
                  </label>

                  <label className="student-form-field">
                    <span>Ondersteuningsnoden</span>

                    <textarea
                      name="support_needs"
                      value={form.support_needs}
                      onChange={updateField}
                      rows={4}
                      placeholder="Waarmee moet rekening gehouden worden?"
                    />
                  </label>

                  <label className="student-form-field student-form-field-wide">
                    <span>Doelen</span>

                    <textarea
                      name="goals"
                      value={form.goals}
                      onChange={updateField}
                      rows={3}
                      placeholder="Welke doelen wil de leerling bereiken?"
                    />
                  </label>
                </div>
              </section>

              <section className="student-form-section">
                <div className="student-form-section-heading">
                  <span>04</span>

                  <div>
                    <h3>Medisch en praktisch</h3>
                    <p>
                      Medische informatie, notities en
                      foto-toestemming.
                    </p>
                  </div>
                </div>

                <div className="student-form-grid">
                  <label className="student-form-field student-form-field-wide">
                    <span>Medische informatie</span>

                    <textarea
                      name="medical_info"
                      value={form.medical_info}
                      onChange={updateField}
                      rows={3}
                      placeholder="Allergieën, medicatie of andere belangrijke informatie"
                    />
                  </label>

                  <label className="student-form-field">
                    <span>Naam huisarts</span>

                    <input
                      type="text"
                      name="doctor_name"
                      value={form.doctor_name}
                      onChange={updateField}
                      placeholder="Naam huisarts"
                    />
                  </label>

                  <label className="student-form-field">
                    <span>Telefoon huisarts</span>

                    <input
                      type="tel"
                      name="doctor_phone"
                      value={form.doctor_phone}
                      onChange={updateField}
                      placeholder="+32 ..."
                    />
                  </label>

                  <label className="student-form-field student-form-field-wide">
                    <span>Extra notities</span>

                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={updateField}
                      rows={3}
                      placeholder="Andere informatie die nuttig kan zijn"
                    />
                  </label>

                  <label className="student-consent-field student-form-field-wide">
                    <input
                      type="checkbox"
                      checked={form.photo_consent}
                      onChange={updatePhotoConsent}
                    />

                    <span>
                      <strong>
                        Toestemming voor foto&apos;s
                      </strong>

                      <small>
                        De ouder of voogd geeft toestemming
                        voor het maken en gebruiken van
                        foto&apos;s.
                      </small>
                    </span>
                  </label>
                </div>
              </section>

              {errorMessage && (
                <div className="student-form-error">
                  {errorMessage}
                </div>
              )}

              <div className="student-form-actions">
                <button
                  type="button"
                  className="secondary-action equal-button"
                  onClick={closeAddForm}
                  disabled={saving}
                >
                  Annuleren
                </button>

                <button
                  type="submit"
                  className="primary-action equal-button"
                  disabled={saving}
                >
                  {saving
                    ? "Leerling opslaan..."
                    : "Leerling toevoegen"}
                </button>
              </div>
            </form>
          </div>
        </div>,
          document.body
        )}
    </div>
  );
}