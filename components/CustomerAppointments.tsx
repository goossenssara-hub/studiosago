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
      const { data, error } = await supabase
        .from("bookings")
        .select("id,title,start_time,end_time,location,status")
        .eq("customer_email", email)
        .order("start_time", { ascending: true });

      if (!error && data) {
        setBookings(data);
      }

      setLoading(false);
    }

    loadBookings();
  }, [email]);

  async function cancelBooking(booking: Booking) {
    const confirmed = window.confirm(
      "Ben je zeker dat je deze afspraak wilt annuleren?"
    );

    if (!confirmed) return;

    setCancellingId(booking.id);

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", booking.id);

      if (error) {
        alert("Annuleren is mislukt.");
        console.error(error);
        return;
      }

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id ? { ...item, status: "cancelled" } : item
        )
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
    return <p>Er staan nog geen afspraken in je dashboard.</p>;
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
            {booking.status === "cancelled" && "❌ "}
            {translateStatus(booking.status)}
          </p>

          {booking.status !== "cancelled" && (
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
          )}
        </div>
      ))}
    </div>
  );
}