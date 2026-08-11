"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AdminNewsletterLeads.module.css";

type Language = "nl" | "en";
type Lead = {
  email: string;
  productIds: string[];
  sources: string[];
  marketingConsent: boolean;
  firstAt: string;
  lastAt: string;
  interactionCount: number;
  language: Language;
};

type ApiData = {
  leads?: Lead[];
  totals?: { all: number; newsletter: number; withoutConsent: number };
  error?: string;
};

function formatDate(value: string, language: Language) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : "nl-BE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export default function AdminNewsletterLeads({ language = "nl" }: { language?: Language }) {
  const isEnglish = language === "en";
  const [data, setData] = useState<ApiData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [onlyConsent, setOnlyConsent] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/newsletter-leads?language=${language}`, { cache: "no-store", credentials: "include" });
      const json = await response.json() as ApiData;
      if (!response.ok) throw new Error(json.error || (isEnglish ? "Contacts could not be loaded." : "E-mailadressen konden niet geladen worden."));
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : (isEnglish ? "Contacts could not be loaded." : "E-mailadressen konden niet geladen worden."));
    } finally { setLoading(false); }
  }, [isEnglish, language]);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => (data.leads ?? []).filter((lead) => {
    if (onlyConsent && !lead.marketingConsent) return false;
    return lead.email.includes(query.trim().toLowerCase());
  }), [data.leads, onlyConsent, query]);

  function exportCsv() {
    const allowed = (data.leads ?? []).filter((lead) => lead.marketingConsent);
    const rows = isEnglish
      ? [["email", "newsletter consent", "first registration", "last activity", "source", "product"], ...allowed.map((lead) => [lead.email, "yes", lead.firstAt, lead.lastAt, lead.sources.join(" + "), lead.productIds.join(" + ")])]
      : [["e-mail", "toestemming nieuwsbrief", "eerste registratie", "laatste activiteit", "bron", "product"], ...allowed.map((lead) => [lead.email, "ja", lead.firstAt, lead.lastAt, lead.sources.join(" + "), lead.productIds.join(" + ")])];
    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `studio-sago-newsletter-${language}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click(); URL.revokeObjectURL(url);
  }

  return <section className={styles.wrapper}>
    <div className={styles.header}>
      <div>
        <p className={styles.eyebrow}>{isEnglish ? "English digital products" : "Digitale producten"}</p>
        <h2>{isEnglish ? "English newsletter & downloads" : "Nederlandse nieuwsbrief & downloads"}</h2>
        <p>{isEnglish ? "Only contacts generated through the English shop are shown here. Newsletter consent is kept separate from the Dutch list." : "Alleen contacten uit de Nederlandse omgeving worden hier getoond. Toestemming voor de Engelse nieuwsbrief staat volledig apart."}</p>
      </div>
      <div className={styles.actions}><button type="button" onClick={() => void load()}>{isEnglish ? "Refresh" : "Vernieuwen"}</button><button type="button" className={styles.primary} onClick={exportCsv}>{isEnglish ? "Export English newsletter list" : "Nederlandse nieuwsbrieflijst exporteren"}</button></div>
    </div>
    <div className={styles.metrics}>
      <article><span>{isEnglish ? "All contacts" : "Alle contacten"}</span><strong>{data.totals?.all ?? 0}</strong></article>
      <article><span>{isEnglish ? "Newsletter allowed" : "Nieuwsbrief toegestaan"}</span><strong>{data.totals?.newsletter ?? 0}</strong></article>
      <article><span>{isEnglish ? "Without consent" : "Zonder toestemming"}</span><strong>{data.totals?.withoutConsent ?? 0}</strong></article>
    </div>
    <div className={styles.filters}>
      <label>{isEnglish ? "Search" : "Zoeken"}<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isEnglish ? "Search by email address" : "Zoek op e-mailadres"} /></label>
      <label className={styles.check}><input type="checkbox" checked={onlyConsent} onChange={(e) => setOnlyConsent(e.target.checked)} /> {isEnglish ? "Only show newsletter subscribers" : "Alleen nieuwsbriefabonnees tonen"}</label>
    </div>
    {loading && <p>{isEnglish ? "Loading contacts…" : "Contacten laden…"}</p>}
    {error && <p className={styles.error}>{error}</p>}
    {!loading && !error && <div className={styles.tableWrap}><table><thead><tr><th>{isEnglish ? "Email address" : "E-mailadres"}</th><th>{isEnglish ? "Consent" : "Toestemming"}</th><th>{isEnglish ? "Source" : "Bron"}</th><th>{isEnglish ? "Last activity" : "Laatste activiteit"}</th><th>{isEnglish ? "Interactions" : "Interacties"}</th></tr></thead><tbody>{visible.map((lead) => <tr key={`${language}-${lead.email}`}><td>{lead.email}</td><td><span className={lead.marketingConsent ? styles.yes : styles.no}>{lead.marketingConsent ? (isEnglish ? "Yes" : "Ja") : (isEnglish ? "No" : "Nee")}</span></td><td>{lead.sources.includes("leerplatform") ? "Leerplatform" : lead.sources.includes("download") ? (isEnglish ? "Download" : "Download") : (isEnglish ? "Preview" : "Voorbeeld")}</td><td>{formatDate(lead.lastAt, language)}</td><td>{lead.interactionCount}</td></tr>)}</tbody></table>{visible.length === 0 && <p className={styles.empty}>{isEnglish ? "No contacts found." : "Geen contacten gevonden."}</p>}</div>}
    <p className={styles.note}>{isEnglish ? "Privacy: an email address required to access a resource is not automatically newsletter consent. Only contacts who explicitly opted in are included in the English CSV export." : "Privacy: een verplicht e-mailadres om een product te bekijken is niet automatisch toestemming voor commerciële e-mails. Alleen contacten met expliciete toestemming komen in de Nederlandse CSV-export."}</p>
  </section>;
}
