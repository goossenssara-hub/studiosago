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
  { value: "home", label: "Fysiek bij mij thuis", duration: 60 },
];

function AfspraakMakenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passId = searchParams.get("passId");

  const [pass, setPass] = useState<Pass | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    async function loadPass() {
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

    if (passId) loadPass();
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
          `/api/google-availability?date=${encodeURIComponent(
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
        console.error("Availability error:", error);
        setError("Beschikbare momenten konden niet geladen worden.");
      } finally {
        setSlotsLoading(false);
      }
    }

    loadAvailableSlots();
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

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/appointments/pass-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passId,
        email,
        date: selectedDate,
        time: selectedSlot,
        appointmentType,
        customerAddress: formData.get("customerAddress"),
        notes: formData.get("notes"),
        cancellationPolicyAccepted:
          formData.get("cancellationPolicyAccepted") === "on",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Afspraak kon niet ingepland worden.");
      setSaving(false);
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
                    onChange={(event) => setAppointmentType(event.target.value)}
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

                <label>
                  Adres klant
                  <input
                    name="customerAddress"
                    placeholder="Straat, nummer, postcode en gemeente"
                  />
                </label>
              </div>

              <label style={{ display: "block", marginTop: 20 }}>
                Opmerking
                <textarea
                  name="notes"
                  rows={5}
                  placeholder="Waarmee mag ik rekening houden?"
                />
              </label>

              <label
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  marginTop: 24,
                  lineHeight: 1.5,
                }}
              >
                <input
                  name="cancellationPolicyAccepted"
                  type="checkbox"
                  required
                  style={{ marginTop: 6 }}
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