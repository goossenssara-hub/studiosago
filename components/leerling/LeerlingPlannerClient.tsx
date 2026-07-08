"use client";

import { useMemo, useState } from "react";
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

type PlannerForm = {
  title: string;
  subject: string;
  type: PlannerItem["type"];
  day: string;
  start: string;
  end: string;
  room: string;
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

const colors = {
  Nederlands: "#9fe8a3",
  Wiskunde: "#9fd8ff",
  Frans: "#f4b4ee",
  Studie: "#ffd99b",
  Toets: "#ff9fbc",
  Taak: "#cdb7f6",
};

const initialItems: PlannerItem[] = [
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
  {
    id: 3,
    title: "Franse woordjes",
    subject: "Frans",
    type: "toets",
    day: "vrijdag",
    start: "13:00",
    end: "13:50",
    room: "Thuis",
    color: colors.Toets,
  },
];

const emptyForm: PlannerForm = {
  title: "",
  subject: "Nederlands",
  type: "les",
  day: "maandag",
  start: "08:20",
  end: "09:10",
  room: "",
};

export default function LeerlingPlannerClient() {
  const [items, setItems] = useState<PlannerItem[]>(initialItems);
  const [form, setForm] = useState<PlannerForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const totalTasks = useMemo(
    () => items.filter((item) => item.type === "taak").length,
    [items]
  );

  const totalTests = useMemo(
    () => items.filter((item) => item.type === "toets").length,
    [items]
  );

  const totalLessons = useMemo(
    () => items.filter((item) => item.type === "les").length,
    [items]
  );

  function getItemColor(item: PlannerForm) {
    if (item.type === "toets") return colors.Toets;
    if (item.type === "taak") return colors.Taak;

    return (
      colors[item.subject as keyof typeof colors] ||
      colors.Studie
    );
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) return;

    const newItem: PlannerItem = {
      id: Date.now(),
      ...form,
      color: getItemColor(form),
    };

    setItems((currentItems) => [...currentItems, newItem]);
    setForm(emptyForm);
    setShowForm(false);
  }

  function removeItem(id: number) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  }
    return (
    <main className="leerling-planner-page">
      <section className="planner-main">
        <header className="planner-topbar">
          <div>
            <p>Studio SaGo Leerlingportaal</p>
            <h1>Mijn weekplanner</h1>
            <span>
              Plan je lessen, taken en toetsen op één duidelijke plek.
            </span>
          </div>

          <div className="planner-week-selector">
            <button type="button">‹</button>
            <span>Deze week</span>
            <button type="button">›</button>
          </div>
        </header>

        <aside className="planner-sidebar">
          <nav>
            <Link href="/dashboard/leerling">Start</Link>

            <Link href="/dashboard/leerling/planner" className="active">
              Planner
            </Link>

            <Link href="/dashboard/leerling/taken">Taken</Link>

            <Link href="/dashboard/leerling/oefenen">Oefenen</Link>

            <Link href="/dashboard/leerling/platform">Mailbox</Link>
          </nav>
        </aside>

        <section className="planner-overview">
          <article>
            <strong>{totalLessons}</strong>
            <span>Lessen</span>
          </article>

          <article>
            <strong>{totalTasks}</strong>
            <span>Taken</span>
          </article>

          <article>
            <strong>{totalTests}</strong>
            <span>Toetsen</span>
          </article>

          <button type="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Sluiten" : "+ Nieuwe planning"}
          </button>
        </section>

        {showForm && (
          <section className="planner-actions">
            <form onSubmit={addItem} className="planner-create-form">
              <input
                placeholder="Titel van les, taak of toets"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <select
                value={form.subject}
                onChange={(e) =>
                  setForm({ ...form, subject: e.target.value })
                }
              >
                <option>Nederlands</option>
                <option>Wiskunde</option>
                <option>Frans</option>
                <option>Studie</option>
              </select>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as PlannerItem["type"],
                  })
                }
              >
                <option value="les">Les</option>
                <option value="taak">Taak</option>
                <option value="toets">Toets</option>
              </select>
                            <select
                value={form.day}
                onChange={(e) =>
                  setForm({ ...form, day: e.target.value })
                }
              >
                {days.map((day) => (
                  <option key={day}>{day}</option>
                ))}
              </select>

              <input
                type="time"
                value={form.start}
                onChange={(e) =>
                  setForm({ ...form, start: e.target.value })
                }
              />

              <input
                type="time"
                value={form.end}
                onChange={(e) =>
                  setForm({ ...form, end: e.target.value })
                }
              />

              <input
                placeholder="Locatie"
                value={form.room}
                onChange={(e) =>
                  setForm({ ...form, room: e.target.value })
                }
              />

              <button type="submit">Toevoegen</button>
            </form>
          </section>
        )}

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
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label="Verwijderen"
                        >
                          ×
                        </button>

                        <strong>{item.subject}</strong>

                        <h3>{item.title}</h3>

                        <p>
                          {item.start} - {item.end}
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