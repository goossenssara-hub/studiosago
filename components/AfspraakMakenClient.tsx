"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./AfspraakMakenClient.module.css";

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

const MONTH_NAMES = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

const WEEKDAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function formatSelectedDate(value: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fromDateKey(value));
}

function normalizeDateList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        return String(
          row.date ?? row.day ?? row.value ?? row.selectedDate ?? ""
        ).trim();
      }

      return "";
    })
    .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item));
}

async function readJson(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error("De server gaf geen geldig agenda-antwoord terug.");
  }

  return (await response.json()) as Record<string, unknown>;
}

export default function AfspraakMakenClient({ pass, email }: Props) {
  const router = useRouter();

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [radiusAccepted, setRadiusAccepted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [notes, setNotes] = useState("");

  const [monthLoading, setMonthLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const total = pass.total_sessions ?? pass.total_credits ?? 0;
  const remaining = pass.remaining_sessions ?? pass.remaining_credits ?? 0;

  const selectedAppointment = useMemo(
    () => appointmentTypes.find((type) => type.value === appointmentType),
    [appointmentType]
  );

  const duration = selectedAppointment?.duration ?? 60;

  const monthGrid = useMemo(
    () =>
      getMonthGrid(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth]
  );

  const loadSingleDateSlots = useCallback(
    async (date: string): Promise<string[]> => {
      const response = await fetch(
        `/api/google-availability?date=${encodeURIComponent(
          date
        )}&duration=${duration}&type=begeleiding`,
        { cache: "no-store" }
      );

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          String(
            data.error ||
              "Beschikbare momenten konden niet geladen worden."
          )
        );
      }

      return Array.isArray(data.slots)
        ? data.slots.map((slot) => String(slot).trim()).filter(Boolean)
        : [];
    },
    [duration]
  );

  const loadMonthAvailability = useCallback(async () => {
    if (!appointmentType) {
      setAvailableDates(new Set());
      return;
    }

    setMonthLoading(true);
    setError("");

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth() + 1;

    try {
      const monthResponse = await fetch(
        `/api/google-availability/month?year=${year}&month=${month}&duration=${duration}&type=begeleiding`,
        { cache: "no-store" }
      );

      if (monthResponse.ok) {
        const monthData = (await monthResponse.json()) as Record<
          string,
          unknown
        >;

        const normalized = normalizeDateList(
          monthData.availableDates ?? monthData.dates ?? monthData.days
        );

        if (normalized.length > 0) {
          setAvailableDates(new Set(normalized));
          return;
        }
      }

      const daysInMonth = new Date(year, month, 0).getDate();
      const today = startOfToday();

      const dateKeys = Array.from({ length: daysInMonth }, (_, index) => {
        const date = new Date(year, month - 1, index + 1);
        return date >= today ? toDateKey(date) : "";
      }).filter(Boolean);

      const results = await Promise.all(
        dateKeys.map(async (dateKey) => {
          try {
            const slots = await loadSingleDateSlots(dateKey);
            return slots.length > 0 ? dateKey : "";
          } catch {
            return "";
          }
        })
      );

      setAvailableDates(new Set(results.filter(Boolean)));
    } catch (loadError) {
      setAvailableDates(new Set());
      setError(
        loadError instanceof Error
          ? loadError.message
          : "De beschikbare datums konden niet geladen worden."
      );
    } finally {
      setMonthLoading(false);
    }
  }, [appointmentType, calendarMonth, duration, loadSingleDateSlots]);

  useEffect(() => {
    void loadMonthAvailability();
  }, [loadMonthAvailability]);

  useEffect(() => {
    async function loadSlots() {
      setAvailableSlots([]);
      setSelectedSlot("");
      setError("");

      if (!selectedDate || !appointmentType) return;

      setSlotsLoading(true);

      try {
        const slots = await loadSingleDateSlots(selectedDate);
        setAvailableSlots(slots);

        if (slots.length === 0) {
          setAvailableDates((current) => {
            const next = new Set(current);
            next.delete(selectedDate);
            return next;
          });
        }
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

    void loadSlots();
  }, [selectedDate, appointmentType, loadSingleDateSlots]);

  function changeMonth(offset: number) {
    setCalendarMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
    setSelectedDate("");
    setSelectedSlot("");
    setAvailableSlots([]);
  }

  function selectDate(dateKey: string) {
    if (!availableDates.has(dateKey)) return;
    setSelectedDate(dateKey);
    setSelectedSlot("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        "Kies een beschikbare datum, type afspraak en tijdstip."
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
      setError("Je moet akkoord gaan met de annuleringsvoorwaarden.");
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
          headers: { "Content-Type": "application/json" },
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

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          String(data.error || "Afspraak kon niet ingepland worden.")
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
              Kies een beschikbare datum en daarna het tijdstip
              dat jou het beste past.
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
                <p>
                  Niet-beschikbare datums zijn grijs en kunnen niet
                  aangeklikt worden.
                </p>
              </div>
            </div>

            <div className={styles.bookingLayout}>
              <div className={styles.detailsColumn}>
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
                  <span>Type afspraak *</span>
                  <select
                    value={appointmentType}
                    onChange={(event) => {
                      setAppointmentType(event.target.value);
                      setSelectedDate("");
                      setSelectedSlot("");
                      setAvailableSlots([]);
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
                    <small>{selectedAppointment.description}</small>
                  )}
                </label>

                {appointmentType === "home" && (
                  <>
                    <label className={styles.field}>
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
                  </>
                )}

                <div className={styles.calendarHelp}>
                  <strong>Zo werkt het</strong>
                  <span>
                    Kies eerst een type afspraak. Daarna worden alleen
                    de datums met vrije momenten actief.
                  </span>
                </div>
              </div>

              <div className={styles.calendarCard}>
                <div className={styles.calendarHeader}>
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    aria-label="Vorige maand"
                  >
                    ‹
                  </button>

                  <strong>
                    {MONTH_NAMES[calendarMonth.getMonth()]}{" "}
                    {calendarMonth.getFullYear()}
                  </strong>

                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    aria-label="Volgende maand"
                  >
                    ›
                  </button>
                </div>

                <div className={styles.weekdays}>
                  {WEEKDAY_LABELS.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div
                  className={`${styles.calendarGrid} ${
                    monthLoading ? styles.calendarLoading : ""
                  }`}
                >
                  {monthGrid.map((date) => {
                    const dateKey = toDateKey(date);
                    const isCurrentMonth =
                      date.getMonth() === calendarMonth.getMonth();
                    const isPast = date < startOfToday();
                    const isAvailable =
                      isCurrentMonth &&
                      !isPast &&
                      availableDates.has(dateKey);
                    const isSelected = selectedDate === dateKey;

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        className={[
                          styles.calendarDay,
                          !isCurrentMonth ? styles.outsideMonth : "",
                          isAvailable ? styles.availableDay : "",
                          isSelected ? styles.selectedDay : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={!isAvailable}
                        onClick={() => selectDate(dateKey)}
                        aria-pressed={isSelected}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

                {monthLoading && (
                  <p className={styles.calendarStatus}>
                    Beschikbare datums laden…
                  </p>
                )}

                {!monthLoading &&
                  appointmentType &&
                  availableDates.size === 0 && (
                    <p className={styles.calendarStatus}>
                      Geen vrije datums in deze maand.
                    </p>
                  )}
              </div>
            </div>
          </section>

          <section className={styles.formCard}>
            <div className={styles.sectionHeading}>
              <span>2</span>
              <div>
                <h2>Kies een beschikbaar moment</h2>
                <p>
                  {selectedDate
                    ? `Beschikbare uren op ${formatSelectedDate(
                        selectedDate
                      )}.`
                    : "Kies eerst een beschikbare datum in de kalender."}
                </p>
              </div>
            </div>

            {slotsLoading ? (
              <div className={styles.loadingSlots}>
                Beschikbare momenten laden…
              </div>
            ) : availableSlots.length > 0 ? (
              <div className={styles.slotGrid}>
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`${styles.slotButton} ${
                      selectedSlot === slot
                        ? styles.slotButtonSelected
                        : ""
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                    aria-pressed={selectedSlot === slot}
                  >
                    <strong>{slot}</strong>
                    <span>
                      {selectedSlot === slot
                        ? "Geselecteerd"
                        : "Beschikbaar"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.emptySlots}>
                {selectedDate
                  ? "Voor deze datum zijn geen vrije momenten meer."
                  : "Selecteer een beschikbare datum om de uren te zien."}
              </div>
            )}

            <div className={styles.bufferNote}>
              Elke begeleiding duurt 60 minuten. Tussen twee afspraken
              is er 30 minuten buffer.
            </div>
          </section>

          <section className={styles.formCard}>
            <div className={styles.sectionHeading}>
              <span>3</span>
              <div>
                <h2>Waarover gaat de begeleiding?</h2>
                <p>
                  Zo kan de sessie inhoudelijk goed voorbereid worden.
                </p>
              </div>
            </div>

            <label className={`${styles.field} ${styles.full}`}>
              <span>Onderwerp of hulpvraag *</span>
              <textarea
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
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
                Ik ga akkoord dat een beurt enkel wordt teruggezet
                wanneer ik minstens 72 uur op voorhand annuleer.
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
              disabled={saving || !selectedSlot}
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
