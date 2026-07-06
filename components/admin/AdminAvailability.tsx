"use client";

import { FormEvent, useEffect, useState } from "react";

type Availability = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_places: number;
  booked_places: number;
  active: boolean;
  service_type: string | null;
};

const weekDays = [
  { value: 1, label: "Ma" },
  { value: 2, label: "Di" },
  { value: 3, label: "Wo" },
  { value: 4, label: "Do" },
  { value: 5, label: "Vr" },
  { value: 6, label: "Za" },
  { value: 0, label: "Zo" },
];

export default function AdminAvailability() {
  const [items, setItems] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  async function loadAvailability() {
    setLoading(true);

    const response = await fetch("/api/admin/availability", {
      cache: "no-store",
    });

    const data = await response.json();

    if (response.ok) {
      setItems(data.availability ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAvailability();
  }, []);

  function toggleDay(day: number) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);

      const response = await fetch("/api/admin/availability", {
        method: "POST",
        body: JSON.stringify({
          serviceType: formData.get("serviceType"),
          startDate: formData.get("startDate"),
          endDate: formData.get("endDate"),
          startTime: formData.get("startTime"),
          endTime: formData.get("endTime"),
          maxPlaces: formData.get("maxPlaces"),
          weekDays: selectedDays,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Momenten konden niet toegevoegd worden.");
        return;
      }

      event.currentTarget.reset();
      setSelectedDays([]);
      setMessage(`${data.count} beschikbare momenten toegevoegd.`);
      await loadAvailability();
    } catch {
      setMessage("Er ging iets mis bij het toevoegen.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAvailability(id: string) {
    const response = await fetch(`/api/admin/availability?id=${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      loadAvailability();
    }
  }

  return (
    <div className="admin-request-list">
      <div className="admin-request-card">
        <h2>Beschikbare periode toevoegen</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Type afspraak
            <select name="serviceType" required>
              <option value="">Kies type</option>
              <option value="kennismaking">Kennismaking — 30 min</option>
              <option value="begeleiding">
                Bijles / huiswerkbegeleiding / studiecoaching — 60 min
              </option>
            </select>
          </label>

          <label>
            Startdatum
            <input name="startDate" type="date" required />
          </label>

          <label>
            Einddatum
            <input name="endDate" type="date" required />
          </label>

          <label>
            Startuur
            <input name="startTime" type="time" required />
          </label>

          <label>
            Einduur
            <input name="endTime" type="time" required />
          </label>

          <label>
            Aantal plaatsen per moment
            <input
              name="maxPlaces"
              type="number"
              min="1"
              defaultValue="1"
              required
            />
          </label>

          <div style={{ gridColumn: "1 / -1" }}>
            <p>Herhalen op:</p>

            <div className="weekday-button-row">
              {weekDays.map((day) => {
                const isSelected = selectedDays.includes(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    className={
                      isSelected
                        ? "weekday-button selected"
                        : "weekday-button"
                    }
                    aria-pressed={isSelected}
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="primary-action" disabled={saving}>
            {saving ? "Toevoegen..." : "Periode toevoegen"}
          </button>
        </form>

        {message && <p className="form-message">{message}</p>}
      </div>

      <div className="admin-request-card">
        <h2>Beschikbare momenten</h2>

        {loading && <p>Laden...</p>}

        {!loading && items.length === 0 && (
          <p>Er zijn nog geen beschikbare momenten toegevoegd.</p>
        )}

        {!loading &&
          items.map((item) => (
            <div key={item.id} className="agenda-item">
              <h3>
                📅 {item.date} — {item.start_time.slice(0, 5)} tot{" "}
                {item.end_time.slice(0, 5)}
              </h3>

              <p>
                Type:{" "}
                {item.service_type === "kennismaking"
                  ? "Kennismaking"
                  : "Begeleiding"}
              </p>

              <p>
                Plaatsen: {item.booked_places}/{item.max_places}
              </p>

              <p>Status: {item.active ? "Actief" : "Niet actief"}</p>

              <button
                type="button"
                className="secondary-action"
                onClick={() => deleteAvailability(item.id)}
              >
                Verwijderen
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}