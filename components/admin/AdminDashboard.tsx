"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  setTab?: (tab: string) => void;
};

export default function AdminDashboard({ setTab }: Props) {
  const [contacts, setContacts] = useState(0);
  const [bookings, setBookings] = useState(0);
  const [passes, setPasses] = useState(0);
  const [payments, setPayments] = useState(0);
  const [availability, setAvailability] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadStats() {
      if (!supabase) {
        setMessage("Supabase is niet geconfigureerd.");
        return;
      }

      const [contactsResult, bookingsResult, passesResult, paymentsResult, availabilityResult] =
        await Promise.all([
          supabase.from("contacts").select("*", { count: "exact", head: true }),
          supabase.from("bookings").select("*", { count: "exact", head: true }),
          supabase.from("passes").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("availability").select("*", { count: "exact", head: true }).eq("active", true),
        ]);

      setContacts(contactsResult.count ?? 0);
      setBookings(bookingsResult.count ?? 0);
      setPasses(passesResult.count ?? 0);
      setPayments(paymentsResult.count ?? 0);
      setAvailability(availabilityResult.count ?? 0);
    }

    loadStats();
  }, []);

  const stats = [
    { label: "Aanvragen", value: bookings, icon: "📥", tab: "requests" },
    { label: "Contacten", value: contacts, icon: "👤", tab: "parents" },
    { label: "Beurtenkaarten", value: passes, icon: "🎟️", tab: "cards" },
    { label: "Beschikbaarheden", value: availability, icon: "🕒", tab: "availability" },
    { label: "Open betalingen", value: payments, icon: "💶", tab: "payments" },
  ];

  return (
    <div className="admin-dashboard-clean">
      {message && <p className="form-message">{message}</p>}

      <div className="dashboard-heading">
        <div>
          <h2>Overzicht</h2>
          <p>Dit zijn de belangrijkste gegevens van je Studio SaGo beheer.</p>
        </div>
      </div>

      <div className="admin-stat-grid-clean">
        {stats.map((stat) => (
          <button
            key={stat.label}
            className="admin-stat-card-clean"
            onClick={() => setTab?.(stat.tab)}
          >
            <span className="stat-icon">{stat.icon}</span>
            <strong>{stat.value}</strong>
            <p>{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="admin-quick-grid">
        <button onClick={() => setTab?.("requests")}>Nieuwe aanvragen bekijken</button>
        <button onClick={() => setTab?.("agenda")}>Agenda openen</button>
        <button onClick={() => setTab?.("availability")}>Beschikbaarheid aanpassen</button>
      </div>
    </div>
  );
}