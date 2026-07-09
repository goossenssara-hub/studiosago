"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Pass = {
  id: string;
  title?: string | null;
  product?: string | null;
  customer_email: string;
  total_credits?: number | null;
  remaining_credits?: number | null;
  total_sessions?: number | null;
  remaining_sessions?: number | null;
  status: string;
};

type Props = {
  pass: Pass;
  email: string;
};

const appointmentTypes = [
  { value: "digital", label: "Digitaal", duration: 60 },
  { value: "home", label: "Fysiek aan huis", duration: 60 },
];

export default function AfspraakMakenClient({ pass, email }: Props) {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [radiusAccepted, setRadiusAccepted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [notes, setNotes] = useState("");

  const [slotsLoading, setSlotsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const total = pass.total_sessions ?? pass.total_credits ?? 0;
  const remaining = pass.remaining_sessions ?? pass.remaining_credits ?? 0;

  useEffect(() => {
    async function loadGoogleSlots() {
      setAvailableSlots([]);
      setSelectedSlot("");
      setError("");

      if (!selectedDate || !appointmentType) return;

      const chosenType = appointmentTypes.find(
        (type) => type.value === appointmentType
      );

      setSlotsLoading(true);

      try {
        const response = await fetch(
          `/api/google-availability?date=${encodeURIComponent(
            selectedDate
          )}&duration=${chosenType?.duration || 60}&type=begeleiding`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Beschikbare momenten konden niet geladen worden.");
          return;
        }

        setAvailableSlots(Array.isArray(data.slots) ? data.slots : []);
      } catch {
        setError("Beschikbare momenten konden niet geladen worden.");
      } finally {
        setSlotsLoading(false);
      }
    }

    loadGoogleSlots();
  }, [selectedDate, appointmentType]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    if (!selectedDate || !appointmentType || !selectedSlot) {
      setError("Kies eerst een datum, type afspraak en beschikbaar tijdstip.");
      setSaving(false);
      return;
    }

    if (!customerName.trim()) {
      setError("Vul je naam in.");
      setSaving(false);
      return;
    }

    if (!notes.trim()) {
      setError("Vul in waarover de bijles gaat.");
      setSaving(false);
      return;
    }

    if (!policyAccepted) {
      setError("Je moet akkoord gaan met de annuleringsvoorwaarden.");
      setSaving(false);
      return;
    }

    if (appointmentType === "home") {
      if (!customerAddress.trim()) {
        setError("Vul je adres in voor fysieke begeleiding.");
        setSaving(false);
        return;
      }

      if (!radiusAccepted) {
        setError("Bevestig dat het adres binnen 15 km rond Peer ligt.");
        setSaving(false);
        return;
      }
    }

    const response = await fetch("/api/appointments/pass-google-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passId: pass.id,
        email,
        customerName,
        date: selectedDate,
        time: selectedSlot,
        appointmentType,
        customerAddress,
        notes,
        cancellationPolicyAccepted: policyAccepted,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Afspraak kon niet ingepland worden.");
      setSaving(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="afspraak-maken-page">
      <section className="afspraak-booking-card">
        <div className="booking-header">
          <p className="eyebrow">Afspraak plannen</p>
          <h1>Boek je begeleiding</h1>
          <p>
            Je hebt nog <strong>{remaining}</strong> van de{" "}
            <strong>{total}</strong> beurten beschikbaar.
          </p>
        </div>

        {error && <p className="form-message error">{error}</p>}

        <form onSubmit={handleSubmit} className="booking-form-with-calendar">
          <div className="form-grid">
            <label>
              Naam leerling / ouder
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Naam"
                required
              />
            </label>

            <label>
              Datum
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                required
              />
            </label>

            <label>
              Type afspraak
              <select
                value={appointmentType}
                onChange={(event) => {
                  setAppointmentType(event.target.value);
                  setSelectedSlot("");
                  setCustomerAddress("");
                  setRadiusAccepted(false);
                }}
                required
              >
                <option value="">Kies type afspraak</option>
                {appointmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tijdstip
              <select
                value={selectedSlot}
                onChange={(event) => setSelectedSlot(event.target.value)}
                disabled={
                  !selectedDate ||
                  !appointmentType ||
                  slotsLoading ||
                  availableSlots.length === 0
                }
                required
              >
                <option value="">
                  {slotsLoading
                    ? "Beschikbare momenten laden..."
                    : !selectedDate
                    ? "Kies eerst een datum"
                    : !appointmentType
                    ? "Kies eerst type afspraak"
                    : availableSlots.length === 0
                    ? "Geen vrije momenten"
                    : "Kies tijdstip"}
                </option>

                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>

            {appointmentType === "home" && (
              <label className="full">
                Adres
                <input
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                  placeholder="Straat, nummer, postcode en gemeente"
                  required
                />
              </label>
            )}
          </div>

          {appointmentType === "home" && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={radiusAccepted}
                onChange={(event) => setRadiusAccepted(event.target.checked)}
                required
              />
              <span>Ik bevestig dat het adres binnen 15 km rond Peer ligt.</span>
            </label>
          )}

          <label className="full-label">
            Waarover gaat de bijles?
            <textarea
              rows={5}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Bijvoorbeeld: breuken, begrijpend lezen, toets Frans voorbereiden..."
              required
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={policyAccepted}
              onChange={(event) => setPolicyAccepted(event.target.checked)}
              required
            />
            <span>
              Ik ga akkoord dat een beurt enkel terug toegevoegd wordt wanneer ik
              minstens 72 uur op voorhand annuleer.
            </span>
          </label>

          <button className="primary-action" disabled={saving}>
            {saving ? "Afspraak opslaan..." : "Afspraak bevestigen"}
          </button>
        </form>
      </section>
    </main>
  );
}