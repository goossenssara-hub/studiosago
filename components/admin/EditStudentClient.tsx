"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import "@/app/styles/admin-student-edit.css";

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
};

function toForm(student: Student): StudentForm {
  return {
    name: student.name ?? "",
    birth_date: student.birth_date ?? "",
    school: student.school ?? "",
    grade: student.grade ?? "",
    education_level: student.education_level ?? "",
    secondary_track: student.secondary_track ?? "",
    finality: student.finality ?? "",
    parent_name: student.parent_name ?? "",
    parent_relation: student.parent_relation ?? "",
    parent_email: student.parent_email ?? "",
    diagnosis: student.diagnosis ?? "",
    support_needs: student.support_needs ?? "",
    goals: student.goals ?? "",
    preferred_subjects: student.preferred_subjects ?? "",
    medical_info: student.medical_info ?? "",
    doctor_name: student.doctor_name ?? "",
    doctor_phone: student.doctor_phone ?? "",
    notes: student.notes ?? "",
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("De server gaf geen geldig antwoord terug.");
  }

  return (await response.json()) as T;
}

export default function EditStudentClient({
  studentId,
}: {
  studentId: string;
}) {
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadStudent() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(
          `/api/admin/students/${encodeURIComponent(studentId)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const data = await readJson<{
          student?: Student;
          error?: string;
        }>(response);

        if (!response.ok || !data.student) {
          throw new Error(
            data.error || "De leerling kon niet geladen worden.",
          );
        }

        setStudent(data.student);
        setForm(toForm(data.student));
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "De leerling kon niet geladen worden.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadStudent();
  }, [studentId]);

  function updateField(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
  }

  async function saveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/admin/students/${encodeURIComponent(studentId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const data = await readJson<{
        student?: Student;
        error?: string;
      }>(response);

      if (!response.ok || !data.student) {
        throw new Error(
          data.error || "De wijzigingen konden niet opgeslagen worden.",
        );
      }

      setStudent(data.student);
      setForm(toForm(data.student));
      setSuccessMessage("De leerlinggegevens zijn opgeslagen.");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "De wijzigingen konden niet opgeslagen worden.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="student-edit-page">
        <div className="student-edit-shell">
          <p>Leerlinggegevens laden...</p>
        </div>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="student-edit-page">
        <div className="student-edit-shell">
          <h1>Leerling niet gevonden</h1>
          <p>{errorMessage || "Deze leerling bestaat niet."}</p>
          <Link href="/admin/leerlingen" className="student-edit-secondary">
            Terug naar leerlingen
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="student-edit-page">
      <div className="student-edit-shell">
        <header className="student-edit-header">
          <div>
            <span className="student-edit-eyebrow">
              Leerlinggegevens
            </span>
            <h1>{student.name} aanpassen</h1>
            <p>
              Pas de leerling-, school-, ouder- en begeleidingsgegevens aan.
            </p>
          </div>

          <Link
            href="/admin/leerlingen"
            className="student-edit-secondary"
          >
            ← Terug naar overzicht
          </Link>
        </header>

        <div
          className={
            student.photo_consent
              ? "student-consent-readonly is-allowed"
              : "student-consent-readonly is-denied"
          }
        >
          <div>
            <strong>Fototoestemming</strong>
            <span>
              {student.photo_consent
                ? "✓ Toestemming gegeven"
                : "Geen toestemming gegeven"}
            </span>
          </div>

          <p>
            Deze toestemming is alleen zichtbaar en kan niet via het
            beheerdersaccount aangepast worden.
          </p>
        </div>

        <form className="student-edit-form" onSubmit={saveStudent}>
          <section className="student-edit-section">
            <div className="student-edit-section-title">
              <span>01</span>
              <div>
                <h2>Gegevens leerling</h2>
                <p>Persoonlijke en schoolgerelateerde informatie.</p>
              </div>
            </div>

            <div className="student-edit-grid">
              <label className="student-edit-field is-wide">
                <span>Volledige naam *</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                />
              </label>

              <label className="student-edit-field">
                <span>Geboortedatum</span>
                <input
                  type="date"
                  name="birth_date"
                  value={form.birth_date}
                  onChange={updateField}
                />
              </label>

              <label className="student-edit-field">
                <span>School</span>
                <input
                  name="school"
                  value={form.school}
                  onChange={updateField}
                />
              </label>

              <label className="student-edit-field">
                <span>Onderwijsniveau *</span>
                <select
                  name="education_level"
                  value={form.education_level}
                  onChange={updateField}
                  required
                >
                  <option value="">Kies onderwijsniveau</option>
                  <option value="kleuter">Kleuteronderwijs</option>
                  <option value="lager">Lager onderwijs</option>
                  <option value="middelbaar">Secundair onderwijs</option>
                  <option value="hoger">Hoger onderwijs</option>
                  <option value="anders">Anders</option>
                </select>
              </label>

              <label className="student-edit-field">
                <span>Leerjaar *</span>
                <input
                  name="grade"
                  value={form.grade}
                  onChange={updateField}
                  required
                />
              </label>

              {form.education_level === "middelbaar" && (
                <>
                  <label className="student-edit-field">
                    <span>Studierichting</span>
                    <input
                      name="secondary_track"
                      value={form.secondary_track}
                      onChange={updateField}
                    />
                  </label>

                  <label className="student-edit-field">
                    <span>Finaliteit</span>
                    <select
                      name="finality"
                      value={form.finality}
                      onChange={updateField}
                    >
                      <option value="">Kies finaliteit</option>
                      <option value="doorstroom">
                        Doorstroomfinaliteit
                      </option>
                      <option value="dubbele">Dubbele finaliteit</option>
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

          <section className="student-edit-section">
            <div className="student-edit-section-title">
              <span>02</span>
              <div>
                <h2>Ouder of voogd</h2>
                <p>De gekoppelde contactpersoon.</p>
              </div>
            </div>

            <div className="student-edit-grid">
              <label className="student-edit-field">
                <span>Naam ouder of voogd</span>
                <input
                  name="parent_name"
                  value={form.parent_name}
                  onChange={updateField}
                />
              </label>

              <label className="student-edit-field">
                <span>Relatie tot leerling</span>
                <select
                  name="parent_relation"
                  value={form.parent_relation}
                  onChange={updateField}
                >
                  <option value="">Kies een relatie</option>
                  <option value="Vader">Vader</option>
                  <option value="Moeder">Moeder</option>
                  <option value="Voogd">Voogd</option>
                  <option value="Plusouder">Plusouder</option>
                  <option value="Andere">Andere</option>
                </select>
              </label>

              <label className="student-edit-field is-wide">
                <span>E-mailadres ouder</span>
                <input
                  type="email"
                  name="parent_email"
                  value={form.parent_email}
                  onChange={updateField}
                />
              </label>
            </div>
          </section>

          <section className="student-edit-section">
            <div className="student-edit-section-title">
              <span>03</span>
              <div>
                <h2>Begeleiding</h2>
                <p>Zorginformatie, ondersteuningsnoden en doelen.</p>
              </div>
            </div>

            <div className="student-edit-grid">
              <label className="student-edit-field is-wide">
                <span>Vakken of leerinhoud</span>
                <textarea
                  name="preferred_subjects"
                  value={form.preferred_subjects}
                  onChange={updateField}
                  rows={3}
                />
              </label>

              <label className="student-edit-field">
                <span>Diagnose of zorginformatie</span>
                <textarea
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={updateField}
                  rows={4}
                />
              </label>

              <label className="student-edit-field">
                <span>Ondersteuningsnoden</span>
                <textarea
                  name="support_needs"
                  value={form.support_needs}
                  onChange={updateField}
                  rows={4}
                />
              </label>

              <label className="student-edit-field is-wide">
                <span>Doelen</span>
                <textarea
                  name="goals"
                  value={form.goals}
                  onChange={updateField}
                  rows={3}
                />
              </label>
            </div>
          </section>

          <section className="student-edit-section">
            <div className="student-edit-section-title">
              <span>04</span>
              <div>
                <h2>Medisch en praktisch</h2>
                <p>Medische informatie en extra notities.</p>
              </div>
            </div>

            <div className="student-edit-grid">
              <label className="student-edit-field is-wide">
                <span>Medische informatie</span>
                <textarea
                  name="medical_info"
                  value={form.medical_info}
                  onChange={updateField}
                  rows={3}
                />
              </label>

              <label className="student-edit-field">
                <span>Naam huisarts</span>
                <input
                  name="doctor_name"
                  value={form.doctor_name}
                  onChange={updateField}
                />
              </label>

              <label className="student-edit-field">
                <span>Telefoon huisarts</span>
                <input
                  type="tel"
                  name="doctor_phone"
                  value={form.doctor_phone}
                  onChange={updateField}
                />
              </label>

              <label className="student-edit-field is-wide">
                <span>Extra notities</span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={updateField}
                  rows={4}
                />
              </label>
            </div>
          </section>

          {errorMessage && (
            <div className="student-edit-message is-error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="student-edit-message is-success">
              {successMessage}
            </div>
          )}

          <div className="student-edit-actions">
            <Link
              href="/admin/leerlingen"
              className="student-edit-secondary"
            >
              Annuleren
            </Link>

            <button
              type="submit"
              className="student-edit-submit"
              disabled={saving}
            >
              {saving ? "Wijzigingen opslaan..." : "Wijzigingen opslaan"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
