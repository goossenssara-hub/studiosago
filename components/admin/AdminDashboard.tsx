"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AdminDashboard.module.css";

type DashboardStats = {
  requests: number;
  contacts: number;
  passes: number;
  todayAppointments: number;
  todayWorkshops: number;
  todayLessons: number;
  syncIssues: number;
  emptyPasses: number;
  revenueThisMonth: number;
  revenuePreviousMonth: number;
  revenueDifferencePercentage: number | null;
};

type UpcomingItem = {
  id: string;
  title: string;
  customer: string;
  startTime: string | null;
  location: string;
  serviceType: string;
};

type DashboardResponse = {
  stats: DashboardStats;
  upcoming: UpcomingItem[];
  todayLabel: string;
  error?: string;
};

type AdminDashboardProps = {
  setTab?: (tab: string) => void;
};

const initialStats: DashboardStats = {
  requests: 0,
  contacts: 0,
  passes: 0,
  todayAppointments: 0,
  todayWorkshops: 0,
  todayLessons: 0,
  syncIssues: 0,
  emptyPasses: 0,
  revenueThisMonth: 0,
  revenuePreviousMonth: 0,
  revenueDifferencePercentage: null,
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatUpcomingDate(value: string | null) {
  if (!value) return "Datum ontbreekt";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Datum ontbreekt";
  }

  return new Intl.DateTimeFormat("nl-BE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Brussels",
  }).format(date);
}

