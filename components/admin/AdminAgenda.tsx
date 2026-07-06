"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lesson = {
  id: string;
  title: string | null;
  student_name: string | null;
  parent_name: string | null;
  email: string | null;
  phone: string | null;
  lesson_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  lesson_type: string | null;
  status: string | null;
  notes: string | null;
};

export default function AdminAgenda() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [message, setMessage] = useState("");

  async function loadLessons() {
    if (!supabase) {
      setMessage("Supabase is niet geconfigureerd.");
      return;
    }

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .order("lesson_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("LESSONS LOAD ERROR:", error);
      setMessage("Agenda kon niet geladen worden.");
      return;
    }

    setLessons(data ?? []);
  }

  useEffect(() => {
    loadLessons();
  }, []);

  async function addLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase is niet geconfigureerd.");
      return;
    }

    const form = new FormData(event.currentTarget);

    const { error } = await supabase.from("lessons").insert({
      title: String(form.get("title") || ""),
      student_name: String(form.get("student_name") || ""),
      parent_name: String(form.get("parent_name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      lesson_date: String(form.get("lesson_date") || ""),
      start_time: String(form.get("start_time") || ""),
      end_time: String(form.get("end_time") || ""),
      location: String(form.get("location") || ""),
      lesson_type: String(form.get("lesson_type") || ""),
      status: "planned",
      notes: String(form.get("notes") || ""),
    });

    if (error) {
      console.error("LESSON INSERT ERROR:", error);
      setMessage("Les kon niet worden toegevoegd.");
      return;
    }

    setMessage("Les toegevoegd.");
    event.currentTarget.reset();
    await loadLessons();
  }

  async function deleteLesson(id: string) {
    if (!supabase) {
      setMessage("Supabase is niet geconfigureerd.");
      return;
    }

    const { error } = await supabase.from("lessons").delete().eq("id", id);

    if (error) {
      console.error("LESSON DELETE ERROR:", error);
      setMessage("Les kon niet verwijderd worden.");
      return;
    }

    setMessage("Les verwijderd.");
    await loadLessons();
  }

  return (
    <section className="table-card">
      <p className="eyebrow">Agenda</p>
      <h2>Lessen en afspraken</h2>

      <form className="admin-agenda-form" onSubmit={addLesson}>
        <input
          name="title"
          placeholder="Titel bv. Huiswerkbegeleiding"
          required
        />
        <input name="student_name" placeholder="Naam leerling" />
        <input name="parent_name" placeholder="Naam ouder" />
        <input name="email" type="email" placeholder="E-mail" />
        <input name="phone" placeholder="Telefoon" />

        <input name="lesson_date" type="date" required />
        <input name="start_time" type="time" required />
        <input name="end_time" type="time" required />

        <select name="lesson_type">
          <option value="">Type afspraak</option>
          <option value="huiswerkbegeleiding">Huiswerkbegeleiding</option>
          <option value="mini-groep">Mini-groep</option>
          <option value="10-beurtenkaart">10-beurtenkaart</option>
          <option value="wekelijkse-begeleiding">
            Wekelijkse begeleiding
          </option>
          <option value="kennismaking">Kennismaking</option>
        </select>

        <input name="location" placeholder="Locatie of digitaal" />

        <textarea name="notes" rows={4} placeholder="Extra notities" />

        <button className="primary-action" type="submit">
          Les toevoegen
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}

      <div className="admin-agenda-list">
        {lessons.map((lesson) => (
          <article className="admin-agenda-item" key={lesson.id}>
            <div>
              <h3>{lesson.title}</h3>
              <p>
                {lesson.lesson_date} · {lesson.start_time?.slice(0, 5)} -{" "}
                {lesson.end_time?.slice(0, 5)}
              </p>
              <p>
                {lesson.student_name}{" "}
                {lesson.parent_name && `· ouder: ${lesson.parent_name}`}
              </p>
              <p>{lesson.location}</p>
              {lesson.notes && <p>{lesson.notes}</p>}
            </div>

            <button type="button" onClick={() => deleteLesson(lesson.id)}>
              Verwijderen
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}