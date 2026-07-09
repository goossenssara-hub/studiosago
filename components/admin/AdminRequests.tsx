"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RequestItem = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  phone: string | null;
  notes: string | null;
  service: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string | null;
  pass_id: string | null;
};

export default function AdminRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [message, setMessage] = useState("Laden...");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function loadRequests() {
    setRefreshing(true);
    setMessage("Laden...");

    try {
      const response = await fetch(`/api/admin/requests?t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setRequests([]);
        setMessage(data.error || "Kon aanvragen niet laden.");
        return;
      }

      setRequests(data.requests || []);
      setMessage(
        data.requests?.length ? "" : "Nog geen nieuwe aanvragen."
      );
    } catch (error) {
      setRequests([]);
      setMessage("Kon aanvragen niet laden.");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function approveRequest(request: RequestItem) {
    setLoadingId(request.id);

    try {
      const response = await fetch("/api/admin/appointments/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: request.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Aanvraag kon niet goedgekeurd worden.");
        return;
      }

      await loadRequests();
    } catch {
      alert("Er ging iets mis bij het goedkeuren.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="table-card">
      <div className="admin-section-header">
        <div>
          <p className="eyebrow">Inbox</p>
          <h2>Nieuwe aanvragen</h2>
        </div>

        <button
          type="button"
          className="secondary-action small-action"
          onClick={loadRequests}
          disabled={refreshing}
        >
          {refreshing ? "Vernieuwen..." : "Vernieuwen"}
        </button>
      </div>

      {message && <p>{message}</p>}

      <div className="admin-request-list">
        {requests.map((request) => (
          <article className="admin-request-card" key={request.id}>
            <div>
              <h3>{request.customer_name || "Naam onbekend"}</h3>
              <p>{request.customer_email || "Geen e-mailadres"}</p>
              <p>{request.phone || "Geen telefoonnummer"}</p>

              {request.service && <p>Dienst: {request.service}</p>}

              {request.date && (
                <p>
                  Afspraak: {request.date}
                  {request.start_time ? ` om ${request.start_time}` : ""}
                  {request.end_time ? ` - ${request.end_time}` : ""}
                </p>
              )}
            </div>

            {request.notes && (
              <div className="admin-request-notes">
                <pre>{request.notes}</pre>
              </div>
            )}

            <div className="admin-request-actions">
              <button
                type="button"
                onClick={() => approveRequest(request)}
                disabled={loadingId === request.id}
              >
                ✅ {loadingId === request.id ? "Goedkeuren..." : "Goedkeuren"}
              </button>

              <Link href={`/admin/les-inplannen?appointmentId=${request.id}`}>
                📅 Les inplannen
              </Link>

              <Link href={`/admin/factuur?appointmentId=${request.id}`}>
                📄 Factuur
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}