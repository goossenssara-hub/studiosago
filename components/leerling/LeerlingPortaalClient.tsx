"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ActiveTab = "start" | "planner" | "taken" | "oefenen";
type PlannerType = "les" | "huiswerk" | "todo" | "oefening";

type PlannerItem = {
  id: string;
  title: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  type: PlannerType;
  done: boolean;
};

const STORAGE_KEY = "studio-sago-smartschool-agenda-v2";

const hours = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getMonday(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const defaultItems: PlannerItem[] = [
  {
    id: "taal-lezen",
    title: "10 minuten lezen",
    subject: "Taal",
    date: today(),
    startTime: "08:00",
    endTime: "08:30",
    type: "huiswerk",
    done: false,
  },
  {
    id: "tafels",
    title: "Tafels oefenen",
    subject: "Wiskunde",
    date: today(),
    startTime: "10:00",
    endTime: "10:30",
    type: "oefening",
    done: false,
  },
];

export default function LeerlingPortaalClient() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("planner");
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Algemeen");
  const [date, setDate] = useState(today());
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("16:30");
  const [type, setType] = useState<PlannerType>("todo");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setItems(saved ? JSON.parse(saved) : defaultItems);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const weekDays = useMemo(
    () => Array.from({ length: 5 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const huiswerk = items.filter((item) => item.type === "huiswerk");
  const todos = items.filter((item) => item.type === "todo");

  function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) return;

    setItems((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        subject: subject.trim() || "Algemeen",
        date,
        startTime,
        endTime,
        type,
        done: false,
      },
    ]);

    setTitle("");
    setSubject("Algemeen");
    setType("todo");
  }

  function toggleDone(id: string) {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }

  function deleteItem(id: string) {
    setItems((previous) => previous.filter((item) => item.id !== id));
  }

  if (!loaded) return null;

  return (
    <main className="leerling-dashboard smartschool-dashboard">
      <section className="leerling-hero">
        <p className="eyebrow">Studio SaGo Leerlingportaal</p>
        <h1>Mijn dashboard</h1>
        <p>Plan je taken, bekijk je huiswerk en oefen op jouw tempo.</p>
      </section>

      <section className="smartschool-layout">
        <aside className="leerling-card leerling-menu">
          <h2>Menu</h2>

          <button onClick={() => setActiveTab("start")} className={activeTab === "start" ? "active" : ""}>
            Start
          </button>

          <button onClick={() => setActiveTab("planner")} className={activeTab === "planner" ? "active" : ""}>
            Planner
          </button>

          <button onClick={() => setActiveTab("taken")} className={activeTab === "taken" ? "active" : ""}>
            Taken
          </button>

          <button onClick={() => setActiveTab("oefenen")} className={activeTab === "oefenen" ? "active" : ""}>
            Oefenen
          </button>

          <Link href="/logout">🚪 Uitloggen</Link>
        </aside>

        {activeTab === "start" && (
          <section className="leerling-card smartschool-main">
            <h2>Welkom</h2>
            <p>Kies links wat je wilt doen.</p>
          </section>
        )}

        {activeTab === "planner" && (
          <section className="leerling-card smartschool-main">
            <div className="agenda-toolbar">
              <button type="button" onClick={() => setWeekStart(addDays(weekStart, -7))}>
                ←
              </button>
              <button type="button" onClick={() => setWeekStart(getMonday(new Date()))}>
                Vandaag
              </button>
              <button type="button" onClick={() => setWeekStart(addDays(weekStart, 7))}>
                →
              </button>
              <strong>Week van {formatDate(weekStart)}</strong>
            </div>

            <div className="week-agenda">
              <div className="agenda-time-header" />

              {weekDays.map((day) => (
                <div key={formatDate(day)} className="agenda-day-header">
                  <strong>{day.toLocaleDateString("nl-BE", { weekday: "long" })}</strong>
                  <span>{day.getDate()}</span>
                </div>
              ))}

              {hours.map((hour) => (
                <div className="agenda-row" key={hour}>
                  <div className="agenda-hour">{hour}</div>

                  {weekDays.map((day) => {
                    const dayString = formatDate(day);
                    const dayItems = items.filter(
                      (item) =>
                        item.date === dayString &&
                        item.startTime.slice(0, 2) === hour.slice(0, 2)
                    );

                    return (
                      <div className="agenda-cell" key={`${dayString}-${hour}`}>
                        {dayItems.map((item) => (
                          <article
                            key={item.id}
                            className={`agenda-event agenda-${item.type} ${
                              item.done ? "done" : ""
                            }`}
                          >
                            <button type="button" onClick={() => toggleDone(item.id)}>
                              {item.done ? "✓" : "○"}
                            </button>

                            <div>
                              <strong>{item.subject}</strong>
                              <p>{item.title}</p>
                              <small>
                                {item.startTime} - {item.endTime} · {item.type}
                              </small>
                            </div>

                            <button type="button" onClick={() => deleteItem(item.id)}>
                              ×
                            </button>
                          </article>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "planner" && (
          <aside className="smartschool-panel">
            <article className="leerling-card">
              <h2>Nieuwe taak</h2>

              <form onSubmit={addItem} className="planner-form">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bijvoorbeeld: spelling oefenen" />
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Vak, bv. Wiskunde" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

                <div className="time-grid">
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>

                <select value={type} onChange={(e) => setType(e.target.value as PlannerType)}>
                  <option value="todo">To-do</option>
                  <option value="huiswerk">Huistaak</option>
                  <option value="oefening">Oefening</option>
                  <option value="les">Les</option>
                </select>

                <button type="submit">Toevoegen</button>
              </form>
            </article>
          </aside>
        )}

        {activeTab === "taken" && (
          <section className="leerling-card smartschool-main">
            <h2>Huistaken</h2>
            {huiswerk.map((item) => (
              <div key={item.id} className={`planner-item ${item.done ? "done" : ""}`}>
                <button type="button" onClick={() => toggleDone(item.id)}>
                  {item.done ? "✓" : "○"}
                </button>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.date} · {item.subject}</span>
                </div>
              </div>
            ))}

            <h2>To-do’s</h2>
            {todos.map((item) => (
              <div key={item.id} className={`planner-item ${item.done ? "done" : ""}`}>
                <button type="button" onClick={() => toggleDone(item.id)}>
                  {item.done ? "✓" : "○"}
                </button>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.date} · {item.subject}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "oefenen" && (
          <section className="leerling-card smartschool-main leerling-menu">
            <h2>Oefenen</h2>
            <Link href="/dashboard/oefenen/vierde-leerjaar">📚 Oefeningen 4e leerjaar</Link>
            <Link href="/dashboard/oefenen/zesde-leerjaar">🧠 Oefeningen 6e leerjaar</Link>
          </section>
        )}
      </section>
    </main>
  );
}