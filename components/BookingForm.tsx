"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fallbackServices, StudioService } from "@/lib/services";

type Availability = {
  id: string;
  service_id: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  max_places: number | null;
  booked_places: number | null;
};

export default function BookingForm() {
  const [services, setServices] = useState<StudioService[]>(fallbackServices);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

      const { data: availabilityData } = await supabase
        .from("availability")
        .select("id,service_id,date,start_time,end_time,max_places,booked_places,active")
        .eq("active", true)
        .order("date", { ascending: true });

      if (availabilityData) setAvailability(availabilityData);
    }

    loadData();
  }, []);

  function handleServiceChange(value: string) {
    setSelectedService(value);
    setSelectedSlot("");

    const selected = services.find((service) => (service.id ?? service.href) === value);

    if (selected?.href?.startsWith("http")) {
      window.open(selected.href, "_blank", "noopener,noreferrer");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("first_name") || "");
    const lastName = String(form.get("last_name") || "");
    const email = String(form.get("email") || "");
    const phone = String(form.get("phone") || "");
    const notes = String(form.get("notes") || "");
    const serviceId = String(form.get("service_id") || "");
    const availabilityId = String(form.get("availability_id") || "");

    const selected = services.find((service) => (service.id ?? service.href) === serviceId);

    if (selected?.href?.startsWith("http")) {
      setLoading(false);
      setMessage("Voor SaGo Photography word je doorgestuurd naar de aparte website.");
      window.open(selected.href, "_blank", "noopener,noreferrer");
      return;
    }

    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        notes,
        active: true,
      })
      .select("id")
      .single();

    if (contactError || !contact) {
      setLoading(false);
      setMessage("Je aanvraag kon niet worden opgeslagen. Controleer je Supabase RLS policies.");
      return;
    }

    const { error: bookingError } = await supabase.from("bookings").insert({
      contact_id: contact.id,
      service_id: serviceId || null,
      availability_id: availabilityId || null,
      status: "pending",
      payment_status: "unpaid",
      amount: selected?.price ?? null,
      notes,
    });

    setLoading(false);

    if (bookingError) {
      setMessage("Contact opgeslagen, maar de boeking lukte niet. Controleer de foreign keys en RLS policies.");
      return;
    }

    setMessage("Je aanvraag werd verzonden. Je ontvangt binnenkort bevestiging.");
    event.currentTarget.reset();
    setSelectedService("");
    setSelectedSlot("");
  }

  const filteredSlots = selectedService
    ? availability.filter((slot) => slot.service_id === selectedService)
    : availability;

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Aanbod
          <select
            name="service_id"
            value={selectedService}
            onChange={(event) => handleServiceChange(event.target.value)}
            required
          >
            <option value="">Kies een aanbod</option>
            {services.map((service) => {
              const value = service.id ?? service.href;

              return (
                <option key={value} value={value}>
                  {service.name} {service.category}
                </option>
              );
            })}
          </select>
        </label>

        <label>
          Beschikbaar moment
          <select
            name="availability_id"
            value={selectedSlot}
            onChange={(event) => setSelectedSlot(event.target.value)}
            disabled={
              !!services.find((service) => (service.id ?? service.href) === selectedService)?.href?.startsWith("http")
            }
          >
            <option value="">Nog geen moment gekozen</option>
            {filteredSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.date} · {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Voornaam
          <input name="first_name" required />
        </label>

        <label>
          Achternaam
          <input name="last_name" required />
        </label>

        <label>
          E-mail
          <input name="email" type="email" required />
        </label>

        <label>
          Telefoon
          <input name="phone" type="tel" />
        </label>
      </div>

      <label>
        Bericht
        <textarea name="notes" rows={5} placeholder="Vertel kort waar je hulp bij zoekt." />
      </label>

      <button className="primary-action" type="submit" disabled={loading}>
        {loading ? "Verzenden..." : "Aanvraag verzenden"}
      </button>

      {message && <p className="form-message">{message}</p>}
    </form>
  );
}