"use client";

import { useEffect, useState } from "react";

type Pass = {
  id: string;
  customer_email: string;
  title: string | null;
  product: string | null;
  status: string | null;
  total_credits: number | null;
  remaining_credits: number | null;
  total_sessions: number | null;
  remaining_sessions: number | null;
  created_at: string | null;
};

export default function AdminLessonCards() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [message, setMessage] = useState("Laden...");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadPasses() {
    setMessage("Laden...");

    try {
      const response = await fetch("/api/admin/lesson-cards", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Beurtenkaarten konden niet geladen worden.");
        return;
      }

      setPasses(data.passes ?? []);
      setMessage(data.passes?.length ? "" : "Nog geen beurtenkaarten.");
    } catch {
      setMessage("Beurtenkaarten konden niet geladen worden.");
    }
  }

  useEffect(() => {
    loadPasses();
  }, []);

  function updateLocalPass(id: string, field: keyof Pass, value: string) {
    setPasses((current) =>
      current.map((pass) =>
        pass.id === id
          ? {
              ...pass,
              [field]:
                field.includes("credits") || field.includes("sessions")
                  ? Number(value)
                  : value,
            }
          : pass
      )
    );
  }

  async function savePass(pass: Pass) {
    setSavingId(pass.id);

    try {
      const response = await fetch("/api/admin/lesson-cards/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pass),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Beurtenkaart kon niet opgeslagen worden.");
        return;
      }

      await loadPasses();
    } finally {
      setSavingId(null);
    }
  }

  async function deletePass(id: string) {
    const confirmed = confirm(
      "Ben je zeker dat je deze beurtenkaart wil verwijderen?"
    );

    if (!confirmed) return;

    setSavingId(id);

    try {
      const response = await fetch("/api/admin/lesson-cards/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Beurtenkaart kon niet verwijderd worden.");
        return;
      }

      await loadPasses();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="table-card">
      <div className="admin-section-header">
        <div>
          <p className="eyebrow">Beheer</p>
          <h2>Beurtenkaarten</h2>
          <p>
            Overzicht per klant. Je kunt beurtenkaarten handmatig aanpassen of
            verwijderen.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action small-action"
          onClick={loadPasses}
        >
          Vernieuwen
        </button>
      </div>

      {message && <p>{message}</p>}

      <div className="admin-request-list">
        {passes.map((pass) => {
          const title = pass.product || pass.title || "Beurtenkaart";

          return (
            <article className="admin-request-card" key={pass.id}>
              <h3>{title}</h3>

              <p>
                <strong>Klant:</strong> {pass.customer_email}
              </p>

              <div className="form-grid">
                <label>
                  Titel
                  <input
                    value={pass.title ?? ""}
                    onChange={(e) =>
                      updateLocalPass(pass.id, "title", e.target.value)
                    }
                  />
                </label>

                <label>
                  Product
                  <input
                    value={pass.product ?? ""}
                    onChange={(e) =>
                      updateLocalPass(pass.id, "product", e.target.value)
                    }
                  />
                </label>

                <label>
                  Totaal beurten
                  <input
                    type="number"
                    value={pass.total_sessions ?? pass.total_credits ?? 0}
                    onChange={(e) => {
                      updateLocalPass(
                        pass.id,
                        "total_sessions",
                        e.target.value
                      );
                      updateLocalPass(
                        pass.id,
                        "total_credits",
                        e.target.value
                      );
                    }}
                  />
                </label>

                <label>
                  Resterende beurten
                  <input
                    type="number"
                    value={
                      pass.remaining_sessions ?? pass.remaining_credits ?? 0
                    }
                    onChange={(e) => {
                      updateLocalPass(
                        pass.id,
                        "remaining_sessions",
                        e.target.value
                      );
                      updateLocalPass(
                        pass.id,
                        "remaining_credits",
                        e.target.value
                      );
                    }}
                  />
                </label>

                <label>
                  Status
                  <select
                    value={pass.status ?? "active"}
                    onChange={(e) =>
                      updateLocalPass(pass.id, "status", e.target.value)
                    }
                  >
                    <option value="active">Actief</option>
                    <option value="inactive">Inactief</option>
                    <option value="expired">Verlopen</option>
                    <option value="cancelled">Geannuleerd</option>
                  </select>
                </label>
              </div>

              <div className="admin-request-actions">
                <button
                  type="button"
                  onClick={() => savePass(pass)}
                  disabled={savingId === pass.id}
                >
                  💾 {savingId === pass.id ? "Opslaan..." : "Opslaan"}
                </button>

                <button
                  type="button"
                  onClick={() => deletePass(pass.id)}
                  disabled={savingId === pass.id}
                >
                  🗑️ Verwijderen
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}