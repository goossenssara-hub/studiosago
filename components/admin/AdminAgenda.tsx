"use client";

import {
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./AdminAgenda.module.css";

type CalendarView = "month" | "week" | "day";
type AppointmentType =
  | "kennismaking"
  | "huiswerk"
  | "studiebegeleiding"
  | "workshop"
  | "geannuleerd"
  | "prive"
  | "andere";

type Booking = {
  id: string;
  google_event_id?: string | null;
  google_event_url?: string | null;
  google_meet_url?: string | null;
  title: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone?: string | null;
  location: string | null;
  notes: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  start_time: string | null;
  end_time: string | null;
  service_type: string | null;
  status: string | null;
  payment_status: string | null;
};

type FilterState = Record<AppointmentType, boolean>;

const START_HOUR = 7;
const END_HOUR = 21;
const HOUR_HEIGHT = 76;

const DEFAULT_FILTERS: FilterState = {
  kennismaking: true,
  huiswerk: true,
  studiebegeleiding: true,
  workshop: true,
  geannuleerd: true,
  prive: true,
  andere: true,
};

const TYPE_LABELS: Record<AppointmentType, string> = {
  kennismaking: "Kennismaking",
  huiswerk: "Huiswerkbegeleiding / coaching",
  studiebegeleiding: "Studiebegeleiding",
  workshop: "Workshop / kamp",
  geannuleerd: "Geannuleerd",
  prive: "Geblokkeerd / privé",
  andere: "Andere afspraak",
};

function detectType(item: Booking): AppointmentType {
  if ((item.status || "").toLowerCase() === "cancelled") {
    return "geannuleerd";
  }

  const text = `
    ${item.title || ""}
    ${item.notes || ""}
    ${item.service_type || ""}
    ${item.location || ""}
  `.toLowerCase();

  if (
    text.includes("geblokkeerd") ||
    text.includes("privé") ||
    text.includes("private") ||
    text.includes("busy")
  ) {
    return "prive";
  }

  if (
    text.includes("kennismaking") ||
    text.includes("kennismakingsgesprek") ||
    text.includes("intake") ||
    text.includes("introductie")
  ) {
    return "kennismaking";
  }

  if (
    text.includes("workshop") ||
    text.includes("kamp") ||
    text.includes("autastisch") ||
    text.includes("klaar voor de sprong")
  ) {
    return "workshop";
  }

  if (
    text.includes("studiebegeleiding") ||
    text.includes("studie begeleiding")
  ) {
    return "studiebegeleiding";
  }

  if (
    text.includes("huiswerk") ||
    text.includes("studiecoaching") ||
    text.includes("coaching") ||
    text.includes("bijles") ||
    text.includes("begeleiding") ||
    text.includes("lager") ||
    text.includes("secundair")
  ) {
    return "huiswerk";
  }

  return "andere";
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfWeek(value: Date) {
  const date = startOfDay(value);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return date;
}

function endOfWeek(value: Date) {
  return addDays(startOfWeek(value), 6);
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function addDays(value: Date, amount: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function addMonths(value: Date, amount: number) {
  const date = new Date(value);
  date.setMonth(date.getMonth() + amount);
  return date;
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function bookingStart(item: Booking) {
  if (item.start_time) return new Date(item.start_time);

  if (item.appointment_date) {
    return new Date(
      `${item.appointment_date}T${item.appointment_time || "09:00"}:00`
    );
  }

  return null;
}

function bookingEnd(item: Booking) {
  if (item.end_time) return new Date(item.end_time);

  const start = bookingStart(item);
  if (!start) return null;

  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return end;
}

function dateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeKey(value: Date) {
  return `${String(value.getHours()).padStart(2, "0")}:${String(
    value.getMinutes()
  ).padStart(2, "0")}`;
}

function formatTime(value: Date | null) {
  if (!value) return "Niet opgegeven";

  return new Intl.DateTimeFormat("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatLongDate(value: Date | null) {
  if (!value) return "Niet opgegeven";

  return new Intl.DateTimeFormat("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatDayHeader(value: Date) {
  return new Intl.DateTimeFormat("nl-BE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(value);
}

function formatToolbarTitle(view: CalendarView, anchor: Date) {
  if (view === "month") {
    return new Intl.DateTimeFormat("nl-BE", {
      month: "long",
      year: "numeric",
    }).format(anchor);
  }

  if (view === "day") {
    return formatLongDate(anchor);
  }

  const start = startOfWeek(anchor);
  const end = endOfWeek(anchor);

  return `${new Intl.DateTimeFormat("nl-BE", {
    day: "numeric",
    month: "short",
  }).format(start)} – ${new Intl.DateTimeFormat("nl-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(end)}`;
}

function getMeetUrl(item: Booking) {
  if (item.google_meet_url) return item.google_meet_url;

  const match = (item.notes || "").match(
    /https:\/\/meet\.google\.com\/[a-z0-9-]+/i
  );

  return match?.[0] || null;
}

function getGoogleCalendarUrl(item: Booking) {
  if (item.google_event_url) return item.google_event_url;

  const match = (item.notes || "").match(
    /https:\/\/calendar\.google\.com\/[^\s]+/i
  );

  return match?.[0] || null;
}

function getPhone(item: Booking) {
  if (item.customer_phone) return item.customer_phone;

  const match = (item.notes || "").match(
    /(?:telefoon|gsm|phone)\s*:\s*([+\d][\d\s./-]{7,})/i
  );

  return match?.[1]?.trim() || null;
}

function getServiceName(item: Booking) {
  if (item.service_type && item.service_type !== "andere") {
    return item.service_type;
  }

  return item.title || "Afspraak Studio SaGo";
}

function monthGridDays(anchor: Date) {
  const first = startOfMonth(anchor);
  const gridStart = startOfWeek(first);

  return Array.from({ length: 42 }, (_, index) =>
    addDays(gridStart, index)
  );
}

function minutesFromDayStart(value: Date) {
  return (value.getHours() - START_HOUR) * 60 + value.getMinutes();
}

export default function AdminAgenda() {
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [message, setMessage] = useState("Laden...");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [view, setView] = useState<CalendarView>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selected, setSelected] = useState<Booking | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [savingNew, setSavingNew] = useState(false);

  const loadAgenda = useCallback(async () => {
    setMessage("Laden...");

    try {
      const response = await fetch("/api/admin/agenda", {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Agenda kon niet geladen worden.");
        return;
      }

      const loaded = (data.appointments ?? []) as Booking[];
      setAppointments(loaded);
      setMessage(loaded.length ? "" : "Geen afspraken gevonden.");
    } catch (error) {
      console.error(error);
      setMessage("Agenda kon niet geladen worden.");
    }
  }, []);

  useEffect(() => {
    void loadAgenda();
  }, [loadAgenda]);

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((item) => {
        const start = bookingStart(item);
        return start && filters[detectType(item)];
      }),
    [appointments, filters]
  );

  const visibleDays = useMemo(() => {
    if (view === "day") return [startOfDay(anchorDate)];

    if (view === "week") {
      const first = startOfWeek(anchorDate);
      return Array.from({ length: 7 }, (_, index) =>
        addDays(first, index)
      );
    }

    return monthGridDays(anchorDate);
  }, [anchorDate, view]);

  function navigate(direction: -1 | 1) {
    setAnchorDate((current) => {
      if (view === "month") return addMonths(current, direction);
      if (view === "week") return addDays(current, direction * 7);
      return addDays(current, direction);
    });
  }

  async function updateBookingStatus(
    bookingId: string,
    status: string
  ) {
    setLoadingId(bookingId);

    try {
      const response = await fetch("/api/admin/bookings/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Status kon niet aangepast worden.");
        return;
      }

      await loadAgenda();
      setSelected(null);
    } catch (error) {
      console.error(error);
      alert("Status kon niet aangepast worden.");
    } finally {
      setLoadingId(null);
    }
  }

  async function deductPass(bookingId: string) {
    setLoadingId(bookingId);

    try {
      const response = await fetch("/api/admin/bookings/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Beurt kon niet afgeschreven worden.");
        return;
      }

      await loadAgenda();
    } catch (error) {
      console.error(error);
      alert("Beurt kon niet afgeschreven worden.");
    } finally {
      setLoadingId(null);
    }
  }

  async function moveBooking(
    item: Booking,
    targetDate: Date,
    targetHour?: number
  ) {
    const currentStart = bookingStart(item);
    const currentEnd = bookingEnd(item);

    if (!currentStart || !currentEnd) return;

    const duration = currentEnd.getTime() - currentStart.getTime();
    const newStart = new Date(targetDate);

    if (typeof targetHour === "number") {
      newStart.setHours(targetHour, currentStart.getMinutes(), 0, 0);
    } else {
      newStart.setHours(
        currentStart.getHours(),
        currentStart.getMinutes(),
        0,
        0
      );
    }

    const newEnd = new Date(newStart.getTime() + duration);
    setLoadingId(item.id);

    try {
      const response = await fetch("/api/admin/agenda", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: item.id,
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
          appointmentDate: dateKey(newStart),
          appointmentTime: timeKey(newStart),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "De afspraak kon niet verplaatst worden.");
        return;
      }

      setAppointments((current) =>
        current.map((booking) =>
          booking.id === item.id
            ? {
                ...booking,
                start_time: newStart.toISOString(),
                end_time: newEnd.toISOString(),
                appointment_date: dateKey(newStart),
                appointment_time: timeKey(newStart),
              }
            : booking
        )
      );
    } catch (error) {
      console.error(error);
      alert("De afspraak kon niet verplaatst worden.");
    } finally {
      setLoadingId(null);
    }
  }


  async function createAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingNew(true);
    const form = new FormData(event.currentTarget);
    const multiDay = form.get("multiDay") === "on";
    const startDate = String(form.get("date") || "");
    const endDate = String(form.get("endDate") || startDate);
    const dates: string[] = [];
    let cursor = new Date(`${startDate}T12:00:00`);
    const last = new Date(`${multiDay ? endDate : startDate}T12:00:00`);
    while (cursor <= last) { dates.push(dateKey(cursor)); cursor = addDays(cursor, 1); }
    try {
      for (const date of dates) {
        const response = await fetch("/api/admin/agenda", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:form.get("title"),customerName:form.get("customerName"),customerEmail:form.get("customerEmail"),customerPhone:form.get("customerPhone"),serviceType:form.get("serviceType"),date,startTime:form.get("startTime"),endTime:form.get("endTime"),location:form.get("location"),notes:form.get("notes"),appointmentType:form.get("appointmentType")})});
        const data = await response.json(); if (!response.ok) throw new Error(data.error || "Afspraak kon niet opgeslagen worden.");
      }
      setShowCreate(false); await loadAgenda();
    } catch (error) { alert(error instanceof Error ? error.message : "Afspraak kon niet opgeslagen worden."); }
    finally { setSavingNew(false); }
  }

  async function deleteBooking(item: Booking) {
    if (!window.confirm("Wil je deze afspraak uit Studio SaGo én Google Agenda verwijderen?")) return;
    setLoadingId(item.id);
    try { const response=await fetch(`/api/admin/agenda?id=${item.id}`,{method:"DELETE"}); const data=await response.json(); if(!response.ok) throw new Error(data.error||"Verwijderen mislukt."); setSelected(null); await loadAgenda(); }
    catch(error){alert(error instanceof Error?error.message:"Verwijderen mislukt.");} finally{setLoadingId(null);}
  }

  function beginDrag(event: DragEvent, item: Booking) {
    event.dataTransfer.setData("text/plain", item.id);
    event.dataTransfer.effectAllowed = "move";
  }

  function bookingFromDrop(event: DragEvent) {
    const id = event.dataTransfer.getData("text/plain");
    return appointments.find((item) => item.id === id) || null;
  }

  function renderEventBlock(item: Booking) {
    const start = bookingStart(item);
    const end = bookingEnd(item);
    const type = detectType(item);

    if (!start || !end) return null;

    const top = (minutesFromDayStart(start) / 60) * HOUR_HEIGHT;
    const durationMinutes = Math.max(
      30,
      (end.getTime() - start.getTime()) / 60000
    );
    const height = Math.max(
      44,
      (durationMinutes / 60) * HOUR_HEIGHT - 4
    );

    return (
      <button
        key={item.id}
        type="button"
        draggable
        className={`${styles.eventBlock} ${styles[`type_${type}`]}`}
        style={{ top, height }}
        onDragStart={(event) => beginDrag(event, item)}
        onClick={() => setSelected(item)}
        aria-label={`${getServiceName(item)} om ${formatTime(start)}`}
      >
        <strong>
          {formatTime(start)} {getServiceName(item)}
        </strong>
        <span>{item.customer_name || item.title || "Afspraak"}</span>
        {item.location && <small>{item.location}</small>}
      </button>
    );
  }

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Agenda</p>
          <h2>Studio SaGo Agenda</h2>
          <p>
            Afspraken uit je bestaande bookings-tabel, gesynchroniseerd via
            je huidige Google Apps Script.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => void loadAgenda()}
        >
          Vernieuwen
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.navigation}>
          <button type="button" onClick={() => navigate(-1)}>
            ‹
          </button>
          <button
            type="button"
            onClick={() => setAnchorDate(new Date())}
          >
            Vandaag
          </button>
          <button type="button" onClick={() => navigate(1)}>
            ›
          </button>
        </div>

        <strong className={styles.toolbarTitle}>
          {formatToolbarTitle(view, anchorDate)}
        </strong>

        <div className={styles.viewSwitch}>
          <button
            type="button"
            className={view === "month" ? styles.activeView : ""}
            onClick={() => setView("month")}
          >
            Maand
          </button>
          <button
            type="button"
            className={view === "week" ? styles.activeView : ""}
            onClick={() => setView("week")}
          >
            Week
          </button>
          <button
            type="button"
            className={view === "day" ? styles.activeView : ""}
            onClick={() => setView("day")}
          >
            Dag
          </button>
        </div>

        <button type="button" className={styles.addButton} onClick={() => setShowCreate(true)}>+ Nieuwe afspraak</button>

        <button
          type="button"
          className={styles.filterButton}
          onClick={() => setShowFilters((current) => !current)}
        >
          Filters
        </button>
      </div>

      {showFilters && (
        <div className={styles.filters}>
          {(Object.keys(TYPE_LABELS) as AppointmentType[]).map(
            (type) => (
              <label key={type}>
                <input
                  type="checkbox"
                  checked={filters[type]}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      [type]: event.target.checked,
                    }))
                  }
                />
                <i
                  className={`${styles.filterDot} ${
                    styles[`type_${type}`]
                  }`}
                />
                {TYPE_LABELS[type]}
              </label>
            )
          )}
        </div>
      )}

      <div className={styles.legend}>
        {(Object.keys(TYPE_LABELS) as AppointmentType[]).map((type) => (
          <span key={type}>
            <i
              className={`${styles.legendDot} ${
                styles[`type_${type}`]
              }`}
            />
            {TYPE_LABELS[type]}
          </span>
        ))}
      </div>

      {message === "Laden..." && (
        <div className={styles.stateCard}>Agenda laden…</div>
      )}

      {message && message !== "Laden..." && appointments.length === 0 && (
        <div className={styles.stateCard}>{message}</div>
      )}

      {view === "month" && appointments.length > 0 && (
        <div className={styles.monthScroller}>
          <div className={styles.monthGrid}>
            {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
              <div key={day} className={styles.monthWeekday}>
                {day}
              </div>
            ))}

            {visibleDays.map((day) => {
              const dayAppointments = visibleAppointments
                .filter((item) => {
                  const start = bookingStart(item);
                  return start && sameDay(start, day);
                })
                .sort(
                  (left, right) =>
                    (bookingStart(left)?.getTime() || 0) -
                    (bookingStart(right)?.getTime() || 0)
                );

              const isCurrentMonth =
                day.getMonth() === anchorDate.getMonth();

              return (
                <div
                  key={day.toISOString()}
                  className={`${styles.monthDay} ${
                    !isCurrentMonth ? styles.outsideMonth : ""
                  } ${sameDay(day, new Date()) ? styles.today : ""}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const item = bookingFromDrop(event);
                    if (item) void moveBooking(item, day);
                  }}
                >
                  <button
                    type="button"
                    className={styles.dayNumber}
                    onClick={() => {
                      setAnchorDate(day);
                      setView("day");
                    }}
                  >
                    {day.getDate()}
                  </button>

                  <div className={styles.monthEvents}>
                    {dayAppointments.slice(0, 4).map((item) => {
                      const start = bookingStart(item);
                      const type = detectType(item);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          draggable
                          className={`${styles.monthEvent} ${
                            styles[`type_${type}`]
                          }`}
                          onDragStart={(event) => beginDrag(event, item)}
                          onClick={() => setSelected(item)}
                        >
                          <strong>{formatTime(start)}</strong>
                          <span>{getServiceName(item)}</span>
                        </button>
                      );
                    })}

                    {dayAppointments.length > 4 && (
                      <button
                        type="button"
                        className={styles.moreButton}
                        onClick={() => {
                          setAnchorDate(day);
                          setView("day");
                        }}
                      >
                        +{dayAppointments.length - 4} meer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(view === "week" || view === "day") &&
        appointments.length > 0 && (
          <div className={styles.calendarScroller}>
            <div
              className={styles.timeGrid}
              style={{
                gridTemplateColumns: `76px repeat(${visibleDays.length}, minmax(160px, 1fr))`,
              }}
            >
              <div className={styles.corner} />

              {visibleDays.map((day) => (
                <button
                  type="button"
                  key={day.toISOString()}
                  className={`${styles.dayHeader} ${
                    sameDay(day, new Date()) ? styles.todayHeader : ""
                  }`}
                  onClick={() => {
                    setAnchorDate(day);
                    setView("day");
                  }}
                >
                  {formatDayHeader(day)}
                </button>
              ))}

              <div
                className={styles.timeColumn}
                style={{
                  height: (END_HOUR - START_HOUR) * HOUR_HEIGHT,
                }}
              >
                {Array.from(
                  { length: END_HOUR - START_HOUR },
                  (_, index) => START_HOUR + index
                ).map((hour) => (
                  <span
                    key={hour}
                    style={{
                      top: (hour - START_HOUR) * HOUR_HEIGHT - 9,
                    }}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </span>
                ))}
              </div>

              {visibleDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={styles.dayColumn}
                  style={{
                    height: (END_HOUR - START_HOUR) * HOUR_HEIGHT,
                  }}
                >
                  {Array.from(
                    { length: END_HOUR - START_HOUR },
                    (_, index) => START_HOUR + index
                  ).map((hour) => (
                    <div
                      key={hour}
                      className={styles.hourDropZone}
                      style={{
                        top: (hour - START_HOUR) * HOUR_HEIGHT,
                        height: HOUR_HEIGHT,
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const item = bookingFromDrop(event);
                        if (item) void moveBooking(item, day, hour);
                      }}
                    />
                  ))}

                  {visibleAppointments
                    .filter((item) => {
                      const start = bookingStart(item);
                      return start && sameDay(start, day);
                    })
                    .map(renderEventBlock)}
                </div>
              ))}
            </div>
          </div>
        )}


      {showCreate && (
        <div className={styles.modalBackdrop} onMouseDown={() => setShowCreate(false)}>
          <form className={styles.modal} onSubmit={createAppointment} onMouseDown={(e)=>e.stopPropagation()}>
            <div className={styles.modalHeader}><div><p className={styles.eyebrow}>Nieuwe planning</p><h3>Nieuwe afspraak of workshop</h3></div><button type="button" className={styles.closeButton} onClick={()=>setShowCreate(false)}>×</button></div>
            <div className={styles.formGrid}>
              <label>Titel<input name="title" required defaultValue="Klaar voor de sprong naar het middelbaar" /></label>
              <label>Type<select name="serviceType" defaultValue="workshop"><option value="kennismaking">Kennismaking</option><option value="huiswerkbegeleiding">Huiswerkbegeleiding / coaching</option><option value="studiebegeleiding">Studiebegeleiding</option><option value="workshop">Workshop / kamp</option><option value="prive">Geblokkeerd / privé</option></select></label>
              <label>Klantnaam<input name="customerName" /></label><label>E-mailadres<input name="customerEmail" type="email" /></label><label>Telefoon<input name="customerPhone" /></label>
              <label>Afspraakvorm<select name="appointmentType"><option value="fysiek">Fysiek</option><option value="digitaal">Digitaal + Google Meet</option></select></label>
              <label>Startdatum<input name="date" type="date" required defaultValue="2026-07-14" /></label><label>Einddatum<input name="endDate" type="date" defaultValue="2026-07-17" /></label>
              <label>Beginuur<input name="startTime" type="time" required defaultValue="09:00" /></label><label>Einduur<input name="endTime" type="time" required defaultValue="16:00" /></label>
              <label className={styles.fullField}>Locatie<input name="location" defaultValue="Parochiecentrum Peer, lokaal 2 — Kloosterstraat 44, Peer" /></label>
              <label className={styles.fullField}>Opmerkingen<textarea name="notes" rows={4} /></label>
              <label className={styles.checkboxField}><input name="multiDay" type="checkbox" defaultChecked /> Elke dag tussen start- en einddatum toevoegen</label>
            </div><div className={styles.modalActions}><button type="button" className={styles.secondaryAction} onClick={()=>setShowCreate(false)}>Annuleren</button><button type="submit" disabled={savingNew}>{savingNew?"Opslaan…":"Opslaan in Studio SaGo en Google Agenda"}</button></div>
          </form>
        </div>
      )}

      {selected && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={() => setSelected(null)}
        >
          <article
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Afspraakdetails</p>
                <h3 id="booking-title">{getServiceName(selected)}</h3>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelected(null)}
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>

            <div className={styles.detailGrid}>
              <div>
                <span>Klantnaam</span>
                <strong>{selected.customer_name || "Niet opgegeven"}</strong>
              </div>
              <div>
                <span>E-mailadres</span>
                <strong>{selected.customer_email || "Niet opgegeven"}</strong>
              </div>
              <div>
                <span>Telefoonnummer</span>
                <strong>{getPhone(selected) || "Niet opgegeven"}</strong>
              </div>
              <div>
                <span>Dienst</span>
                <strong>{getServiceName(selected)}</strong>
              </div>
              <div>
                <span>Datum</span>
                <strong>{formatLongDate(bookingStart(selected))}</strong>
              </div>
              <div>
                <span>Begin- en einduur</span>
                <strong>
                  {formatTime(bookingStart(selected))} –{" "}
                  {formatTime(bookingEnd(selected))}
                </strong>
              </div>
              <div>
                <span>Locatie</span>
                <strong>{selected.location || "Niet opgegeven"}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{selected.status || "pending"}</strong>
              </div>
              <div>
                <span>Betaling</span>
                <strong>{selected.payment_status || "unpaid"}</strong>
              </div>
            </div>

            <div className={styles.notes}>
              <span>Opmerkingen</span>
              <p>{selected.notes || "Geen opmerkingen."}</p>
            </div>

            <div className={styles.modalActions}>
              {getMeetUrl(selected) && (
                <a
                  href={getMeetUrl(selected) || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.secondaryAction}
                >
                  Google Meet openen
                </a>
              )}

              {getGoogleCalendarUrl(selected) && (
                <a
                  href={getGoogleCalendarUrl(selected) || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.secondaryAction}
                >
                  Open in Google Agenda
                </a>
              )}

              <button
                type="button"
                disabled={loadingId === selected.id}
                onClick={() =>
                  void updateBookingStatus(selected.id, "confirmed")
                }
              >
                Goedkeuren
              </button>

              <button
                type="button"
                disabled={loadingId === selected.id}
                onClick={() =>
                  void updateBookingStatus(selected.id, "completed")
                }
              >
                Les afgerond
              </button>

              <button
                type="button"
                disabled={loadingId === selected.id}
                onClick={() => void deductPass(selected.id)}
              >Beurt afschrijven</button>
              <button type="button" className={styles.deleteButton} disabled={loadingId === selected.id} onClick={() => void deleteBooking(selected)}>Afspraak verwijderen</button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
