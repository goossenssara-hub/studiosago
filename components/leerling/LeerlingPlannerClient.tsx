"use client";

import { useState } from "react";
import Link from "next/link";

type PlannerItem = {
  id: number;
  title: string;
  subject: string;
  type: "les" | "taak" | "toets";
  day: string;
  start: string;
  end: string;
  room: string;
  color: string;
};

const days = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag"];
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

const colors = {
  Nederlands: "#9fe8a3",
  Wiskunde: "#9fd8ff",
  Frans: "#f4b4ee",
  Studie: "#ffd99b",
  Toets: "#ff9fbc",
  Taak: "#cdb7f6",
};

export default function LeerlingPlannerClient() {
  const [items, setItems] = useState<PlannerItem[]>([
    {
      id: 1,
      title: "Lezen hoofdstuk 4",
      subject: "Nederlands",
      type: "taak",
      day: "maandag",
      start: "08:20",
      end: "09:10",
      room: "Studio SaGo",
      color: colors.Nederlands,
    },
    {
      id: 2,
      title: "Breuken oefenen",
      subject: "Wiskunde",
      type: "les",
      day: "woensdag",
      start: "10:15",
      end: "11:05",
      room: "Online",
      color: colors.Wiskunde,
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    subject: "Nederlands",
    type: "les" as PlannerItem["type"],
    day: "maandag",
    start: "08:20",
    end: "09:10",
    room: "",
  });

  function addItem(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) return;

    const color =
      form.type === "toets"
        ? colors.Toets
        : form.type === "taak"
        ? colors.Taak
        : colors[form.subject as keyof typeof colors] || colors.Studie;

    setItems([
      ...items,
      {
        id: Date.now(),
        ...form,
        color,
      },
    ]);

    setForm({
      title: "",
      subject: "Nederlands",
      type: "les",
      day: "maandag",
      start: "08:20",
      end: "09:10",
      room: "",
    });
  }

  function removeItem(id: number) {
    setItems(items.filter((item) => item.id !== id));
  }

  return (
    <main className="leerling-planner-page">
      <aside className="planner-sidebar">
        <div className="planner-profile">
          <div className="planner-avatar">SG</div>
          <div>
            <strong>Mijn planner</strong>
            <span>Leerlingportaal</span>
          </div>
        </div>

        <nav>
          <Link href="/dashboard/leerling">Start</Link>
          <Link href="/dashboard/leerling/planner" className="active">
            Planner
          </Link>
          <Link href="/dashboard/leerling">Taken</Link>
          <Link href="/dashboard/leerling">Oefenen</Link>
        </nav>
      </aside>

      <section className="planner-main">
        <header className="planner-topbar">
          <div>
            <p>Studio SaGo</p>
            <h1>Weekplanner</h1>
          </div>

          <div className="planner-week-selector">
            <button>‹</button>
            <span>Deze week</span>
            <button>›</button>
          </div>
        </header>

        <section className="planner-actions">
          <form onSubmit={addItem} className="planner-create-form">
            <input
              placeholder="Titel van les, taak of toets"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              <option>Nederlands</option>
              <option>Wiskunde</option>
              <option>Frans</option>
              <option>Studie</option>
            </select>

            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as PlannerItem["type"] })
              }
            >
              <option value="les">Les</option>
              <option value="taak">Taak</option>
              <option value="toets">Toets</option>
            </select>

            <select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
            >
              {days.map((day) => (
                <option key={day}>{day}</option>
              ))}
            </select>

            <input
              type="time"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />

            <input
              type="time"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />

            <input
              placeholder="Locatie"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
            />

            <button type="submit">+ Toevoegen</button>
          </form>
        </section>

        <section className="planner-board">
          <div className="planner-hours">
            <div></div>
            {hours.map((hour) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>

          <div className="planner-days">
            {days.map((day) => (
              <div className="planner-day-column" key={day}>
                <h2>{day}</h2>

                <div className="planner-day-grid">
                  {items
                    .filter((item) => item.day === day)
                    .map((item) => (
                      <article
                        key={item.id}
                        className="planner-block"
                        style={{ background: item.color }}
                      >
                        <button onClick={() => removeItem(item.id)}>×</button>
                        <strong>{item.subject}</strong>
                        <h3>{item.title}</h3>
                        <p>
                          {item.start}-{item.end}
                        </p>
                        <span>{item.room || item.type}</span>
                      </article>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}