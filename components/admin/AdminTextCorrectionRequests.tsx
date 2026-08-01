"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AdminTextCorrectionRequests.module.css";

type TextCorrectionRequest = {
  id: string;
  checkout_id: string;
  mollie_payment_id: string | null;
  payment_status: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string | null;
  original_file_name: string;
  mime_type: string | null;
  word_count: number;
  total_amount: number;
  text_type: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
};

type StatusFilter = "all" | "paid" | "open" | "failed";

function money(value: number) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Datum onbekend";
  }

  return new Intl.DateTimeFormat("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Brussels",
  }).format(date);
}

function getStatusLabel(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "paid") return "Betaald";
  if (normalized === "open" || normalized === "pending") return "Wacht op betaling";
  if (normalized === "failed") return "Mislukt";
  if (normalized === "canceled" || normalized === "cancelled") return "Geannuleerd";
  if (normalized === "expired") return "Verlopen";

  return status || "Onbekend";
}

function getStatusClass(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "paid") return styles.statusPaid;
  if (normalized === "failed" || normalized === "canceled" || normalized === "cancelled") {
    return styles.statusFailed;
  }

  return styles.statusOpen;
}

export default function AdminTextCorrectionRequests() {
  const [requests, setRequests] = useState<TextCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/text-corrections", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Aanvragen laden is mislukt.");
      }

      setRequests(data.requests ?? []);
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Aanvragen laden is mislukt."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const paidCount = useMemo(
    () => requests.filter((item) => item.payment_status === "paid").length,
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("nl-BE");

    return requests.filter((item) => {
      const normalizedStatus = item.payment_status.trim().toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && normalizedStatus === "paid") ||
        (statusFilter === "open" && ["open", "pending"].includes(normalizedStatus)) ||
        (statusFilter === "failed" &&
          ["failed", "canceled", "cancelled", "expired"].includes(normalizedStatus));

      if (!matchesStatus) return false;
      if (!query) return true;

      return [
        item.original_file_name,
        item.customer_first_name,
        item.customer_last_name,
        item.customer_email,
        item.text_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("nl-BE")
        .includes(query);
    });
  }, [requests, search, statusFilter]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <span />
        <p>Tekstcorrectie-aanvragen laden…</p>
      </div>
    );
  }

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Aanvragen</p>
          <h1>Tekstcorrectie</h1>
          <p>
            Beheer aangeleverde documenten, controleer de betaalstatus en
            download bestanden veilig voor verdere verwerking.
          </p>
        </div>

        <div className={styles.stats}>
          <article>
            <span>Totaal</span>
            <strong>{requests.length}</strong>
          </article>
          <article>
            <span>Betaald</span>
            <strong>{paidCount}</strong>
          </article>
        </div>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          <span>!</span>
          <p>{error}</p>
          <button type="button" onClick={() => void load()}>
            Opnieuw proberen
          </button>
        </div>
      )}

      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <span>Zoeken</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Zoek op klant, e-mail of bestandsnaam…"
          />
        </label>

        <label className={styles.filterField}>
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="all">Alle aanvragen</option>
            <option value="paid">Betaald</option>
            <option value="open">Wacht op betaling</option>
            <option value="failed">Mislukt of geannuleerd</option>
          </select>
        </label>

        <button className={styles.refreshButton} type="button" onClick={() => void load()}>
          Vernieuwen
        </button>
      </div>

      {requests.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <p className={styles.eyebrow}>Nog niets ontvangen</p>
          <h2>Er zijn nog geen tekstcorrectie-aanvragen</h2>
          <p>
            Zodra een klant via de webshop een document uploadt en de aanvraag
            wordt opgeslagen, verschijnt die hier automatisch.
          </p>
          <a href="/webshop/tekstcorrectie" className={styles.secondaryLink}>
            Open tekstcorrectie in webshop
          </a>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔎</div>
          <h2>Geen aanvragen gevonden</h2>
          <p>Pas je zoekterm of statusfilter aan.</p>
        </div>
      ) : (
        <div className={styles.cards}>
          {filteredRequests.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.fileInfo}>
                  <span className={`${styles.statusBadge} ${getStatusClass(item.payment_status)}`}>
                    {getStatusLabel(item.payment_status)}
                  </span>
                  <h2>{item.original_file_name}</h2>
                  <p>
                    {item.customer_first_name} {item.customer_last_name}
                  </p>
                  <a href={`mailto:${item.customer_email}`}>{item.customer_email}</a>
                </div>

                <div className={styles.amountBox}>
                  <span>Bedrag</span>
                  <strong>{money(item.total_amount)}</strong>
                </div>
              </div>

              <div className={styles.metaGrid}>
                <div>
                  <span>Woorden</span>
                  <strong>{item.word_count.toLocaleString("nl-BE")}</strong>
                </div>
                <div>
                  <span>Teksttype</span>
                  <strong>{item.text_type || "Niet opgegeven"}</strong>
                </div>
                <div>
                  <span>Aangevraagd</span>
                  <strong>{formatDate(item.created_at)}</strong>
                </div>
                <div>
                  <span>Telefoon</span>
                  <strong>{item.customer_phone || "Niet opgegeven"}</strong>
                </div>
              </div>

              {item.notes && (
                <div className={styles.notes}>
                  <span>Opmerkingen</span>
                  <p>{item.notes}</p>
                </div>
              )}

              <div className={styles.actions}>
                <a
                  className={styles.downloadButton}
                  href={`/api/admin/text-corrections/${encodeURIComponent(item.id)}/download`}
                >
                  Document downloaden
                </a>
                <a className={styles.mailButton} href={`mailto:${item.customer_email}`}>
                  Klant mailen
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
