"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [contacts, setContacts] = useState(0);
  const [bookings, setBookings] = useState(0);

  useEffect(() => {
    async function loadStats() {
      const { count: contactCount } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true });

      const { count: bookingCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });

      setContacts(contactCount ?? 0);
      setBookings(bookingCount ?? 0);
    }

    loadStats();
  }, []);

  return (
    <div className="admin-dashboard-grid">
      <div className="table-card stat-card">
        <span>📥</span>
        <h2>{bookings}</h2>
        <p>Aanvragen</p>
      </div>

      <div className="table-card stat-card">
        <span>👤</span>
        <h2>{contacts}</h2>
        <p>Contacten</p>
      </div>

      <div className="table-card stat-card">
        <span>🎟️</span>
        <h2>0</h2>
        <p>Actieve beurtenkaarten</p>
      </div>

      <div className="table-card stat-card">
        <span>💶</span>
        <h2>€0</h2>
        <p>Openstaande betalingen</p>
      </div>
    </div>
  );
}