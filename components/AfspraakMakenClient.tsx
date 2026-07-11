"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./afspraken.css";

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
  {
    value: "digital",
    label: "Digitaal",
    description: "Online begeleiding via Google Meet.",
    duration: 60,
  },
  {
    value: "home",
    label: "Fysiek aan huis",
    description: "Begeleiding op jouw adres binnen 15 km rond Peer.",
    duration: 60,
  },
] as const;

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

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

  const selectedAppointment = useMemo(
    () =>
      appointmentTypes.find(
        (type) => type.value === appointmentType
      ),
    [appointmentType]
  );

  useEffect(() => {
    async function loadSlots() {
      setAvailableSlots([]);
      setSelectedSlot("");
      setError("");

      if (!selectedDate || !appointmentType) return;

      setSlotsLoading(true);

      try {
        const response = await fetch(
          `/api/google-availability?date=${encodeURIComponent(
            selectedDate
          )}&duration=${selectedAppointment?.duration ?? 60}&type=begeleiding`,
          { cache: "no-store" }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "De beschikbaarheidsservice gaf een ongeldig antwoord."
          );
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Beschikbare momenten konden niet geladen worden."
          );
        }

        setAvailableSlots(
          Array.isArray(data.slots) ? data.slots : []
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Beschikbare momenten konden niet geladen worden."
        );
      } finally {
        setSlotsLoading(false);
      }
    }

    loadSlots();
  }, [selectedDate, appointmentType, selectedAppointment]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    if (!customerName.trim()) {
      setError("Vul de naam van de leerling of ouder in.");
      setSaving(false);
      return;
    }

    if (!selectedDate || !appointmentType || !selectedSlot) {
      setError(
        "Kies een datum, type afspraak en beschikbaar tijdstip."
      );
      setSaving(false);
      return;
    }

    if (!notes.trim()) {
      setError("Vul in waarover de begeleiding gaat.");
      setSaving(false);
      return;
    }

    if (!policyAccepted) {
      setError(
        "Je moet akkoord gaan met de annuleringsvoorwaarden."
      );
      setSaving(false);
      return;
    }

    if (appointmentType === "home") {
      if (!customerAddress.trim()) {
        setError(
          "Vul je volledige adres in voor begeleiding aan huis."
        );
        setSaving(false);
        return;
      }

      if (!radiusAccepted) {
        setError(
          "Bevestig dat het adres binnen 15 km rond Peer ligt."
        );
        setSaving(false);
        return;
      }
    }

    try {
      const response = await fetch(
        "/api/appointments/pass-google-booking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            passId: pass.id,
            email,
            customerName: customerName.trim(),
            date: selectedDate,
            time: selectedSlot,
            appointmentType,
            customerAddress:
              appointmentType === "home"
                ? customerAddress.trim()
                : "",
            notes: notes.trim(),
            cancellationPolicyAccepted: policyAccepted,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "De server gaf een ongeldig antwoord terug."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Afspraak kon niet ingepland worden."
        );
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Afspraak kon niet ingepland worden."
      );
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Afspraak plannen</p>
            <h1>Boek je begeleiding</h1>
            <p className={styles.intro}>
              Kies rustig je moment. Je afspraak wordt pas
              definitief nadat je bevestigt.
            </p>
          </div>

          <div className={styles.passCard}>
            <span>Beschikbare beurten</span>
            <strong>{remaining}</strong>
            <small>van {total} beurten</small>
          </div>
        </header>

        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.formCard}>
            <div className={styles.sectionHeading}>
              <span>1</span>
              <div>
                <h2>Wie en wanneer?</h2>
                <p>Vul de gegevens in en kies een vrij moment.</p>
              </div>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Naam leerling of ouder *</span>
                <input
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  placeholder="Volledige naam"
                  autoComplete="name"
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Datum *</span>
                <input
                  type="date"
                  min={getToday()}
                  value={selectedDate}
                  onChange={(event) =>
                    setSelectedDate(event.target.value)
                  }
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Type afspraak *</span>
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

                {selectedAppointment && (
                  <small>
                    {selectedAppointment.description}
                  </small>
                )}
              </label>

              <label className={styles.field}>
                <span>Tijdstip *</span>
                <select
                  value={selectedSlot}
                  onChange={(event) =>
                    setSelectedSlot(event.target.value)
                  }
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
                      : "Kies een tijdstip"}
                  </option>

                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>

              {appointmentType === "home" && (
                <label className={`${styles.field} ${styles.full}`}>
                  <span>Adres voor begeleiding aan huis *</span>
                  <input
                    value={customerAddress}
                    onChange={(event) =>
                      setCustomerAddress(event.target.value)
                    }
                    placeholder="Straat, nummer, postcode en gemeente"
                    autoComplete="street-address"
                    required
                  />
                </label>
              )}
            </div>

            {appointmentType === "home" && (
              <label className={styles.checkboxCard}>
                <input
                  type="checkbox"
                  checked={radiusAccepted}
                  onChange={(event) =>
                    setRadiusAccepted(event.target.checked)
                  }
                  required
                />
                <span>
                  Ik bevestig dat dit adres binnen 15 km rond
                  Peer ligt.
                </span>
              </label>
            )}
          </section>

          <section className={styles.formCard}>
            <div className={styles.sectionHeading}>
              <span>2</span>
              <div>
                <h2>Waarover gaat de begeleiding?</h2>
                <p>
                  Zo kan de sessie inhoudelijk goed voorbereid
                  worden.
                </p>
              </div>
            </div>

            <label className={`${styles.field} ${styles.full}`}>
              <span>Onderwerp of hulpvraag *</span>
              <textarea
                rows={5}
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Bijvoorbeeld: breuken, begrijpend lezen, toets Frans voorbereiden..."
                required
              />
            </label>
          </section>

          <section className={styles.policyCard}>
            <div className={styles.policyIcon}>72u</div>

            <label className={styles.policyText}>
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(event) =>
                  setPolicyAccepted(event.target.checked)
                }
                required
              />

              <span>
                Ik ga akkoord dat een beurt enkel wordt
                teruggezet wanneer ik minstens 72 uur op
                voorhand annuleer.
              </span>
            </label>
          </section>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => router.back()}
              disabled={saving}
            >
              Terug
            </button>

            <button
              className={styles.primaryButton}
              disabled={saving}
            >
              {saving
                ? "Afspraak opslaan..."
                : "Afspraak bevestigen"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
