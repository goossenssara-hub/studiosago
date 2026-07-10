"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminDashboardProps = {
  setTab?: (tab: string) => void;
};

type DashboardStats = {
  contacts: number;
  bookings: number;
  passes: number;
  payments: number;
  availability: number;
};

const initialStats: DashboardStats = {
  contacts: 0,
  bookings: 0,
  passes: 0,
  payments: 0,
  availability: 0,
};

export default function AdminDashboard({
  setTab,
}: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      if (!supabase) {
        setMessage("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const [
          contactsResult,
          bookingsResult,
          passesResult,
          paymentsResult,
          availabilityResult,
        ] = await Promise.all([
          supabase
            .from("contacts")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("passes")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),

          supabase
            .from("payments")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),

          supabase
            .from("availability")
            .select("*", { count: "exact", head: true })
            .eq("active", true),
        ]);

        const errors = [
          contactsResult.error,
          bookingsResult.error,
          passesResult.error,
          paymentsResult.error,
          availabilityResult.error,
        ].filter(Boolean);

        if (errors.length > 0) {
          console.error("ADMIN DASHBOARD ERRORS:", errors);
          setMessage(
            "Een deel van de dashboardgegevens kon niet geladen worden."
          );
        }

        if (!mounted) return;

        setStats({
          contacts: contactsResult.count ?? 0,
          bookings: bookingsResult.count ?? 0,
          passes: passesResult.count ?? 0,
          payments: paymentsResult.count ?? 0,
          availability: availabilityResult.count ?? 0,
        });
      } catch (error) {
        console.error("ADMIN DASHBOARD ERROR:", error);

        if (mounted) {
          setMessage("Het dashboard kon niet geladen worden.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const statCards = [
    {
      label: "Aanvragen",
      value: stats.bookings,
      icon: "📥",
      tab: "requests",
      description: "Afspraken en aanvragen",
      tone: "orange",
    },
    {
      label: "Contacten",
      value: stats.contacts,
      icon: "👤",
      tab: "parents",
      description: "Ouders en klanten",
      tone: "teal",
    },
    {
      label: "Beurtenkaarten",
      value: stats.passes,
      icon: "🎟️",
      tab: "cards",
      description: "Actieve kaarten",
      tone: "purple",
    },
    {
      label: "Vrije momenten",
      value: stats.availability,
      icon: "🕒",
      tab: "availability",
      description: "Boekbare tijdstippen",
      tone: "blue",
    },
  ];

  const today = new Intl.DateTimeFormat("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <p className="admin-section-eyebrow">Dashboard</p>
          <h2>Overzicht</h2>
          <p>
            Bekijk wat aandacht nodig heeft en ga meteen naar de juiste
            beheerpagina.
          </p>
        </div>

        <div className="admin-today">
          <span>Vandaag</span>
          <strong>{today}</strong>
        </div>
      </header>

      {message && (
        <div className="admin-dashboard-message">
          <span>⚠️</span>
          <p>{message}</p>
        </div>
      )}

      {loading ? (
        <div className="admin-dashboard-loading">
          <span className="admin-loading-spinner" />
          <p>Dashboard laden...</p>
        </div>
      ) : (
        <>
          <section className="admin-stat-grid">
            {statCards.map((card) => (
              <button
                key={card.label}
                type="button"
                className={`admin-stat-card admin-stat-card--${card.tone}`}
                onClick={() => setTab?.(card.tab)}
              >
                <div className="admin-stat-card__top">
                  <span className="admin-stat-card__icon">
                    {card.icon}
                  </span>

                  <span className="admin-stat-card__arrow">→</span>
                </div>

                <strong>{card.value}</strong>
                <h3>{card.label}</h3>
                <p>{card.description}</p>
              </button>
            ))}
          </section>

          <section className="admin-dashboard-panels">
            <article
              className={`admin-attention-card ${
                stats.payments > 0
                  ? "admin-attention-card--warning"
                  : "admin-attention-card--success"
              }`}
            >
              <div className="admin-attention-card__top">
                <span className="admin-attention-card__icon">💶</span>

                <div>
                  <p>Openstaande betalingen</p>
                  <strong>{stats.payments}</strong>
                </div>
              </div>

              <p className="admin-attention-card__description">
                {stats.payments === 0
                  ? "Alle geregistreerde betalingen zijn momenteel verwerkt."
                  : `${stats.payments} betaling${
                      stats.payments === 1 ? "" : "en"
                    } wacht${
                      stats.payments === 1 ? "" : "en"
                    } nog op verwerking.`}
              </p>

              <button
                type="button"
                onClick={() => setTab?.("payments")}
              >
                Betalingen bekijken
                <span>→</span>
              </button>
            </article>

            <article className="admin-quick-panel">
              <div className="admin-quick-panel__header">
                <div>
                  <p className="admin-section-eyebrow">
                    Snelle acties
                  </p>
                  <h3>Direct beheren</h3>
                </div>
              </div>

              <div className="admin-quick-actions">
                <button
                  type="button"
                  onClick={() => setTab?.("requests")}
                >
                  <span className="admin-quick-icon">📥</span>

                  <span className="admin-quick-text">
                    <strong>Aanvragen bekijken</strong>
                    <small>Nieuwe aanvragen verwerken</small>
                  </span>

                  <span className="admin-quick-arrow">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab?.("agenda")}
                >
                  <span className="admin-quick-icon">📅</span>

                  <span className="admin-quick-text">
                    <strong>Agenda openen</strong>
                    <small>Lessen en afspraken bekijken</small>
                  </span>

                  <span className="admin-quick-arrow">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab?.("availability")}
                >
                  <span className="admin-quick-icon">🕒</span>

                  <span className="admin-quick-text">
                    <strong>Vrije momenten</strong>
                    <small>Beschikbaarheid toevoegen</small>
                  </span>

                  <span className="admin-quick-arrow">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab?.("students")}
                >
                  <span className="admin-quick-icon">🎓</span>

                  <span className="admin-quick-text">
                    <strong>Leerlingen</strong>
                    <small>Profielen bekijken en beheren</small>
                  </span>

                  <span className="admin-quick-arrow">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab?.("cards")}
                >
                  <span className="admin-quick-icon">🎟️</span>

                  <span className="admin-quick-text">
                    <strong>Beurtenkaarten</strong>
                    <small>Kaarten en resterende beurten</small>
                  </span>

                  <span className="admin-quick-arrow">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab?.("discounts")}
                >
                  <span className="admin-quick-icon">🏷️</span>

                  <span className="admin-quick-text">
                    <strong>Kortingscodes</strong>
                    <small>Codes aanmaken en beheren</small>
                  </span>

                  <span className="admin-quick-arrow">→</span>
                </button>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}