"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;
  title: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: string | null;
};

export default function CustomerAppointments({ email }: { email: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select("id,title,start_time,end_time,location,status")
        .eq("customer_email", email)
        .neq("status", "cancelled")
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Fout bij laden afspraken:", error);
        setLoading(false);
        return;
      }

      setBookings(data ?? []);
      setLoading(false);
    }

    if (email) {
      loadBookings();
    }
  }, [email]);

  async function cancelBooking(booking: Booking) {
    const confirmed = window.confirm(
      "Ben je zeker dat je deze afspraak wilt annuleren?"
    );

    if (!confirmed) return;

    setCancellingId(booking.id);

    try {
      const response = await fetch("/api/cancel-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const text = await response.text();
      console.log("Cancel response:", response.status, text);

      let result: { error?: string } = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        alert("Server gaf geen geldige JSON terug. Kijk in de console.");
        return;
      }

      if (!response.ok) {
        alert(result.error ?? "Annuleren is mislukt.");
        return;
      }

      setBookings((current) =>
        current.filter((item) => item.id !== booking.id)
      );

      alert("Je afspraak werd geannuleerd.");
    } catch (error) {
      console.error("Fout bij annuleren:", error);
      alert("Er ging iets mis bij het annuleren.");
    } finally {
      setCancellingId(null);
    }
  }

  function translateStatus(status: string | null) {
    switch (status) {
      case "confirmed":
        return "Afspraak bevestigd";
      case "pending":
        return "Afspraak in behandeling";
      case "cancelled":
        return "Afspraak geannuleerd";
      default:
        return "Afspraak";
    }
  }

  if (loading) {
    return <p>Afspraken laden...</p>;
  }

  if (bookings.length === 0) {
    return <p>Er staan momenteel geen actieve afspraken in je dashboard.</p>;
  }

  return (
    <div className="agenda-list">
      {bookings.map((booking) => (
        <div className="agenda-item" key={booking.id}>
          <strong>{booking.title || "Afspraak Studio SaGo"}</strong>

          {booking.start_time && (
            <p>
              📅{" "}
              {new Date(booking.start_time).toLocaleString("nl-BE", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          {booking.location && <p>📍 {booking.location}</p>}

          <p className="appointment-status">
            {booking.status === "confirmed" && "✅ "}
            {booking.status === "pending" && "🕒 "}
            {translateStatus(booking.status)}
          </p>

          <button
            type="button"
            className="cancel-booking"
            onClick={() => cancelBooking(booking)}
            disabled={cancellingId === booking.id}
          >
            {cancellingId === booking.id
              ? "Annuleren..."
              : "Afspraak annuleren"}
          </button>
        </div>
      ))}
    </div>
  );
}