export default function AdminDashboard({
  setTab,
}: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);
  const [todayLabel, setTodayLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = (await response.json()) as DashboardResponse;

      if (!response.ok) {
        throw new Error(
          data.error || "Het dashboard kon niet geladen worden."
        );
      }

      setStats(data.stats ?? initialStats);
      setUpcoming(data.upcoming ?? []);
      setTodayLabel(data.todayLabel ?? "");
    } catch (error) {
      console.error("ADMIN DASHBOARD LOAD ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Het dashboard kon niet geladen worden."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const actionCount = useMemo(
    () => stats.requests + stats.syncIssues + stats.emptyPasses,
    [stats]
  );

  const revenueTrend = useMemo(() => {
if (stats.revenueDifferencePercentage === null) {
  return {
    label: "Nog geen vergelijking",
    positive: true,
  };
}
    const positive = stats.revenueDifferencePercentage >= 0;
    const absolute = Math.abs(stats.revenueDifferencePercentage);

    return {
      label: `${positive ? "+" : "−"}${absolute.toFixed(0)}% tegenover vorige maand`,
      positive,
    };
  }, [stats.revenueDifferencePercentage]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <span />
        <p>Dashboard laden…</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Dashboard</p>
          <h2>Overzicht</h2>
          <span>
            Bekijk wat vandaag gepland staat en wat nog aandacht nodig heeft.
          </span>
        </div>

        <div className={styles.today}>
          <small>Vandaag</small>
          <strong>{todayLabel || "Vandaag"}</strong>
        </div>
      </header>

      {message && (
        <div className={styles.message}>
          <span>!</span>
          <p>{message}</p>
          <button type="button" onClick={() => void loadDashboard()}>
            Opnieuw proberen
          </button>
        </div>
      )}

      <section className={styles.topGrid}>
        <button
          type="button"
          className={`${styles.mainCard} ${styles.orange}`}
          onClick={() => setTab?.("requests")}
        >
          <div className={styles.icon}>📥</div>
          <strong>{stats.requests}</strong>
          <h3>Nieuwe aanvragen</h3>
          <p>Aanvragen die nog verwerkt moeten worden.</p>
          <span>Open aanvragen →</span>
        </button>

        <button
          type="button"
          className={`${styles.mainCard} ${styles.teal}`}
          onClick={() => setTab?.("parents")}
        >
          <div className={styles.icon}>👤</div>
          <strong>{stats.contacts}</strong>
          <h3>Contacten</h3>
          <p>Ouders en klanten in je administratie.</p>
          <span>Open contacten →</span>
        </button>

        <button
          type="button"
          className={`${styles.mainCard} ${styles.purple}`}
          onClick={() => setTab?.("cards")}
        >
          <div className={styles.icon}>🎟️</div>
          <strong>{stats.passes}</strong>
          <h3>Actieve beurtenkaarten</h3>
          <p>Kaarten die momenteel gebruikt kunnen worden.</p>
          <span>Open kaarten →</span>
        </button>
      </section>

      <section className={styles.insightGrid}>
        <article className={styles.todayPanel}>
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Vandaag</p>
              <h3>Planning van de dag</h3>
            </div>

            <button type="button" onClick={() => setTab?.("agenda")}>
              Agenda openen
            </button>
          </div>

          <div className={styles.todayStats}>
            <div>
              <span>📅</span>
              <strong>{stats.todayAppointments}</strong>
              <small>Afspraken</small>
            </div>

            <div>
              <span>🏕️</span>
              <strong>{stats.todayWorkshops}</strong>
              <small>Workshops</small>
            </div>

            <div>
              <span>📚</span>
              <strong>{stats.todayLessons}</strong>
              <small>Lessen</small>
            </div>
          </div>

          <div className={styles.upcoming}>
            <h4>Eerstvolgende afspraken</h4>

            {upcoming.length === 0 ? (
              <p className={styles.empty}>
                Er zijn geen komende afspraken gevonden.
              </p>
            ) : (
              upcoming.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.upcomingItem}
                  onClick={() => setTab?.("agenda")}
                >
                  <span className={styles.upcomingTime}>
                    {formatUpcomingDate(item.startTime)}
                  </span>

                  <span className={styles.upcomingInfo}>
                    <strong>{item.title}</strong>
                    <small>
                      {item.customer}
                      {item.location ? ` · ${item.location}` : ""}
                    </small>
                  </span>

                  <span className={styles.arrow}>›</span>
                </button>
              ))
            )}
          </div>
        </article>

        <article className={styles.actionPanel}>
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Actie nodig</p>
              <h3>{actionCount} aandachtspunt(en)</h3>
            </div>

            <span className={styles.warningIcon}>!</span>
          </div>

          <button
            type="button"
            className={styles.actionItem}
            onClick={() => setTab?.("requests")}
          >
            <span className={styles.actionIcon}>📥</span>
            <span>
              <strong>{stats.requests} nieuwe aanvragen</strong>
              <small>Nog niet goedgekeurd of verwerkt</small>
            </span>
            <b>›</b>
          </button>

          <button
            type="button"
            className={styles.actionItem}
            onClick={() => setTab?.("agenda")}
          >
            <span className={styles.actionIcon}>🔄</span>
            <span>
              <strong>{stats.syncIssues} synchronisatieproblemen</strong>
              <small>Controleer afspraken zonder Google-koppeling</small>
            </span>
            <b>›</b>
          </button>

          <button
            type="button"
            className={styles.actionItem}
            onClick={() => setTab?.("cards")}
          >
            <span className={styles.actionIcon}>🎟️</span>
            <span>
              <strong>{stats.emptyPasses} lege beurtenkaarten</strong>
              <small>Actieve kaarten zonder resterende beurten</small>
            </span>
            <b>›</b>
          </button>
        </article>
      </section>

      <section className={styles.revenuePanel}>
        <div className={styles.revenueHeader}>
          <div>
            <p className={styles.eyebrow}>Omzet</p>
            <h3>Betaalde Mollie-transacties</h3>
            <span>
              Alleen betalingen met definitieve status <strong>paid</strong>.
            </span>
          </div>

          <button type="button" onClick={() => setTab?.("payments")}>
            Betalingen bekijken
          </button>
        </div>

        <div className={styles.revenueGrid}>
          <article>
            <span>Deze maand</span>
            <strong>{formatMoney(stats.revenueThisMonth)}</strong>
          </article>

          <article>
            <span>Vorige maand</span>
            <strong>{formatMoney(stats.revenuePreviousMonth)}</strong>
          </article>

          <article
            className={
              revenueTrend.positive
                ? styles.positiveTrend
                : styles.negativeTrend
            }
          >
            <span>Vergelijking</span>
            <strong>{revenueTrend.label}</strong>
          </article>
        </div>
      </section>
    </div>
  );
}
