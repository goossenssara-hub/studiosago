"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fallbackServices, StudioService } from "@/lib/services";

type BookingRow = {
  id: string;
  created_at: string;
  status: string | null;
  payment_status: string | null;
  notes: string | null;
  contacts?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  services?: {
    name: string | null;
    category: string | null;
  } | null;
  availability?: {
    date: string | null;
    start_time: string | null;
    end_time: string | null;
  } | null;
};

type AvailabilityRow = {
  id: string;
  service_id: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  max_places: number | null;
  booked_places: number | null;
  active: boolean | null;
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [services, setServices] = useState<StudioService[]>(fallbackServices);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [message, setMessage] = useState("Laden...");
  const [agendaMessage, setAgendaMessage] = useState("");

  async function loadData() {
    const { data: serviceData } = await supabase
      .from("services")
      .select("id,name,category,description,duration,price,max_participants,active")
      .eq("active", true)
      .order("created_at", { ascending: true });

    if (serviceData && serviceData.length > 0) {
      setServices(
        serviceData.map((item: any, index: number) => ({
          ...fallbackServices[index % fallbackServices.length],
          id: item.id,
          name: item.name,
          category: item.category,
          description: item.description,
          duration: item.duration,
          price: item.price,
          max_participants: item.max_participants,
          href: `/boek-nu?service=${item.id}`,
        }))
      );
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        "id,created_at,status,payment_status,notes,contacts(first_name,last_name,email),services(name,category),availability(date,start_time,end_time)"
      )
      .order("created_at", { ascending: false });

    if (bookingsError) {
      setMessage("Kon boekingen niet laden. Controleer RLS policies en relaties.");
    } else {
setBookings(((bookingsData ?? []) as unknown) as BookingRow[]);
      setMessage(bookingsData?.length ? "" : "Nog geen boekingen.");
    }

    const { data: availabilityData } = await supabase
      .from("availability")
      .select("id,service_id,date,start_time,end_time,max_places,booked_places,active")
      .order("date", { ascending: true });

    setAvailability((availabilityData as AvailabilityRow[]) ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddMoment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAgendaMessage("");

    const form = new FormData(event.currentTarget);

    const { error } = await supabase.from("availability").insert({
      service_id: String(form.get("service_id") || ""),
      date: String(form.get("date") || ""),
      start_time: String(form.get("start_time") || ""),
      end_time: String(form.get("end_time") || ""),
      max_places: Number(form.get("max_places") || 1),
      booked_places: 0,
      active: true,
    });

    if (error) {
      setAgendaMessage("Moment kon niet worden toegevoegd. Controleer Supabase/RLS.");
      return;
    }

    setAgendaMessage("Moment toegevoegd.");
    event.currentTarget.reset();
    loadData();
  }

  async function toggleMoment(slot: AvailabilityRow) {
    await supabase
      .from("availability")
      .update({ active: !slot.active })
      .eq("id", slot.id);

    loadData();
  }

  async function deleteMoment(id: string) {
    await supabase.from("availability").delete().eq("id", id);
    loadData();
  }

  return (
    <>
      <section className="form-card">
        <h2>Agenda beheren</h2>
        <p>
          Voeg beschikbare momenten toe. Deze verschijnen automatisch in het
          contactformulier.
        </p>

        <form onSubmit={handleAddMoment}>
          <div className="form-grid">
            <label>
              Aanbod
              <select name="service_id" required>
                <option value="">Kies een aanbod</option>
                {services.map((service) => (
                  <option key={service.id ?? service.name} value={service.id ?? ""}>
                    {service.name} {service.category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Datum
              <input name="date" type="date" required />
            </label>

            <label>
              Startuur
              <input name="start_time" type="time" required />
            </label>

            <label>
              Einduur
              <input name="end_time" type="time" required />
            </label>

            <label>
              Aantal plaatsen
              <input
                name="max_places"
                type="number"
                min="1"
                defaultValue="1"
                required
              />
            </label>
          </div>

          <button className="primary-action" type="submit">
            Moment toevoegen
          </button>

          {agendaMessage && <p className="form-message">{agendaMessage}</p>}
        </form>

        <div className="agenda-list">
          {availability.map((slot) => {
            const service = services.find((item) => item.id === slot.service_id);

            return (
              <div className="agenda-item" key={slot.id}>
                <div>
                  <strong>
                    {service
                      ? `${service.name} ${service.category}`
                      : "Algemeen moment"}
                  </strong>
                  <p>
                    {slot.date} · {slot.start_time?.slice(0, 5)} -{" "}
                    {slot.end_time?.slice(0, 5)}
                  </p>
                  <small>
                    {slot.booked_places ?? 0}/{slot.max_places ?? 0} plaatsen geboekt
                    {" · "}
                    {slot.active ? "zichtbaar" : "verborgen"}
                  </small>
                </div>

                <div className="agenda-actions">
                  <button type="button" onClick={() => toggleMoment(slot)}>
                    {slot.active ? "Verbergen" : "Tonen"}
                  </button>

                  <button type="button" onClick={() => deleteMoment(slot.id)}>
                    Verwijderen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="table-card">
        <h2>Boekingen</h2>

        {message && <p>{message}</p>}

        {bookings.length > 0 && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Klant</th>
                  <th>Aanbod</th>
                  <th>Moment</th>
                  <th>Status</th>
                  <th>Betaling</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      {booking.contacts?.first_name} {booking.contacts?.last_name}
                      <br />
                      <small>{booking.contacts?.email}</small>
                    </td>

                    <td>
                      {booking.services?.name}
                      <br />
                      <small>{booking.services?.category}</small>
                    </td>

                    <td>
                      {booking.availability?.date ?? "Nog niet gekozen"}
                      <br />
                      <small>
                        {booking.availability?.start_time?.slice(0, 5)}{" "}
                        {booking.availability?.end_time?.slice(0, 5)}
                      </small>
                    </td>

                    <td>{booking.status}</td>
                    <td>{booking.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}