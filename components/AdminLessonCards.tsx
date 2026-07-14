"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "./AdminLessonCards.module.css";

type Pass = {
  id: string;
  customer_email: string | null;
  title: string | null;
  total_credits: number | null;
  remaining_credits: number | null;
  total_sessions?: number | null;
  remaining_sessions?: number | null;
  status: string | null;
  created_at?: string | null;
};

type ApiResponse = {
  passes?: Pass[];
  success?: boolean;
  error?: string;
};

async function readJsonSafely(
  response: Response
): Promise<ApiResponse> {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as ApiResponse;
  } catch {
    return {};
  }
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "used":
      return "Opgebruikt";

    case "cancelled":
      return "Geannuleerd";

    default:
      return "Actief";
  }
}

export default function AdminLessonCards() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [savingId, setSavingId] = useState<string | null>(
    null
  );

  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const loadPasses = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/lesson-cards",
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Beurtenkaarten konden niet geladen worden."
        );
      }

      setPasses(data.passes ?? []);
    } catch (error) {
      console.error("LOAD LESSON CARDS ERROR:", error);

      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Beurtenkaarten konden niet geladen worden."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPasses();
  }, [loadPasses]);

  const groupedPasses = useMemo(() => {
    const sorted = [...passes].sort((left, right) =>
      clean(left.customer_email).localeCompare(
        clean(right.customer_email),
        "nl-BE"
      )
    );

    return sorted.reduce<Record<string, Pass[]>>(
      (groups, pass) => {
        const email =
          clean(pass.customer_email) || "Onbekende klant";

        if (!groups[email]) {
          groups[email] = [];
        }

        groups[email].push(pass);

        return groups;
      },
      {}
    );
  }, [passes]);

  async function updatePass(
    event: FormEvent<HTMLFormElement>,
    passId: string
  ) {
    event.preventDefault();

    setSavingId(passId);
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);

      const totalCredits = Number(
        formData.get("totalCredits")
      );

      const remainingCredits = Number(
        formData.get("remainingCredits")
      );

      if (
        !Number.isFinite(totalCredits) ||
        totalCredits < 1
      ) {
        throw new Error(
          "Het totaal aantal beurten moet minstens 1 zijn."
        );
      }

      if (
        !Number.isFinite(remainingCredits) ||
        remainingCredits < 0
      ) {
        throw new Error(
          "Het resterende aantal beurten mag niet negatief zijn."
        );
      }

      if (remainingCredits > totalCredits) {
        throw new Error(
          "Het resterende aantal mag niet groter zijn dan het totaal."
        );
      }

      const response = await fetch(
        "/api/admin/lesson-cards",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id: passId,
            title: clean(formData.get("title")),
            totalCredits,
            remainingCredits,
            status: clean(formData.get("status")),
          }),
        }
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Beurtenkaart kon niet aangepast worden."
        );
      }

      setEditingId(null);
      setMessageType("success");
      setMessage("Beurtenkaart aangepast.");

      await loadPasses();
    } catch (error) {
      console.error("UPDATE LESSON CARD ERROR:", error);

      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Beurtenkaart kon niet aangepast worden."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function deletePass(passId: string) {
    const confirmed = window.confirm(
      "Ben je zeker dat je deze beurtenkaart definitief wilt verwijderen?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(passId);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/lesson-cards?id=${encodeURIComponent(
          passId
        )}`,
        {
          method: "DELETE",
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Beurtenkaart kon niet verwijderd worden."
        );
      }

      setPasses((currentPasses) =>
        currentPasses.filter((pass) => pass.id !== passId)
      );

      setMessageType("success");
      setMessage("Beurtenkaart verwijderd.");
    } catch (error) {
      console.error("DELETE LESSON CARD ERROR:", error);

      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Beurtenkaart kon niet verwijderd worden."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const totalCards = passes.length;

  const activeCards = passes.filter(
    (pass) =>
      !pass.status ||
      pass.status === "active"
  ).length;

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            Beurtenkaarten
          </p>

          <h2>Kaarten per klant</h2>

          <p className={styles.description}>
            Pas aantallen, titel en status overzichtelijk aan.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.stats}>
            <div>
              <strong>{totalCards}</strong>
              <span>kaarten</span>
            </div>

            <div>
              <strong>{activeCards}</strong>
              <span>actief</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => void loadPasses()}
          >
            ↻ Vernieuwen
          </button>
        </div>
      </header>

      {message && (
        <div
          className={`${styles.message} ${
            messageType === "error"
              ? styles.errorMessage
              : styles.successMessage
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className={styles.state}>
          <span className={styles.spinner} />
          <p>Beurtenkaarten laden…</p>
        </div>
      ) : passes.length === 0 ? (
        <div className={styles.state}>
          <span className={styles.emptyIcon}>🎟️</span>
          <h3>Nog geen beurtenkaarten</h3>
          <p>
            Zodra een klant een beurtenkaart heeft, verschijnt
            die hier.
          </p>
        </div>
      ) : (
        <div className={styles.customerList}>
          {Object.entries(groupedPasses).map(
            ([email, customerPasses]) => (
              <article
                key={email}
                className={styles.customerSection}
              >
                <div className={styles.customerHeader}>
                  <span
                    className={styles.customerIcon}
                    aria-hidden="true"
                  >
                    👤
                  </span>

                  <div>
                    <span className={styles.customerLabel}>
                      Klant
                    </span>

                    <h3>{email}</h3>

                    <p>
                      {customerPasses.length}{" "}
                      {customerPasses.length === 1
                        ? "beurtenkaart"
                        : "beurtenkaarten"}
                    </p>
                  </div>
                </div>

                <div className={styles.cardGrid}>
                  {customerPasses.map((pass) => {
                    const total =
                      pass.total_credits ??
                      pass.total_sessions ??
                      10;

                    const remaining =
                      pass.remaining_credits ??
                      pass.remaining_sessions ??
                      0;

                    const used = Math.max(
                      0,
                      total - remaining
                    );

                    const remainingPercentage =
                      total > 0
                        ? Math.max(
                            0,
                            Math.min(
                              100,
                              (remaining / total) * 100
                            )
                          )
                        : 0;

                    const status =
                      pass.status || "active";

                    const isSaving =
                      savingId === pass.id;

                    const isDeleting =
                      deletingId === pass.id;

                    return (
                      <div
                        key={pass.id}
                        className={styles.passCard}
                      >
                        {editingId === pass.id ? (
                          <form
                            className={styles.editForm}
                            onSubmit={(event) =>
                              void updatePass(
                                event,
                                pass.id
                              )
                            }
                          >
                            <div
                              className={styles.editFormHeader}
                            >
                              <span>✏️</span>

                              <div>
                                <small>
                                  Beurtenkaart aanpassen
                                </small>

                                <h4>
                                  {pass.title ||
                                    "Beurtenkaart"}
                                </h4>
                              </div>
                            </div>

                            <label
                              className={styles.formField}
                            >
                              <span>Titel</span>

                              <input
                                name="title"
                                defaultValue={
                                  pass.title || ""
                                }
                                required
                              />
                            </label>

                            <div
                              className={styles.formColumns}
                            >
                              <label
                                className={styles.formField}
                              >
                                <span>
                                  Totaal beurten
                                </span>

                                <input
                                  name="totalCredits"
                                  type="number"
                                  min="1"
                                  defaultValue={total}
                                  required
                                />
                              </label>

                              <label
                                className={styles.formField}
                              >
                                <span>
                                  Resterende beurten
                                </span>

                                <input
                                  name="remainingCredits"
                                  type="number"
                                  min="0"
                                  defaultValue={remaining}
                                  required
                                />
                              </label>
                            </div>

                            <label
                              className={styles.formField}
                            >
                              <span>Status</span>

                              <select
                                name="status"
                                defaultValue={status}
                              >
                                <option value="active">
                                  Actief
                                </option>

                                <option value="used">
                                  Opgebruikt
                                </option>

                                <option value="cancelled">
                                  Geannuleerd
                                </option>
                              </select>
                            </label>

                            <div
                              className={styles.formActions}
                            >
                              <button
                                type="submit"
                                className={
                                  styles.saveButton
                                }
                                disabled={isSaving}
                              >
                                {isSaving
                                  ? "Opslaan…"
                                  : "Opslaan"}
                              </button>

                              <button
                                type="button"
                                className={
                                  styles.cancelButton
                                }
                                disabled={isSaving}
                                onClick={() =>
                                  setEditingId(null)
                                }
                              >
                                Annuleren
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div
                              className={styles.passTop}
                            >
                              <span
                                className={styles.ticketIcon}
                                aria-hidden="true"
                              >
                                🎟️
                              </span>

                              <span
                                className={`${styles.statusBadge} ${
                                  status === "used"
                                    ? styles.usedStatus
                                    : status ===
                                      "cancelled"
                                    ? styles.cancelledStatus
                                    : styles.activeStatus
                                }`}
                              >
                                {getStatusLabel(status)}
                              </span>
                            </div>

                            <h4>
                              {pass.title ||
                                "Beurtenkaart"}
                            </h4>

                            <div
                              className={styles.numberGrid}
                            >
                              <div>
                                <strong>{remaining}</strong>
                                <span>resterend</span>
                              </div>

                              <div>
                                <strong>{used}</strong>
                                <span>gebruikt</span>
                              </div>

                              <div>
                                <strong>{total}</strong>
                                <span>totaal</span>
                              </div>
                            </div>

                            <div
                              className={styles.progressTrack}
                              aria-label={`${remaining} van ${total} beurten resterend`}
                            >
                              <span
                                style={{
                                  width: `${remainingPercentage}%`,
                                }}
                              />
                            </div>

                            <div
                              className={styles.cardActions}
                            >
                              <button
                                type="button"
                                className={styles.editButton}
                                onClick={() =>
                                  setEditingId(pass.id)
                                }
                              >
                                Aanpassen
                              </button>

                              <button
                                type="button"
                                className={
                                  styles.deleteButton
                                }
                                disabled={isDeleting}
                                onClick={() =>
                                  void deletePass(pass.id)
                                }
                              >
                                {isDeleting
                                  ? "Verwijderen…"
                                  : "Verwijderen"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}