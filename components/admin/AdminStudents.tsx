"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  birth_date: string | null;
  school: string | null;
  grade: string | null;
  education_level: string | null;
  secondary_track: string | null;
  finality: string | null;
  parent_email: string;
  diagnosis: string | null;
  support_needs: string | null;
  goals: string | null;
  preferred_subjects: string | null;
  medical_info: string | null;
  doctor_name: string | null;
  doctor_phone: string | null;
  notes: string | null;
  photo_consent: boolean | null;
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

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStudents() {
    setLoading(true);

    const response = await fetch("/api/admin/students", {
      cache: "no-store",
    });

    const data = await response.json();

    if (response.ok) {
      setStudents(data.students ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function deleteStudent(studentId: string) {
    const confirmDelete = window.confirm(
      "Ben je zeker dat je deze leerling wilt verwijderen?"
    );

    if (!confirmDelete) return;

    const response = await fetch(`/api/admin/students?id=${studentId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setSelectedStudent(null);
      await loadStudents();
    }
  }

  return (
    <div className="admin-request-list">
      <div className="admin-request-card">
        <h2>Leerlingen</h2>
        <p>Overzicht van alle leerlingen die klanten hebben ingevuld.</p>
      </div>

      {loading && (
        <div className="admin-request-card">
          <p>Laden...</p>
        </div>
      )}

      {!loading && students.length === 0 && (
        <div className="admin-request-card">
          <p>Er zijn nog geen leerlingen toegevoegd.</p>
        </div>
      )}

      {!selectedStudent &&
        students.map((student) => (
          <button
            key={student.id}
            type="button"
            className="student-profile-card"
            onClick={() => setSelectedStudent(student)}
          >
            <div className="student-avatar">{getInitials(student.name)}</div>

            <div className="student-card-info">
              <strong>{student.name}</strong>
              <span>{student.grade || "Leerjaar onbekend"}</span>
              <small>{student.school || "School onbekend"}</small>
            </div>

            <div className="student-photo-status">
              {student.photo_consent ? (
                <>
                  <span className="camera-icon allowed">📷</span>
                  <small>Foto-toestemming</small>
                </>
              ) : (
                <>
                  <span className="camera-icon denied">📷❌</span>
                  <small>Geen foto-toestemming</small>
                </>
              )}
            </div>
          </button>
        ))}

      {selectedStudent && (
        <div className="admin-request-card">
          <h2>👨‍🎓 {selectedStudent.name}</h2>

          <p>
            <strong>Ouder:</strong> {selectedStudent.parent_email}
          </p>
          <p>
            <strong>Geboortedatum:</strong>{" "}
            {selectedStudent.birth_date || "Niet ingevuld"}
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
            {selectedStudent.education_level || "Niet ingevuld"}
          </p>

          {selectedStudent.education_level === "middelbaar" && (
            <>
              <p>
                <strong>Richting:</strong>{" "}
                {selectedStudent.secondary_track || "Niet ingevuld"}
              </p>
              <p>
                <strong>Finaliteit:</strong>{" "}
                {selectedStudent.finality || "Niet ingevuld"}
              </p>
            </>
          )}

          <hr />

          <p>
            <strong>Vakken / leerinhoud:</strong>{" "}
            {selectedStudent.preferred_subjects || "Niet ingevuld"}
          </p>
          <p>
            <strong>Diagnose / zorginfo:</strong>{" "}
            {selectedStudent.diagnosis || "Niet ingevuld"}
          </p>
          <p>
            <strong>Ondersteuningsnoden:</strong>{" "}
            {selectedStudent.support_needs || "Niet ingevuld"}
          </p>
          <p>
            <strong>Doelen:</strong>{" "}
            {selectedStudent.goals || "Niet ingevuld"}
          </p>

          <hr />

          <p>
            <strong>Medische info:</strong>{" "}
            {selectedStudent.medical_info || "Niet ingevuld"}
          </p>
          <p>
            <strong>Huisarts:</strong>{" "}
            {selectedStudent.doctor_name || "Niet ingevuld"}
          </p>
          <p>
            <strong>Telefoon huisarts:</strong>{" "}
            {selectedStudent.doctor_phone || "Niet ingevuld"}
          </p>
          <p>
            <strong>Foto-toestemming:</strong>{" "}
            {selectedStudent.photo_consent ? "Ja" : "Nee"}
          </p>

          <hr />

          <p>
            <strong>Extra notities:</strong>{" "}
            {selectedStudent.notes || "Geen notities"}
          </p>

          <div className="student-detail-actions">
            <button
              type="button"
              className="availability-delete equal-button"
              onClick={() => deleteStudent(selectedStudent.id)}
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
    </div>
  );
}