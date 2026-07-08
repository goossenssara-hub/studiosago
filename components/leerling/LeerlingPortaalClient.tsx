"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PlannerItem = {
  id: string;
  date: string;
  title: string;
  type: "planning" | "huiswerk" | "todo";
  done: boolean;
};

const STORAGE_KEY = "studio-sago-leerling-planner-v1";

const defaultItems: PlannerItem[] = [
  {
    id: "huiswerk-taal-1",
    date: new Date().toISOString().slice(0, 10),
    title: "Taal: 10 minuten lezen",
    type: "huiswerk",
    done: false,
  },
  {
    id: "huiswerk-wiskunde-1",
    date: new Date().toISOString().slice(0, 10),
    title: "Wiskunde: tafels oefenen",
    type: "huiswerk",
    done: false,
  },
];

export default function LeerlingPortaalClient() {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<PlannerItem["type"]>("todo");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems(defaultItems);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) return;

    setItems((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        date,
        type,
        done: false,
      },
    ]);

    setTitle("");
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

  const huiswerk = items.filter((item) => item.type === "huiswerk");
  const todos = items.filter((item) => item.type === "todo");
  const planning = items
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <main className="leerling-dashboard">
      <section className="leerling-hero">
        <p className="eyebrow">Studio SaGo Leerlingportaal</p>
        <h1>Mijn dashboard</h1>
        <p>Plan je taken, bekijk je huiswerk en oefen op jouw tempo.</p>
      </section>

      <section className="leerling-grid">
        <article className="leerling-card leerling-menu">
          <h2>Menu</h2>

          <Link href="/dashboard/oefenen/vierde-leerjaar">
            📚 Oefeningen 4e leerjaar
          </Link>

          <Link href="/dashboard/oefenen/zesde-leerjaar">
            🧠 Oefeningen 6e leerjaar
          </Link>

          <Link href="/logout">
            🚪 Uitloggen
          </Link>
        </article>

        <article className="leerling-card">
          <h2>Nieuwe taak toevoegen</h2>

          <form onSubmit={addItem} className="planner-form">
            <input
              type="text"
              placeholder="Bijvoorbeeld: spelling oefenen"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as PlannerItem["type"])
              }
            >
              <option value="todo">To-do</option>
              <option value="huiswerk">Huistaak</option>
              <option value="planning">Planning</option>
            </select>

            <button type="submit">Toevoegen</button>
          </form>
        </article>

        <article className="leerling-card">
          <h2>Mijn planning</h2>

          <div className="planner-list">
            {planning.length === 0 ? (
              <p>Nog niets gepland.</p>
            ) : (
              planning.map((item) => (
                <div
                  key={item.id}
                  className={`planner-item ${item.done ? "done" : ""}`}
                >
                  <button type="button" onClick={() => toggleDone(item.id)}>
                    {item.done ? "✓" : "○"}
                  </button>

                  <div>
                    <strong>{item.title}</strong>
                    <span>
                      {item.date} · {item.type}
                    </span>
                  </div>

                  <button type="button" onClick={() => deleteItem(item.id)}>
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="leerling-card">
          <h2>Huistaken</h2>

          {huiswerk.length === 0 ? (
            <p>Geen huistaken.</p>
          ) : (
            huiswerk.map((item) => (
              <div key={item.id} className={`planner-item ${item.done ? "done" : ""}`}>
                <button type="button" onClick={() => toggleDone(item.id)}>
                  {item.done ? "✓" : "○"}
                </button>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                </div>
              </div>
            ))
          )}
        </article>

        <article className="leerling-card">
          <h2>To-do’s</h2>

          {todos.length === 0 ? (
            <p>Geen to-do’s.</p>
          ) : (
            todos.map((item) => (
              <div key={item.id} className={`planner-item ${item.done ? "done" : ""}`}>
                <button type="button" onClick={() => toggleDone(item.id)}>
                  {item.done ? "✓" : "○"}
                </button>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                </div>
              </div>
            ))
          )}
        </article>
      </section>
    </main>
  );
}