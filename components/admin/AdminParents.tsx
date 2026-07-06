"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  parent_email: string;
};

type Parent = {
  email: string;
  students: Student[];
};

export default function AdminParents() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState("");

  async function loadParents() {
    const response = await fetch("/api/admin/parents", {
      cache: "no-store",
    });

    const data = await response.json();

    if (response.ok) {
      setParents(data.parents ?? []);
    } else {
      setMessage(data.error || "Ouders konden niet geladen worden.");
    }
  }

  useEffect(() => {
    loadParents();
  }, []);

  async function deleteParent(email: string) {
    const confirmDelete = window.confirm(
      "Ben je zeker dat je deze ouder én alle gekoppelde leerlingen wilt verwijderen?"
    );

    if (!confirmDelete) return;

    const response = await fetch(
      `/api/admin/parents?email=${encodeURIComponent(email)}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Ouder kon niet verwijderd worden.");
      return;
    }

    setSelectedStudent(null);
    setMessage("Ouder en gekoppelde leerlingen verwijderd.");
    await loadParents();
  }

  async function deleteStudent(studentId: string) {
    const confirmDelete = window.confirm(
      "Ben je zeker dat je deze leerling wilt verwijderen?"
    );

    if (!confirmDelete) return;

    const response = await fetch(`/api/admin/students?id=${studentId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Leerling kon niet verwijderd worden.");
      return;
    }

    setSelectedStudent(null);
    setMessage("Leerling verwijderd.");
    await loadParents();
  }

  return (
    <div className="admin-request-list">
      <div className="admin-request-card">
        <h2>Ouders</h2>
        <p>Klik op een kind om automatisch het leerlingprofiel te openen.</p>

        {message && <p className="form-message">{message}</p>}
      </div>

      {selectedStudent && (
        <div className="admin-request-card">
          <h2>👨‍🎓 {selectedStudent.name}</h2>

          <p>
            <strong>Ouder:</strong> {selectedStudent.parent_email}
          </p>

          <p>
            Hier komt het volledige leerlingprofiel: afspraken, beurtenkaarten,
            notities en begeleiding.
          </p>

          <div className="student-detail-actions">
            <button
              type="button"
              className="secondary-action equal-button"
              onClick={() => setSelectedStudent(null)}
            >
              Sluiten
            </button>

            <button
              type="button"
              className="availability-delete equal-button"
              onClick={() => deleteStudent(selectedStudent.id)}
            >
              Leerling verwijderen
            </button>
          </div>
        </div>
      )}

      {parents.length === 0 && (
        <div className="admin-request-card">
          <p>Er zijn nog geen ouders geregistreerd.</p>
        </div>
      )}

      {parents.map((parent) => (
        <div key={parent.email} className="admin-request-card">
          <div className="admin-card-header">
            <div>
              <h3>👨‍👩‍👧 {parent.email}</h3>
              <p>{parent.students.length} gekoppelde leerling(en)</p>
            </div>

            <button
              type="button"
              className="availability-delete"
              onClick={() => deleteParent(parent.email)}
            >
              Ouder verwijderen
            </button>
          </div>

          {parent.students.length === 0 && <p>Geen leerlingen gekoppeld.</p>}

          <div className="lesson-card-list">
            {parent.students.map((student) => (
              <button
                key={student.id}
                type="button"
                className="student-profile-button"
                onClick={() => setSelectedStudent(student)}
              >
                👨‍🎓 {student.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}