"use client";

import { FormEvent, useState } from "react";
import StudentCredentialsModal from "@/components/admin/StudentCredentialsModal";
import "@/components/admin/StudentCredentialsModal.css";

type Credentials = {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
};

export default function NewStudentFormExample() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: String(formData.get("name") ?? ""),
      parent_email: String(formData.get("parent_email") ?? ""),
      birth_date: String(formData.get("birth_date") ?? "") || null,
      school: String(formData.get("school") ?? "") || null,
      grade: String(formData.get("grade") ?? "") || null,
      photo_consent: formData.get("photo_consent") === "on",
    };

    try {
      const response = await fetch("/api/admin/students/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "De leerling kon niet worden aangemaakt.");
      }

      setCredentials(result.credentials);
      event.currentTarget.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Er ging iets mis."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Volledige naam
          <input name="name" required />
        </label>

        <label>
          E-mailadres ouder
          <input name="parent_email" type="email" required />
        </label>

        <label>
          Geboortedatum
          <input name="birth_date" type="date" />
        </label>

        <label>
          School
          <input name="school" />
        </label>

        <label>
          Klas
          <input name="grade" />
        </label>

        <label>
          <input name="photo_consent" type="checkbox" />
          Toestemming voor foto's
        </label>

        {error ? <p role="alert">{error}</p> : null}

        <button type="submit" disabled={saving}>
          {saving ? "Leerling aanmaken..." : "Leerling aanmaken"}
        </button>
      </form>

      <StudentCredentialsModal
        credentials={credentials}
        onClose={() => setCredentials(null)}
      />
    </>
  );
}
