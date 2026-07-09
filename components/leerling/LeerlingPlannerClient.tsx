"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PlannerItem = {
  id: string;
  title: string;
  subject: string;
  type: "les" | "taak" | "toets" | "oefening" | "huiswerk";
  day: string;
  start: string;
  duration: number;
  notes: string;
  done: boolean;
};

const days = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag"];

const hours = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
];

const typeLabels = {
  les: "Les",
  taak: "Taak",
  toets: "Toets",
  oefening: "Oefening",
  huiswerk: "Huiswerk",
};

const typeColors = {
  les: "#bdf4c0",
  taak: "#ffd9a3",
  toets: "#ffb4c9",
  oefening: "#9ed7ff",
  huiswerk: "#d7c3ff",
};

export default function LeerlingPlannerClient() {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("leerling-planner-items");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("leerling-planner-items", JSON.stringify(items));
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((item) => item.done).length;
    const open = total - done;

    return { total, done, open };
  }, [items]);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const newItem: PlannerItem = {
      id: crypto.randomUUID(),
      title: String(formData.get("title") || ""),
      subject: String(formData.get("subject") || ""),
      type: String(formData.get("type") || "taak") as PlannerItem["type"],
      day: String(formData.get("day") || "maandag"),
      start: String(formData.get("start") || "08:00"),
      duration: Number(formData.get("duration") || 30),
      notes: String(formData.get("notes") || ""),
      done: false,
    };

    if (!newItem.title.trim()) return;

    setItems((current) => [...current, newItem]);
    event.currentTarget.reset();
    setShowForm(false);
  }

  function toggleDone(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }

  function deleteItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <main className="leerling-planner-page">
      <section className="planner-main">
        <header className="planner-hero">
          <div>
            <h1>Mijn dashboard</h1>
            <p>Plan je taken, bekijk je huiswerk en oefen op jouw tempo.</p>
          </div>
        </header>

        <nav className="leerling-menu-top">
          <Link href="/dashboard/leerling">Start</Link>
          <Link className="active" href="/dashboard/leerling/planner">
            Planner
          </Link>
          <Link href="/dashboard/leerling/taken">Taken</Link>
          <Link href="/dashboard/leerling/oefenen">Oefenen</Link>
          <Link href="/logout">🚪 Uitloggen</Link>
        </nav>

        <section className="planner-overview">
          <article>
            <strong>{stats.total}</strong>
            <span>opdrachten</span>
          </article>

          <article>
            <strong>{stats.open}</strong>
            <span>nog te doen</span>
          </article>

          <article>
            <strong>{stats.done}</strong>
            <span>afgerond</span>
          </article>

          <button type="button" onClick={() => setShowForm((value) => !value)}>
            + Nieuwe opdracht
          </button>
        </section>

        {showForm && (
          <section className="planner-actions">
            <form className="planner-create-form" onSubmit={handleCreate}>
              <input
                name="title"
                placeholder="Titel opdracht"
                required
              />

              <input
                name="subject"
                placeholder="Vak / onderwerp"
                required
              />

              <select name="type" defaultValue="taak">
                <option value="taak">Taak</option>
                <option value="huiswerk">Huiswerk</option>
                <option value="toets">Toets</option>
                <option value="oefening">Oefening</option>
                <option value="les">Les</option>
              </select>

              <select name="day" defaultValue="maandag">
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <select name="start" defaultValue="08:00">
                {hours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>

              <select name="duration" defaultValue="30">
                <option value="15">15 min.</option>
                <option value="30">30 min.</option>
                <option value="45">45 min.</option>
                <option value="60">1 uur</option>
                <option value="90">1,5 uur</option>
                <option value="120">2 uur</option>
              </select>

              <textarea
                name="notes"
                placeholder="Opmerkingen"
                rows={1}
              />

              <button type="submit">Plaats in kalender</button>
            </form>
          </section>
        )}

        <section className="planner-board">
          <div className="planner-hours">
            <div />
            {hours.map((hour) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>

          <div className="planner-days">
            {days.map((day) => (
              <article key={day} className="planner-day-column">
                <h2>{day}</h2>

                <div className="planner-day-grid">
                  {hours.map((hour) => (
                    <div key={hour} className="planner-hour-cell">
                      {items
                        .filter((item) => item.day === day && item.start === hour)
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`planner-block ${
                              item.done ? "is-done" : ""
                            }`}
                            style={{ background: typeColors[item.type] }}
                          >
                            <label className="planner-check">
                              <input
                                type="checkbox"
                                checked={item.done}
                                onChange={() => toggleDone(item.id)}
                              />
                              <span />
                            </label>

                            <button
                              type="button"
                              className="planner-delete"
                              onClick={() => deleteItem(item.id)}
                            >
                              ×
                            </button>

                            <strong>{typeLabels[item.type]}</strong>
                            <h3>{item.title}</h3>
                            <p>{item.subject}</p>
                            <small>
                              {item.start} · {item.duration} min.
                            </small>

                            {item.notes && <em>{item.notes}</em>}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}