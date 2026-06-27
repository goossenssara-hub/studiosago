"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Workshop = {
  id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  price: number | null;
  location_name: string | null;
  location_address: string | null;
  max_participants: number | null;
  description: string | null;
  active: boolean;
  workshop_registrations?: { id: string; paid: boolean; photos_allowed: boolean }[];
};

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState("");
  const [message, setMessage] = useState("");

  async function loadWorkshops() {
    const { data, error } = await supabase
      .from("workshops")
      .select(`
        *,
        workshop_registrations(id, paid, photos_allowed)
      `)
      .order("start_date", { ascending: true });

    if (error) {
      setMessage("Workshops konden niet geladen worden.");
      return;
    }

    setWorkshops((data ?? []) as Workshop[]);
  }

  useEffect(() => {
    loadWorkshops();
  }, []);

  async function addWorkshop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const { error } = await supabase.from("workshops").insert({
      title: String(form.get("title") || ""),
      subtitle: String(form.get("subtitle") || ""),
      category: String(form.get("category") || ""),
      start_date: String(form.get("start_date") || ""),
      end_date: String(form.get("end_date") || ""),
      start_time: String(form.get("start_time") || ""),
      end_time: String(form.get("end_time") || ""),
      price: Number(form.get("price") || 0),
      location_name: String(form.get("location_name") || ""),
      location_address: String(form.get("location_address") || ""),
      max_participants: Number(form.get("max_participants") || 10),
      description: String(form.get("description") || ""),
      active: true,
    });

    if (error) {
      setMessage("Workshop kon niet toegevoegd worden.");
      return;
    }

    setMessage("Workshop toegevoegd.");
    event.currentTarget.reset();
    loadWorkshops();
  }

  async function addRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const { error } = await supabase.from("workshop_registrations").insert({
      workshop_id: selectedWorkshop,
      parent_first_name: String(form.get("parent_first_name") || ""),
      parent_last_name: String(form.get("parent_last_name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      street: String(form.get("street") || ""),
      house_number: String(form.get("house_number") || ""),
      postal_code: String(form.get("postal_code") || ""),
      city: String(form.get("city") || ""),
      participant_first_name: String(form.get("participant_first_name") || ""),
      participant_last_name: String(form.get("participant_last_name") || ""),
      participant_birthdate: String(form.get("participant_birthdate") || ""),
      photos_allowed: form.get("photos_allowed") === "on",
      terms_accepted: form.get("terms_accepted") === "on",
      paid: form.get("paid") === "on",
      notes: String(form.get("notes") || ""),
    });

    if (error) {
      setMessage("Inschrijving kon niet toegevoegd worden.");
      return;
    }

    setMessage("Leerling ingeschreven.");
    event.currentTarget.reset();
    loadWorkshops();
  }

  async function toggleWorkshop(id: string, active: boolean) {
    await supabase.from("workshops").update({ active: !active }).eq("id", id);
    loadWorkshops();
  }

  return (
    <section className="table-card">
      <p className="eyebrow">Workshops</p>
      <h2>Workshops beheren</h2>

      <form className="admin-workshop-form" onSubmit={addWorkshop}>
        <input name="title" placeholder="Titel*" required />
        <input name="subtitle" placeholder="Subtitel" />
        <input name="category" placeholder="Categorie*" required />
        <input name="start_date" type="date" required />
        <input name="end_date" type="date" />
        <input name="start_time" type="time" />
        <input name="end_time" type="time" />
        <input name="price" type="number" placeholder="Prijs*" required />
        <input name="location_name" placeholder="Naam locatie" />
        <input name="location_address" placeholder="Adres locatie" />
        <input name="max_participants" type="number" placeholder="Max. deelnemers" required />
        <textarea name="description" rows={5} placeholder="Beschrijving / praktische info" />
        <button className="primary-action" type="submit">Workshop toevoegen</button>
      </form>

      {message && <p className="form-message">{message}</p>}

      <h2 style={{ marginTop: 48 }}>Overzicht</h2>

      <div className="admin-workshop-list">
        {workshops.map((workshop) => {
          const registrations = workshop.workshop_registrations ?? [];
          const count = registrations.length;
          const max = workshop.max_participants ?? 0;
          const remaining = Math.max(max - count, 0);
          const unpaid = registrations.filter((r) => !r.paid).length;
          const noPhotos = registrations.filter((r) => !r.photos_allowed).length;

          return (
            <article className={`admin-workshop-card ${!workshop.active ? "inactive" : ""}`} key={workshop.id}>
              <div>
                <h3>{workshop.title}</h3>
                <p>{workshop.subtitle}</p>
                <p>
                  {workshop.start_date} · {workshop.start_time?.slice(0, 5)} - {workshop.end_time?.slice(0, 5)}
                </p>
                <p>{workshop.location_name} · €{workshop.price}</p>
              </div>

              <div className="workshop-stats">
                <span>👥 {count}/{max} ingeschreven</span>
                <span>✅ {remaining} plaatsen vrij</span>
                {unpaid > 0 && <span className="warning">💶 {unpaid} niet betaald</span>}
                {noPhotos > 0 && <span className="warning">📷🚫 {noPhotos} geen foto’s</span>}
              </div>

              <button type="button" onClick={() => toggleWorkshop(workshop.id, workshop.active)}>
                {workshop.active ? "Offline zetten" : "Online zetten"}
              </button>
            </article>
          );
        })}
      </div>

      <h2 style={{ marginTop: 48 }}>Leerling inschrijven</h2>

      <form className="admin-workshop-form" onSubmit={addRegistration}>
        <select value={selectedWorkshop} onChange={(e) => setSelectedWorkshop(e.target.value)} required>
          <option value="">Kies workshop</option>
          {workshops.filter((w) => w.active).map((workshop) => (
            <option key={workshop.id} value={workshop.id}>
              {workshop.title}
            </option>
          ))}
        </select>

        <input name="parent_first_name" placeholder="Voornaam ouder*" required />
        <input name="parent_last_name" placeholder="Achternaam ouder*" required />
        <input name="email" type="email" placeholder="E-mail*" required />
        <input name="phone" placeholder="Telefoon*" required />
        <input name="street" placeholder="Straat*" required />
        <input name="house_number" placeholder="Huisnummer*" required />
        <input name="postal_code" placeholder="Postcode*" required />
        <input name="city" placeholder="Plaats*" required />
        <input name="participant_first_name" placeholder="Voornaam deelnemer*" required />
        <input name="participant_last_name" placeholder="Achternaam deelnemer*" required />
        <input name="participant_birthdate" type="date" required />

        <label className="checkbox-row">
          <input name="photos_allowed" type="checkbox" />
          Foto’s toegestaan
        </label>

        <label className="checkbox-row">
          <input name="terms_accepted" type="checkbox" required />
          Voorwaarden akkoord
        </label>

        <label className="checkbox-row">
          <input name="paid" type="checkbox" />
          Betaald
        </label>

        <textarea name="notes" rows={4} placeholder="Extra opmerkingen" />

        <button className="primary-action" type="submit">Leerling inschrijven</button>
      </form>
    </section>
  );
}