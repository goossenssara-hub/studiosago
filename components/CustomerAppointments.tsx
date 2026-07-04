"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;
  title: string | null;
  start_time: string |null;
  end_time: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  appointment_type: string | null;
  customer_address: string | null;
  google_event_link: string | null;
  location: string | null;
  status: string | null;
};

export default function CustomerAppointments({
  email,
}: {
  email: string;
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          title,
          start_time,
          end_time,
          appointment_date,
          appointment_time,
          appointment_type,
          customer_address,
          google_event_link,
          location,
          status
        `)
        .eq("customer_email", email)
        .neq("status", "cancelled")
        .order("appointment_date", { ascending: true });

      if (error) {
        console.error(error);
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
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error ?? "Annuleren mislukt.");
        return;
      }

      setBookings((current) =>
        current.filter((item) => item.id !== booking.id)
      );

      alert("Je afspraak werd succesvol geannuleerd.");
    } catch (error) {
      console.error(error);
      alert("Er ging iets mis.");
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
    return (
      <p>Er staan momenteel geen actieve afspraken in je dashboard.</p>
    );
  }

  return (
    <div className="agenda-list">
      {bookings.map((booking) => (
        <div className="agenda-item" key={booking.id}>
          <strong>
            {booking.title || "Afspraak Studio SaGo"}
          </strong>

          <p>
            📅{" "}
            {booking.appointment_date
              ? new Date(
                  booking.appointment_date
                ).toLocaleDateString("nl-BE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : booking.start_time
              ? new Date(
                  booking.start_time
                ).toLocaleDateString("nl-BE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Datum onbekend"}
          </p>

          <p>
            🕒{" "}
            {booking.appointment_time
              ? booking.appointment_time
              : booking.start_time
              ? new Date(
                  booking.start_time
                ).toLocaleTimeString("nl-BE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Tijdstip onbekend"}
          </p>

          {booking.appointment_type === "home" &&
            booking.customer_address && (
              <p>🏠 {booking.customer_address}</p>
            )}

          {booking.appointment_type === "digital" && (
            <div style={{ marginTop: 10 }}>
              <p>💻 Digitale afspraak</p>

              {booking.google_event_link && (
                <a
                  href={booking.google_event_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-action"
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                  }}
                >
                  Google Meet openen
                </a>
              )}
            </div>
          )}

          <p className="appointment-status">
            {booking.status === "confirmed" && "✅ "}
            {booking.status === "pending" && "🕒 "}
            {translateStatus(booking.status)}
          </p>

          <button
            type="button"
            className="cancel-bookings"
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