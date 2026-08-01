"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AdminNewsletterLeads.module.css";

type Lead = {
  email: string;
  productIds: string[];
  sources: string[];
  marketingConsent: boolean;
  firstAt: string;
  lastAt: string;
  interactionCount: number;
};

type ApiData = {
  leads?: Lead[];
  totals?: { all: number; newsletter: number; withoutConsent: number };
  error?: string;
};

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("nl-BE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function AdminNewsletterLeads() {
  const [data, setData] = useState<ApiData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [onlyConsent, setOnlyConsent] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/newsletter-leads", { cache: "no-store", credentials: "include" });
      const json = await response.json() as ApiData;
      if (!response.ok) throw new Error(json.error || "E-mailadressen konden niet geladen worden.");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "E-mailadressen konden niet geladen worden.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => (data.leads ?? []).filter((lead) => {
    if (onlyConsent && !lead.marketingConsent) return false;
    return lead.email.includes(query.trim().toLowerCase());
  }), [data.leads, onlyConsent, query]);

  function exportCsv() {
    const allowed = (data.leads ?? []).filter((lead) => lead.marketingConsent);
    const rows = [
      ["e-mail", "toestemming nieuwsbrief", "eerste registratie", "laatste activiteit", "bron", "product"],
      ...allowed.map((lead) => [lead.email, "ja", lead.firstAt, lead.lastAt, lead.sources.join(" + "), lead.productIds.join(" + ")]),
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `studio-sago-nieuwsbrief-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click(); URL.revokeObjectURL(url);
  }

  return <section className={styles.wrapper}>
    <div className={styles.header}>
      <div><p className={styles.eyebrow}>Digitale producten</p><h2>Nieuwsbrief & downloads</h2><p>Alle e-mailadressen worden bewaard. Alleen adressen met expliciete toestemming mogen in de nieuwsbriefexport.</p></div>
      <div className={styles.actions}><button type="button" onClick={() => void load()}>Vernieuwen</button><button type="button" className={styles.primary} onClick={exportCsv}>Nieuwsbrieflijst exporteren</button></div>
    </div>
    <div className={styles.metrics}>
      <article><span>Alle contacten</span><strong>{data.totals?.all ?? 0}</strong></article>
      <article><span>Nieuwsbrief toegestaan</span><strong>{data.totals?.newsletter ?? 0}</strong></article>
      <article><span>Zonder toestemming</span><strong>{data.totals?.withoutConsent ?? 0}</strong></article>
    </div>
    <div className={styles.filters}>
      <label>Zoeken<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek op e-mailadres" /></label>
      <label className={styles.check}><input type="checkbox" checked={onlyConsent} onChange={(e) => setOnlyConsent(e.target.checked)} /> Alleen nieuwsbriefabonnees tonen</label>
    </div>
    {loading && <p>Contacten laden…</p>}
    {error && <p className={styles.error}>{error}</p>}
    {!loading && !error && <div className={styles.tableWrap}><table><thead><tr><th>E-mailadres</th><th>Toestemming</th><th>Bron</th><th>Laatste activiteit</th><th>Interacties</th></tr></thead><tbody>{visible.map((lead) => <tr key={lead.email}><td>{lead.email}</td><td><span className={lead.marketingConsent ? styles.yes : styles.no}>{lead.marketingConsent ? "Ja" : "Nee"}</span></td><td>{lead.sources.includes("download") ? "Download" : "Voorbeeld"}</td><td>{formatDate(lead.lastAt)}</td><td>{lead.interactionCount}</td></tr>)}</tbody></table>{visible.length === 0 && <p className={styles.empty}>Geen contacten gevonden.</p>}</div>}
    <p className={styles.note}>Privacy: een verplicht e-mailadres om het voorbeeld te bekijken is niet automatisch toestemming voor commerciële e-mails. Daarom exporteert de knop uitsluitend contacten die de nieuwsbriefkeuze aanvinkten.</p>
  </section>;
}
