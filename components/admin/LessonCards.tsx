"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Pass = {
  id: string;
  customer_email: string;
  title: string;
  total_credits: number | null;
  remaining_credits: number | null;
  total_sessions?: number | null;
  remaining_sessions?: number | null;
  status: string | null;
  created_at?: string;
};

export default function AdminLessonCards() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadPasses() {
    setLoading(true);

    const response = await fetch("/api/admin/lesson-cards", {
      cache: "no-store",
    });

    const data = await response.json();

    if (response.ok) {
      setPasses(data.passes ?? []);
    } else {
      setMessage(data.error || "Beurtenkaarten konden niet geladen worden.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPasses();
  }, []);

  const groupedPasses = useMemo(() => {
    const sorted = [...passes].sort((a, b) =>
      String(a.customer_email || "").localeCompare(
        String(b.customer_email || ""),
        "nl-BE"
      )
    );

    return sorted.reduce<Record<string, Pass[]>>((groups, pass) => {
      const email = pass.customer_email || "Onbekende klant";

      if (!groups[email]) {
        groups[email] = [];
      }

      groups[email].push(pass);
      return groups;
    }, {});
  }, [passes]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>, passId: string) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/lesson-cards", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: passId,
        title: formData.get("title"),
        totalCredits: formData.get("totalCredits"),
        remainingCredits: formData.get("remainingCredits"),
        status: formData.get("status"),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Beurtenkaart kon niet aangepast worden.");
      return;
    }

    setEditingId(null);
    setMessage("Beurtenkaart aangepast.");
    await loadPasses();
  }

  async function deletePass(passId: string) {
    const confirmDelete = window.confirm(
      "Ben je zeker dat je deze beurtenkaart wilt verwijderen?"
    );

    if (!confirmDelete) return;

    const response = await fetch(`/api/admin/lesson-cards?id=${passId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Beurtenkaart kon niet verwijderd worden.");
      return;
    }

    setMessage("Beurtenkaart verwijderd.");
    await loadPasses();
  }

  if (loading) {
    return (
      <div className="admin-request-card">
        <h2>Beurtenkaarten</h2>
        <p>Laden...</p>
      </div>
    );
  }

  return (
    <div className="admin-request-list">
      <div className="admin-request-card">
        <h2>Beurtenkaarten</h2>
        <p>
          Overzicht per klant, alfabetisch gesorteerd. Je kunt kaarten aanpassen
          of verwijderen.
        </p>

        {message && <p className="form-message">{message}</p>}

        {passes.length === 0 && <p>Nog geen beurtenkaarten.</p>}
      </div>

      {Object.entries(groupedPasses).map(([email, customerPasses]) => (
        <div key={email} className="admin-request-card">
          <h3>👤 {email}</h3>

          <div className="lesson-card-list">
            {customerPasses.map((pass) => {
              const total =
                pass.total_credits ?? pass.total_sessions ?? 10;

              const remaining =
                pass.remaining_credits ?? pass.remaining_sessions ?? 0;

              const used = total - remaining;

              return (
                <div key={pass.id} className="lesson-card-admin">
                  {editingId === pass.id ? (
                    <form
                      onSubmit={(event) => handleUpdate(event, pass.id)}
                      className="form-grid"
                    >
                      <label>
                        Titel
                        <input
                          name="title"
                          defaultValue={pass.title || ""}
                          required
                        />
                      </label>

                      <label>
                        Totaal beurten
                        <input
                          name="totalCredits"
                          type="number"
                          min="1"
                          defaultValue={total}
                          required
                        />
                      </label>

                      <label>
                        Resterende beurten
                        <input
                          name="remainingCredits"
                          type="number"
                          min="0"
                          defaultValue={remaining}
                          required
                        />
                      </label>

                      <label>
                        Status
                        <select name="status" defaultValue={pass.status || "active"}>
                          <option value="active">Actief</option>
                          <option value="used">Opgebruikt</option>
                          <option value="cancelled">Geannuleerd</option>
                        </select>
                      </label>

                      <button className="primary-action" type="submit">
                        Opslaan
                      </button>

                      <button
                        className="secondary-action"
                        type="button"
                        onClick={() => setEditingId(null)}
                      >
                        Annuleren
                      </button>
                    </form>
                  ) : (
                    <>
                      <h3>🎟️ {pass.title}</h3>

                      <p>
                        Nog <strong>{remaining}</strong> van de{" "}
                        <strong>{total}</strong> beurten beschikbaar.
                      </p>

                      <div className="pass-progress">
                        <span
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, (remaining / total) * 100)
                            )}%`,
                          }}
                        />
                      </div>

                      <p>Gebruikt: {used}</p>
                      <p>Status: {pass.status || "active"}</p>

                      <div className="admin-actions">
                        <button
                          className="secondary-action"
                          type="button"
                          onClick={() => setEditingId(pass.id)}
                        >
                          Aanpassen
                        </button>

                        <button
                          className="availability-delete"
                          type="button"
                          onClick={() => deletePass(pass.id)}
                        >
                          Verwijderen
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}