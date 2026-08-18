"use client";

import { useState } from "react";

const bookingPages = {
  kennismaking: {
    label: "Kennismakingsgesprek",
    url: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0zi4xJpq3FiHfa43s_pDQNSsWTTC2XB1q8-ebMke6HBW-W7wV2j1EyYpbTmY7tkdG4YExTmFbA",
  },

  begeleiding: {
    label: "huiswerk/studiebegeleiding",
    url: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0xYs93pgXTNQ64AMHTucW58L0dHnSGWXlSqcb5VupDfDXH1z6PNJkkGog_r0kcJ--csHso-STk",
  },
};

type BookingKey = keyof typeof bookingPages;

export default function BookingForm() {
  const [selectedBooking, setSelectedBooking] = useState<BookingKey | "">("");

  const booking = selectedBooking ? bookingPages[selectedBooking] : null;

  return (
    <form className="form-card booking-form-with-calendar">
      <div className="booking-fields">
        <div className="form-grid booking-choice-grid">
          <label>
            Kies je afspraak
            <select
              value={selectedBooking}
              onChange={(e) =>
                setSelectedBooking(e.target.value as BookingKey | "")
              }
              required
            >
              <option value="">Kies een afspraak</option>
              <option value="begeleiding">
                Huiswerkbegeleiding / Bijles / Studiecoaching
              </option>
              <option value="kennismaking">
                Kennismakingsgesprek
              </option>
            </select>
          </label>
        </div>

        {booking && (
          <section className="booking-calendar-panel">
            <p className="eyebrow">Online afspraak</p>

            <h2>Kies zelf een beschikbaar moment</h2>

            <p>
              Selecteer hieronder een vrij moment. Google beheert de
              beschikbaarheid zodat dubbele boekingen niet mogelijk zijn.
            </p>

            <iframe
              src={`${booking.url}?gv=true`}
              title={booking.label}
              loading="lazy"
              className="google-booking-frame"
              width="100%"
              height="700"
              style={{
                border: 0,
                borderRadius: "24px",
                overflow: "hidden",
              }}
            />

            <p className="calendar-fallback">
              Werkt de agenda niet?{" "}
              <a
                href={booking.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open de agenda in een nieuw tabblad.
              </a>
            </p>
          </section>
        )}
      </div>
    </form>
  );
}