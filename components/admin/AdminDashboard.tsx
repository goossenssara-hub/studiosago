"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [contacts, setContacts] = useState(0);
  const [bookings, setBookings] = useState(0);
  const [passes, setPasses] = useState(0);
  const [payments, setPayments] = useState(0);
  const [availability, setAvailability] = useState(0);

  useEffect(() => {
    async function loadStats() {
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

      setContacts(contactsResult.count ?? 0);
      setBookings(bookingsResult.count ?? 0);
      setPasses(passesResult.count ?? 0);
      setPayments(paymentsResult.count ?? 0);
      setAvailability(availabilityResult.count ?? 0);
    }

    loadStats();
  }, []);

  return (
    <div className="admin-dashboard-grid">
      <div className="table-card stat-card">
        <span>📥</span>
        <h2>{bookings}</h2>
        <p>Afspraken / aanvragen</p>
      </div>

      <div className="table-card stat-card">
        <span>👤</span>
        <h2>{contacts}</h2>
        <p>Contacten</p>
      </div>

      <div className="table-card stat-card">
        <span>🎟️</span>
        <h2>{passes}</h2>
        <p>Actieve beurtenkaarten</p>
      </div>

      <div className="table-card stat-card">
        <span>🕒</span>
        <h2>{availability}</h2>
        <p>Beschikbare momenten</p>
      </div>

      <div className="table-card stat-card">
        <span>💶</span>
        <h2>{payments}</h2>
        <p>Openstaande betalingen</p>
      </div>
    </div>
  );
}