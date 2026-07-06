"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminManualAdd() {
  const [email, setEmail] = useState("");
  const [passTitle, setPassTitle] = useState("Beurtenkaart");
  const [credits, setCredits] = useState(5);

  const [lessonTitle, setLessonTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  async function addPass() {
    if (!email) {
      alert("Vul een e-mailadres in.");
      return;
    }

    if (!supabase) {
      alert("Supabase is niet geconfigureerd.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("passes").insert({
      customer_email: email,
      title: passTitle,
      total_credits: credits,
      remaining_credits: credits,
      total_sessions: credits,
      remaining_sessions: credits,
      status: "active",
    });

    setSaving(false);

    if (error) {
      alert("Beurtenkaart toevoegen mislukt.");
      console.error(error);
      return;
    }

    alert("Beurtenkaart toegevoegd.");
  }

  async function addLesson() {
    if (!email || !lessonTitle || !startTime) {
      alert("Vul minstens e-mail, titel en starttijd in.");
      return;
    }

    if (!supabase) {
      alert("Supabase is niet geconfigureerd.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("bookings").insert({
      customer_email: email,
      title: lessonTitle,
      start_time: startTime,
      end_time: endTime || null,
      location: location || null,
      status: "confirmed",
      payment_status: "paid",
      amount: 0,
      confirmed_at: new Date().toISOString(),
      internal_notes: "Manueel toegevoegd via admin",
    });

    setSaving(false);

    if (error) {
      alert("Les/workshop toevoegen mislukt.");
      console.error(error);
      return;
    }

    alert("Les of workshop toegevoegd.");
  }

  return (
    <section className="info-grid single">
      <div className="info-card">
        <h2>Admin: manueel toevoegen</h2>

        <label>
          E-mailadres klant
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="klant@email.be"
          />
        </label>

        <hr />

        <h3>Beurtenkaart toevoegen</h3>

        <label>
          Naam beurtenkaart
          <input
            value={passTitle}
            onChange={(e) => setPassTitle(e.target.value)}
          />
        </label>

        <label>
          Aantal beurten
          <input
            type="number"
            min="1"
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
          />
        </label>

        <button
          type="button"
          className="primary-action"
          onClick={addPass}
          disabled={saving}
        >
          {saving ? "Opslaan..." : "Beurtenkaart toevoegen"}
        </button>

        <hr />

        <h3>Workshop of les toevoegen</h3>

        <label>
          Titel
          <input
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="Bijles wiskunde / Workshop..."
          />
        </label>

        <label>
          Starttijd
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>

        <label>
          Eindtijd
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>

        <label>
          Locatie
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Studio SaGo / online / ..."
          />
        </label>

        <button
          type="button"
          className="primary-action"
          onClick={addLesson}
          disabled={saving}
        >
          {saving ? "Opslaan..." : "Les of workshop toevoegen"}
        </button>
      </div>
    </section>
  );
}