"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AdminLearningPlatform.module.css";

type Pioneer = {
  id: string;
  first_name: string;
  email: string;
  role: string | null;
  children_ages: string | null;
  updates_consent: boolean;
  privacy_consent: boolean;
  lifetime_access_eligible: boolean;
  source: string;
  invitation_sent_at: string | null;
  account_activated: boolean;
  account_activated_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ApiData = {
  pioneers?: Pioneer[];
  totals?: { all: number; lifetime: number; invited: number; activated: number; pending: number };
  error?: string;
};

type Filter = "all" | "waiting" | "invited" | "activated" | "lifetime";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("nl-BE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminLearningPlatform() {
  const [data, setData] = useState<ApiData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/learning-platform", { cache: "no-store", credentials: "include" });
      const json = (await response.json()) as ApiData;
      if (!response.ok) throw new Error(json.error || "Aanmeldingen konden niet geladen worden.");
      setData(json);
      setNoteDrafts(Object.fromEntries((json.pioneers ?? []).map((item) => [item.id, item.notes ?? ""])));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Aanmeldingen konden niet geladen worden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data.pioneers ?? []).filter((item) => {
      if (filter === "waiting" && (item.invitation_sent_at || item.account_activated)) return false;
      if (filter === "invited" && (!item.invitation_sent_at || item.account_activated)) return false;
      if (filter === "activated" && !item.account_activated) return false;
      if (filter === "lifetime" && !item.lifetime_access_eligible) return false;
      if (!needle) return true;
      return [item.first_name, item.email, item.role ?? "", item.children_ages ?? ""]
        .some((value) => value.toLowerCase().includes(needle));
    });
  }, [data.pioneers, filter, query]);

  async function update(item: Pioneer, payload: Record<string, unknown>) {
    setBusyId(item.id);
    setError("");
    try {
      const response = await fetch("/api/admin/learning-platform", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: item.id, ...payload }),
      });
      const json = await response.json() as { error?: string };
      if (!response.ok) throw new Error(json.error || "Aanpassing mislukt.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Aanpassing mislukt.");
    } finally {
      setBusyId("");
    }
  }

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const rows = visible.map((item) => ({
      Voornaam: item.first_name,
      "E-mailadres": item.email,
      Rol: item.role ?? "",
      "Leeftijden kinderen": item.children_ages ?? "",
      "Levenslang gratis": item.lifetime_access_eligible ? "Ja" : "Nee",
      "Uitnodiging verstuurd": item.invitation_sent_at ? formatDate(item.invitation_sent_at) : "Nee",
      "Account geactiveerd": item.account_activated ? "Ja" : "Nee",
      "Datum aanmelding": formatDate(item.created_at),
      Notities: item.notes ?? "",
    }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [{ wch: 18 }, { wch: 34 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 24 }, { wch: 20 }, { wch: 24 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leerplatform");
    XLSX.writeFile(workbook, `studio-sago-leerplatform-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function mailAll() {
    const emails = visible.map((item) => item.email).filter(Boolean);
    if (!emails.length) return;
    window.location.href = `mailto:?bcc=${encodeURIComponent(emails.join(","))}&subject=${encodeURIComponent("Update over het Studio SaGo-leerplatform")}`;
  }

  return <section className={styles.wrapper}>
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Studio SaGo Academy</p>
        <h2>Leerplatform</h2>
        <p>Beheer de pioniers die via de aanmeldpagina levenslang gratis toegang hebben gereserveerd.</p>
      </div>
      <div className={styles.headerActions}>
        <button type="button" onClick={() => void load()}>Vernieuwen</button>
        <button type="button" onClick={mailAll}>Mail selectie</button>
        <button type="button" className={styles.primary} onClick={() => void exportExcel()}>Export Excel</button>
      </div>
    </header>

    <div className={styles.metrics}>
      <button type="button" className={filter === "all" ? styles.activeMetric : ""} onClick={() => setFilter("all")}><span>Alle inschrijvingen</span><strong>{data.totals?.all ?? 0}</strong></button>
      <button type="button" className={filter === "lifetime" ? styles.activeMetric : ""} onClick={() => setFilter("lifetime")}><span>Levenslang gratis</span><strong>{data.totals?.lifetime ?? 0}</strong></button>
      <button type="button" className={filter === "invited" ? styles.activeMetric : ""} onClick={() => setFilter("invited")}><span>Uitgenodigd</span><strong>{data.totals?.invited ?? 0}</strong></button>
      <button type="button" className={filter === "activated" ? styles.activeMetric : ""} onClick={() => setFilter("activated")}><span>Geactiveerd</span><strong>{data.totals?.activated ?? 0}</strong></button>
    </div>

    <div className={styles.toolbar}>
      <label className={styles.search}>Zoeken<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Naam, e-mailadres, rol of leeftijd" /></label>
      <div className={styles.filters} aria-label="Statusfilter">
        <button type="button" className={filter === "waiting" ? styles.selected : ""} onClick={() => setFilter(filter === "waiting" ? "all" : "waiting")}>Nog niet uitgenodigd</button>
        <button type="button" className={filter === "invited" ? styles.selected : ""} onClick={() => setFilter(filter === "invited" ? "all" : "invited")}>Uitgenodigd</button>
        <button type="button" className={filter === "activated" ? styles.selected : ""} onClick={() => setFilter(filter === "activated" ? "all" : "activated")}>Geactiveerd</button>
      </div>
    </div>

    {loading && <div className={styles.state}>Aanmeldingen laden…</div>}
    {error && <div className={styles.error}>{error}</div>}
    {!loading && !error && visible.length === 0 && <div className={styles.state}>Geen inschrijvingen gevonden.</div>}

    {!loading && !error && visible.length > 0 && <>
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Contact</th><th>Profiel</th><th>Aangemeld</th><th>Status</th><th>Levenslang</th><th>Acties</th></tr></thead>
          <tbody>{visible.map((item) => <tr key={item.id}>
            <td><strong>{item.first_name}</strong><a href={`mailto:${item.email}`}>{item.email}</a></td>
            <td><span>{item.role || "Niet ingevuld"}</span><small>{item.children_ages ? `Kinderen: ${item.children_ages}` : "Geen leeftijden ingevuld"}</small></td>
            <td><time>{formatDate(item.created_at)}</time></td>
            <td><div className={styles.statuses}>{item.account_activated ? <span className={styles.activated}>Account actief</span> : item.invitation_sent_at ? <span className={styles.invited}>Uitgenodigd</span> : <span className={styles.waiting}>Wachtlijst</span>}</div></td>
            <td>{item.lifetime_access_eligible ? <span className={styles.lifetime}>✓ Gereserveerd</span> : "—"}</td>
            <td><div className={styles.rowActions}>
              <button type="button" disabled={busyId === item.id} onClick={() => void update(item, { action: "mark_invited" })}>{item.invitation_sent_at ? "Opnieuw markeren" : "Uitnodiging verstuurd"}</button>
              <button type="button" disabled={busyId === item.id} className={item.account_activated ? styles.deactivate : styles.activate} onClick={() => void update(item, { action: "toggle_activation", activated: !item.account_activated })}>{item.account_activated ? "Deactiveren" : "Account activeren"}</button>
              <button type="button" onClick={() => setExpandedId(expandedId === item.id ? "" : item.id)}>Notities</button>
            </div>{expandedId === item.id && <div className={styles.notes}><textarea value={noteDrafts[item.id] ?? ""} onChange={(event) => setNoteDrafts((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Interne notitie…" /><button type="button" disabled={busyId === item.id} onClick={() => void update(item, { action: "update_notes", notes: noteDrafts[item.id] ?? "" })}>Notitie bewaren</button></div>}</td>
          </tr>)}</tbody>
        </table>
      </div>

      <div className={styles.mobileList}>{visible.map((item) => <article key={item.id} className={styles.card}>
        <div className={styles.cardTop}><div><strong>{item.first_name}</strong><a href={`mailto:${item.email}`}>{item.email}</a></div>{item.lifetime_access_eligible && <span className={styles.lifetime}>✓ Levenslang</span>}</div>
        <dl><div><dt>Rol</dt><dd>{item.role || "Niet ingevuld"}</dd></div><div><dt>Kinderen</dt><dd>{item.children_ages || "Niet ingevuld"}</dd></div><div><dt>Aangemeld</dt><dd>{formatDate(item.created_at)}</dd></div><div><dt>Status</dt><dd>{item.account_activated ? "Account actief" : item.invitation_sent_at ? "Uitgenodigd" : "Wachtlijst"}</dd></div></dl>
        <div className={styles.cardActions}><button type="button" onClick={() => void update(item, { action: "mark_invited" })}>Uitnodiging verstuurd</button><button type="button" className={item.account_activated ? styles.deactivate : styles.activate} onClick={() => void update(item, { action: "toggle_activation", activated: !item.account_activated })}>{item.account_activated ? "Deactiveren" : "Account activeren"}</button></div>
        <button type="button" className={styles.noteToggle} onClick={() => setExpandedId(expandedId === item.id ? "" : item.id)}>Interne notitie {expandedId === item.id ? "sluiten" : "openen"}</button>
        {expandedId === item.id && <div className={styles.notes}><textarea value={noteDrafts[item.id] ?? ""} onChange={(event) => setNoteDrafts((current) => ({ ...current, [item.id]: event.target.value }))} /><button type="button" onClick={() => void update(item, { action: "update_notes", notes: noteDrafts[item.id] ?? "" })}>Bewaren</button></div>}
      </article>)}</div>
    </>}

    <p className={styles.footerNote}>De levenslange toegang wordt gekoppeld aan het e-mailadres waarmee de persoon zich via de leerplatformpagina aanmeldde.</p>
  </section>;
}
