"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  title: string | null;
  customer_name: string | null;
  customer_email: string | null;
  location: string | null;
  notes: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  start_time: string | null;
  end_time: string | null;
  service_type: string | null;
  status: string | null;
  payment_status: string | null;
};

function detectType(item: Booking) {
  const text = `
    ${item.title || ""}
    ${item.notes || ""}
    ${item.service_type || ""}
  `.toLowerCase();

  if (
    text.includes("kennismaking") ||
    text.includes("kennismakingsgesprek") ||
    text.includes("intake") ||
    text.includes("introductie")
  ) {
    return "kennismaking";
  }

  if (
    text.includes("huiswerk") ||
    text.includes("studiecoaching") ||
    text.includes("coaching") ||
    text.includes("bijles") ||
    text.includes("begeleiding") ||
    text.includes("lager") ||
    text.includes("secundair")
  ) {
    return "begeleiding";
  }

  return "andere";
}
function getTypeLabel(type: string) {
  if (type === "kennismaking") return "🟢 Kennismaking";
  if (type === "begeleiding") return "🔵 Huiswerkbegeleiding / coaching";
  return "⚪ Andere afspraak";
}

function formatDate(item: Booking) {
  const value = item.appointment_date || item.start_time;

  if (!value) return "Nog geen datum";

  return new Intl.DateTimeFormat("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminAgenda() {
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [message, setMessage] = useState("Laden...");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function loadAgenda() {
    setMessage("Laden...");

    try {
      const response = await fetch("/api/admin/agenda", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Agenda kon niet geladen worden.");
        return;
      }

      const filtered = (data.appointments ?? []).filter(
        (item: Booking) => item.status !== "cancelled"
      );

      setAppointments(filtered);
      setMessage(filtered.length ? "" : "Geen afspraken gevonden.");
    } catch (error) {
      console.error(error);
      setMessage("Agenda kon niet geladen worden.");
    }
  }

  useEffect(() => {
    loadAgenda();
  }, []);

  async function updateBookingStatus(bookingId: string, status: string) {
    setLoadingId(bookingId);

    try {
      const response = await fetch("/api/admin/bookings/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Status kon niet aangepast worden.");
        return;
      }

      await loadAgenda();
    } catch (error) {
      console.error(error);
      alert("Status kon niet aangepast worden.");
    } finally {
      setLoadingId(null);
    }
  }

  async function deductPass(bookingId: string) {
    setLoadingId(bookingId);

    try {
      const response = await fetch("/api/admin/bookings/deduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Beurt kon niet afgeschreven worden.");
        return;
      }

      await loadAgenda();
    } catch (error) {
      console.error(error);
      alert("Beurt kon niet afgeschreven worden.");
    } finally {
      setLoadingId(null);
    }
  }

  const kennismaking = appointments.filter(
    (item) => detectType(item) === "kennismaking"
  );

  const begeleiding = appointments.filter(
    (item) => detectType(item) === "begeleiding"
  );

  const andere = appointments.filter((item) => detectType(item) === "andere");

  function renderAppointments(list: Booking[]) {
    return (
      <div className="admin-request-list">
        {list.map((item) => {
          const type = detectType(item);
          const isLoading = loadingId === item.id;

          return (
            <article className="admin-request-card" key={item.id}>
              <h3>{item.title || "Afspraak Studio SaGo"}</h3>

              <p>
                <strong>Type:</strong> {getTypeLabel(type)}
              </p>

              <p>
                <strong>Datum:</strong> {formatDate(item)}
              </p>

              <p>
                <strong>Uur:</strong>{" "}
                {item.appointment_time ||
                  `${formatTime(item.start_time)}${
                    item.end_time ? ` - ${formatTime(item.end_time)}` : ""
                  }`}
              </p>

              {(item.customer_name || item.customer_email) && (
                <p>
                  <strong>Klant:</strong>{" "}
                  {item.customer_name || item.customer_email}
                  {item.customer_email && item.customer_name
                    ? ` · ${item.customer_email}`
                    : ""}
                </p>
              )}

              <p>
                <strong>Status:</strong> {item.status || "pending"}
              </p>

              <p>
                <strong>Betaling:</strong> {item.payment_status || "unpaid"}
              </p>

              {item.notes && (
                <div className="admin-request-notes">
                  <pre>{item.notes}</pre>
                </div>
              )}

              <div className="admin-request-actions">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => updateBookingStatus(item.id, "confirmed")}
                >
                  ✅ {isLoading ? "Bezig..." : "Goedkeuren"}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => updateBookingStatus(item.id, "completed")}
                >
                  ✔️ Les afgerond
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => deductPass(item.id)}
                >
                  🎟️ Beurt afschrijven
                </button>

                <button
                  type="button"
                  onClick={() => alert("Factuurfunctie volgt later.")}
                >
                  📄 Factuur
                </button>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <section className="table-card">
      <div className="admin-section-header">
        <div>
          <p className="eyebrow">Agenda</p>
          <h2>Google Agenda</h2>
          <p>Kennismakingen en begeleidingen uit je gesynchroniseerde agenda.</p>
        </div>

        <button
          type="button"
          className="secondary-action small-action"
          onClick={loadAgenda}
        >
          Vernieuwen
        </button>
      </div>

      {message && <p>{message}</p>}

      {!message && (
        <>
          <h3>🟢 Kennismaking</h3>
          {kennismaking.length ? (
            renderAppointments(kennismaking)
          ) : (
            <p>Geen kennismakingen.</p>
          )}

          <h3 style={{ marginTop: 34 }}>
            🔵 Huiswerkbegeleiding / coaching
          </h3>
          {begeleiding.length ? (
            renderAppointments(begeleiding)
          ) : (
            <p>Geen begeleidingen.</p>
          )}

          {andere.length > 0 && (
            <>
              <h3 style={{ marginTop: 34 }}>⚪ Andere afspraken</h3>
              {renderAppointments(andere)}
            </>
          )}
        </>
      )}
    </section>
  );
}