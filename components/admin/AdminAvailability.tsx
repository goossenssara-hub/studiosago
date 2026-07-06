"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Availability = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_places: number;
  booked_places: number;
  active: boolean;
  service_type: string | null;
  booked_customer?: string | null;
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

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  });
}

export default function AdminAvailability() {
  const [items, setItems] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const itemsPerPage = 10;

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

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [search, typeFilter]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const text =
        `${item.date} ${item.start_time} ${item.end_time} ${item.service_type} ${item.booked_customer}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesType =
        typeFilter === "all" || item.service_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [items, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  const paginatedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  function toggleDay(day: number) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    );
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function selectAllVisible() {
    setSelectedIds(paginatedItems.map((item) => item.id));
  }

  function clearSelection() {
    setSelectedIds([]);
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
      await loadAvailability();
    }
  }

  async function deleteSelectedAvailability() {
    if (selectedIds.length === 0) return;

    const response = await fetch("/api/admin/availability", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: selectedIds,
      }),
    });

    if (response.ok) {
      setSelectedIds([]);
      await loadAvailability();
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
                      isSelected ? "weekday-button selected" : "weekday-button"
                    }
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

        <div className="availability-toolbar">
          <input
            placeholder="Zoeken op datum, type of klant..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">Alle types</option>
            <option value="kennismaking">Kennismaking</option>
            <option value="begeleiding">Begeleiding</option>
          </select>
        </div>

        <div className="availability-bulk-actions">
          <button type="button" onClick={selectAllVisible}>
            Alles op deze pagina selecteren
          </button>

          <button type="button" onClick={clearSelection}>
            Selectie wissen
          </button>

          <button
            type="button"
            onClick={deleteSelectedAvailability}
            disabled={selectedIds.length === 0}
          >
            Geselecteerde verwijderen ({selectedIds.length})
          </button>
        </div>

        {loading && <p>Laden...</p>}

        {!loading && filteredItems.length === 0 && (
          <p>Geen beschikbare momenten gevonden.</p>
        )}

        {!loading && filteredItems.length > 0 && (
          <>
            <div className="availability-table">
              <div className="availability-row availability-header">
                <span></span>
                <span>Datum</span>
                <span>Tijd</span>
                <span>Type</span>
                <span>Klant</span>
                <span>Plaatsen</span>
                <span>Status</span>
                <span>Actie</span>
              </div>

              {paginatedItems.map((item) => (
                <div key={item.id} className="availability-row">
                  <span>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </span>

                  <span>{formatDate(item.date)}</span>

                  <span>
                    {item.start_time.slice(0, 5)} –{" "}
                    {item.end_time.slice(0, 5)}
                  </span>

                  <span className="availability-badge">
                    {item.service_type === "kennismaking"
                      ? "Kennismaking"
                      : "Begeleiding"}
                  </span>

                  <span>{item.booked_customer ? item.booked_customer : "—"}</span>

                  <span>
                    {item.booked_places}/{item.max_places}
                  </span>

                  <span
                    className={
                      item.active ? "status-pill active" : "status-pill inactive"
                    }
                  >
                    {item.active ? "Actief" : "Volzet"}
                  </span>

                  <button
                    type="button"
                    className="availability-delete"
                    onClick={() => deleteAvailability(item.id)}
                  >
                    Verwijderen
                  </button>
                </div>
              ))}
            </div>

            <div className="availability-pagination">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
              >
                Vorige
              </button>

              <span>
                Pagina {page} van {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages}
              >
                Volgende
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}