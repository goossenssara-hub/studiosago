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
};

export default function AdminAvailability() {
  const [items, setItems] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/availability", {
      method: "POST",
      body: JSON.stringify({
        date: formData.get("date"),
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime"),
        maxPlaces: formData.get("maxPlaces"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Moment kon niet toegevoegd worden.");
      setSaving(false);
      return;
    }

    event.currentTarget.reset();
    setMessage("Beschikbaar moment toegevoegd.");
    setSaving(false);
    loadAvailability();
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
        <h2>Beschikbaar moment toevoegen</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Datum
            <input name="date" type="date" required />
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
            Aantal plaatsen
            <input name="maxPlaces" type="number" min="1" defaultValue="1" required />
          </label>

          <button className="primary-action" disabled={saving}>
            {saving ? "Toevoegen..." : "Moment toevoegen"}
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