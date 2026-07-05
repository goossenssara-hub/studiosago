"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import { supabase } from "@/lib/supabase";

type Pass = {
  id: string;
  customer_email: string;
  title: string;
  total_credits: number;
  remaining_credits: number;
  status: string;
};

const appointmentTypes = [
  { value: "digital", label: "Digitaal", duration: 60 },
  { value: "home", label: "Fysiek aan huis", duration: 60 },
];

function AfspraakMakenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passId = searchParams.get("passId");

  const [pass, setPass] = useState<Pass | null>(null);
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [customerAddress, setCustomerAddress] = useState("");
  const [radiusAccepted, setRadiusAccepted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadPass() {
      if (!passId) {
        setError("Geen beurtenkaart gevonden.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        router.replace("/login");
        return;
      }

      setEmail(user.email);

      const { data, error } = await supabase
        .from("passes")
        .select("*")
        .eq("id", passId)
        .eq("customer_email", user.email)
        .eq("status", "active")
        .single();

      if (error || !data) {
        setError("Geen geldige beurtenkaart gevonden.");
      } else {
        setPass(data);
      }

      setLoading(false);
    }

    loadPass();
  }, [passId, router]);

  useEffect(() => {
    async function loadAvailableSlots() {
      setAvailableSlots([]);
      setSelectedSlot("");
      setError("");

      if (!selectedDate || !appointmentType) return;

      const selectedType = appointmentTypes.find(
        (type) => type.value === appointmentType
      );

      if (!selectedType) return;

      setSlotsLoading(true);

      try {
        const response = await fetch(
          `/api/availability?date=${encodeURIComponent(
            selectedDate
          )}&duration=${selectedType.duration}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Beschikbare momenten konden niet geladen worden.");
          return;
        }

        setAvailableSlots(Array.isArray(data.slots) ? data.slots : []);
      } catch (error) {
        console.error(error);
        setError("Beschikbare momenten konden niet geladen worden.");
      } finally {
        setSlotsLoading(false);
      }
    }

    loadAvailableSlots();
  }, [selectedDate, appointmentType]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pass) return;

    setSaving(true);
    setError("");

    if (!selectedDate || !appointmentType || !selectedSlot) {
      setError("Kies eerst een datum, type afspraak en beschikbaar tijdstip.");
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

    const response = await fetch("/api/appointments/pass-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passId: pass.id,
        email,
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
      setSaving(false);
      setError(data.error || "Afspraak kon niet ingepland worden.");
      return;
    }

    router.replace("/klantendashboard");
  }

  if (loading) {
    return (
      <PageShell>
        <section className="subpage-hero">
          <h1>Afspraak laden...</h1>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="info-grid single">
        <div className="info-card">
          {pass && (
            <>
              <h2>🎟️ {pass.title}</h2>
              <p>
                Nog <strong>{pass.remaining_credits}</strong> van de{" "}
                <strong>{pass.total_credits}</strong> beurten beschikbaar.
              </p>
            </>
          )}

          {error && (
            <p className="form-message" style={{ color: "#fe2020" }}>
              {error}
            </p>
          )}

          {pass && (
            <form onSubmit={handleSubmit} className="booking-form-with-calendar">
              <div className="form-grid">
                <label>
                  Datum
                  <input
                    name="date"
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />
                </label>

                <label>
                  Type afspraak
                  <select
                    name="appointmentType"
                    required
                    value={appointmentType}
                    onChange={(event) => {
                      setAppointmentType(event.target.value);
                      setSelectedSlot("");
                      setCustomerAddress("");
                      setRadiusAccepted(false);
                    }}
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
                    name="time"
                    required
                    value={selectedSlot}
                    onChange={(event) => setSelectedSlot(event.target.value)}
                    disabled={
                      !selectedDate ||
                      !appointmentType ||
                      slotsLoading ||
                      availableSlots.length === 0
                    }
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
                  <label>
                    Adres klant
                    <input
                      name="customerAddress"
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
                  <span>
                    Ik bevestig dat het adres binnen een straal van 15 km rond
                    Peer ligt. Fysieke begeleiding is enkel binnen deze straal
                    mogelijk.
                  </span>
                </label>
              )}

              <label style={{ display: "block", marginTop: 20 }}>
                Waarover gaat de bijles?
                <textarea
                  name="notes"
                  rows={5}
                  required
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Bijvoorbeeld: breuken, begrijpend lezen, toets Frans voorbereiden, planning maken..."
                />
              </label>

              <label className="checkbox-row">
                <input
                  name="cancellationPolicyAccepted"
                  type="checkbox"
                  checked={policyAccepted}
                  onChange={(event) => setPolicyAccepted(event.target.checked)}
                  required
                />
                <span>
                  Ik ga akkoord dat een beurt enkel terug toegevoegd wordt
                  wanneer ik minstens 72 uur op voorhand annuleer. Bij
                  laattijdige annulatie blijft de beurt aangerekend.
                </span>
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 24,
                }}
              >
                <button className="primary-action" disabled={saving}>
                  {saving ? "Afspraak opslaan..." : "Afspraak bevestigen"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}

export default function AfspraakMakenPage() {
  return (
    <Suspense fallback={null}>
      <AfspraakMakenContent />
    </Suspense>
  );
}