"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type DiscountType = "fixed" | "percentage";
type StatusKey = "all" | "active" | "used" | "expired" | "inactive";
type SortMode = "newest" | "oldest" | "expiry" | "usage";
type ViewMode = "overview" | "create";

type DiscountCode = {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  product: string;
  email: string | null;
  customer_name: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  created_at?: string | null;
};

type ApiData = {
  codes?: DiscountCode[];
  code?: DiscountCode;
  success?: boolean;
  error?: string;
};

async function readJson(response: Response): Promise<ApiData> {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as ApiData;
  } catch {
    return {};
  }
}

function formatDate(date: string | null) {
  if (!date) return "Geen einddatum";
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function getDefaultValidUntil() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getProductLabel(product: string) {
  const labels: Record<string, string> = {
    all: "Alle producten",
    "10-beurtenkaart-lager": "10-beurtenkaart lager",
    "10-beurtenkaart-secundair": "10-beurtenkaart secundair",
    "klaar-voor-de-sprong-middelbaar": "Klaar voor de Sprong middelbaar",
    "klaar-voor-de-sprong-eerste-leerjaar": "Klaar voor de Sprong eerste leerjaar",
    tekstcorrectie: "Tekstcorrectie",
  };
  return labels[product] || product;
}

function getDiscountLabel(item: DiscountCode) {
  if (item.discount_type === "percentage") return `${Number(item.discount_value)}%`;
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(item.discount_value));
}

function getCodeStatus(item: DiscountCode) {
  const expiry = item.valid_until ? new Date(`${item.valid_until}T23:59:59`) : null;
  if (expiry && !Number.isNaN(expiry.getTime()) && expiry < new Date()) {
    return { key: "expired" as const, label: "Verlopen" };
  }
  if (!item.active) return { key: "inactive" as const, label: "Inactief" };
  if (item.max_uses !== null && item.used_count >= item.max_uses) {
    return { key: "used" as const, label: "Gebruikt" };
  }
  return { key: "active" as const, label: "Actief" };
}

function getRemainingLabel(item: DiscountCode) {
  if (item.max_uses === null) return "Onbeperkt bruikbaar";
  const remaining = Math.max(0, item.max_uses - item.used_count);
  if (remaining === 0) return "Niet meer bruikbaar";
  return `Nog ${remaining} ${remaining === 1 ? "keer" : "keer"} bruikbaar`;
}

const products = [
  ["all", "Alle producten"],
  ["10-beurtenkaart-lager", "10-beurtenkaart lager"],
  ["10-beurtenkaart-secundair", "10-beurtenkaart secundair"],
  ["klaar-voor-de-sprong-middelbaar", "Klaar voor de Sprong middelbaar"],
  ["klaar-voor-de-sprong-eerste-leerjaar", "Klaar voor de Sprong eerste leerjaar"],
  ["tekstcorrectie", "Tekstcorrectie"],
] as const;

export default function DiscountCodesAdmin() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [discountType, setDiscountType] = useState<DiscountType>("fixed");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const defaultValidUntil = useMemo(() => getDefaultValidUntil(), []);

  const loadCodes = useCallback(async () => {
    setLoadingCodes(true);
    try {
      const response = await fetch("/api/admin/discount-codes", { cache: "no-store" });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || "Kortingscodes konden niet geladen worden.");
      setCodes(data.codes ?? []);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Kortingscodes konden niet geladen worden.");
    } finally {
      setLoadingCodes(false);
    }
  }, []);

  useEffect(() => {
    void loadCodes();
  }, [loadCodes]);

  const statistics = useMemo(() => {
    const result = { total: codes.length, active: 0, used: 0, expired: 0, inactive: 0 };
    codes.forEach((item) => {
      result[getCodeStatus(item).key] += 1;
    });
    return result;
  }, [codes]);

  const visibleCodes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...codes]
      .filter((item) => {
        const status = getCodeStatus(item).key;
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        const haystack = [
          item.code,
          item.customer_name,
          item.email,
          item.description,
          getProductLabel(item.product),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchesStatus && (!query || haystack.includes(query));
      })
      .sort((a, b) => {
        if (sortMode === "oldest") {
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        }
        if (sortMode === "expiry") {
          return (a.valid_until || "9999-12-31").localeCompare(b.valid_until || "9999-12-31");
        }
        if (sortMode === "usage") return b.used_count - a.used_count;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [codes, search, statusFilter, sortMode]);

  function showMessage(type: "success" | "error", text: string) {
    setMessageType(type);
    setMessage(text);
  }

  async function copyCode(item: DiscountCode) {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopiedId(item.id);
      showMessage("success", `Code ${item.code} is gekopieerd.`);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      showMessage("error", "De code kon niet gekopieerd worden.");
    }
  }

  function openEdit(item: DiscountCode) {
    setEditing(item);
    setDiscountType(item.discount_type);
    setMessage("");
  }

  async function deleteCode(item: DiscountCode) {
    if (!window.confirm(`Ben je zeker dat je kortingscode ${item.code} wilt verwijderen?`)) return;
    setDeletingId(item.id);
    try {
      const response = await fetch(`/api/admin/discount-codes?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || "Kortingscode kon niet verwijderd worden.");
      setCodes((current) => current.filter((code) => code.id !== item.id));
      showMessage("success", `Kortingscode ${item.code} werd verwijderd.`);
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Kortingscode kon niet verwijderd worden.");
    } finally {
      setDeletingId(null);
    }
  }

  function formBody(form: HTMLFormElement) {
    const data = new FormData(form);
    const maxUses = String(data.get("max_uses") || "").trim();
    return {
      code: String(data.get("code") || "").trim().toUpperCase(),
      customer_name: String(data.get("customer_name") || "").trim() || null,
      email: String(data.get("email") || "").trim() || null,
      description: String(data.get("description") || "").trim() || null,
      discount_type: String(data.get("discount_type") || "fixed") as DiscountType,
      discount_value: Number(data.get("discount_value")),
      product: String(data.get("product") || "all"),
      valid_until: String(data.get("valid_until") || "").trim() || null,
      max_uses: maxUses ? Number(maxUses) : null,
      active: data.get("active") === "on",
    };
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/admin/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formBody(form)),
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || "Kortingscode kon niet aangemaakt worden.");
      showMessage("success", `Kortingscode ${data.code?.code ?? ""} werd aangemaakt.`);
      form.reset();
      setDiscountType("fixed");
      await loadCodes();
      setViewMode("overview");
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Kortingscode kon niet aangemaakt worden.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/discount-codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formBody(event.currentTarget), id: editing.id, used_count: editing.used_count }),
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || "Kortingscode kon niet aangepast worden.");
      if (data.code) setCodes((current) => current.map((item) => (item.id === data.code?.id ? data.code : item)));
      setEditing(null);
      showMessage("success", "Kortingscode werd aangepast.");
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Kortingscode kon niet aangepast worden.");
    } finally {
      setSaving(false);
    }
  }

  const fields = (item?: DiscountCode) => (
    <>
      <section className="discount-form-section">
        <div className="discount-section-heading"><span>01</span><div><p>Code en ontvanger</p><h2>Pas de zichtbare tekst aan</h2></div></div>
        <div className="discount-field-grid">
          <label className="discount-field"><span>Kortingscode</span><input name="code" defaultValue={item?.code || ""} placeholder="Automatisch bij leeg veld" /></label>
          <label className="discount-field"><span>Naam ontvanger</span><input name="customer_name" defaultValue={item?.customer_name || ""} /></label>
          <label className="discount-field"><span>E-mail ontvanger</span><input name="email" type="email" defaultValue={item?.email || ""} /></label>
          <label className="discount-field discount-field--full"><span>Omschrijving of boodschap</span><textarea name="description" rows={4} defaultValue={item?.description || ""} /></label>
        </div>
      </section>
      <section className="discount-form-section">
        <div className="discount-section-heading"><span>02</span><div><p>Korting</p><h2>Waarde en product</h2></div></div>
        <div className="discount-field-grid">
          <label className="discount-field"><span>Type korting</span><select name="discount_type" value={discountType} onChange={(e) => setDiscountType(e.target.value as DiscountType)}><option value="fixed">Vast bedrag</option><option value="percentage">Percentage</option></select></label>
          <label className="discount-field"><span>{discountType === "percentage" ? "Percentage (%)" : "Bedrag (€)"}</span><div className="discount-value-field"><span>{discountType === "percentage" ? "%" : "€"}</span><input name="discount_value" type="number" min="0.01" max={discountType === "percentage" ? 100 : undefined} step="0.01" defaultValue={item?.discount_value ?? 20} required /></div></label>
          <label className="discount-field discount-field--full"><span>Product</span><select name="product" defaultValue={item?.product || "10-beurtenkaart-lager"}>{products.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
      </section>
      <section className="discount-form-section">
        <div className="discount-section-heading"><span>03</span><div><p>Geldigheid</p><h2>Gebruik en status</h2></div></div>
        <div className="discount-field-grid">
          <label className="discount-field"><span>Geldig tot</span><input name="valid_until" type="date" defaultValue={item?.valid_until || defaultValidUntil} /></label>
          <label className="discount-field"><span>Maximaal aantal gebruiken</span><input name="max_uses" type="number" min="1" defaultValue={item?.max_uses ?? ""} placeholder="Onbeperkt" /></label>
          <label className="discount-active-toggle discount-field--full"><input name="active" type="checkbox" defaultChecked={item ? item.active : true} /><span><strong>Code actief</strong><small>Schakel uit om de code tijdelijk te blokkeren.</small></span></label>
        </div>
      </section>
    </>
  );

  if (viewMode === "create") {
    return <main className="discount-admin-page discount-admin-page--form"><div className="discount-form-shell"><header className="discount-form-header"><button type="button" className="discount-back-button" onClick={() => setViewMode("overview")}>←</button><div><p className="discount-page-eyebrow">Studio SaGo</p><h1>Nieuwe kortingscode</h1><p>Maak een persoonlijke of algemene korting aan.</p></div></header><form className="discount-create-form" onSubmit={handleCreate}>{fields()}<footer className="discount-form-actions"><button type="button" className="discount-cancel-button" onClick={() => setViewMode("overview")}>Annuleren</button><button type="submit" className="discount-submit-button" disabled={saving}>{saving ? "Aanmaken…" : "Kortingscode aanmaken"}</button></footer></form></div></main>;
  }

  return (
    <main className="discount-admin-page">
      <section className="discount-overview-shell">
        <header className="discount-overview-header"><div className="discount-title-block"><div className="discount-title-navigation"><Link href="/admin" className="discount-admin-back-link">←</Link><p className="discount-page-eyebrow">Studio SaGo</p></div><div className="discount-title-row"><h1>Kortingscodes</h1><span>{statistics.total} kortingscodes</span></div><p>Maak persoonlijke codes aan, zoek snel en beheer tekst, status en gebruik.</p></div><button type="button" className="discount-header-create-button" onClick={() => { setDiscountType("fixed"); setViewMode("create"); }}><span>＋</span>Nieuwe kortingscode</button></header>
        <section className="discount-statistics"><article className="discount-stat-card discount-stat-card--active"><strong>{statistics.active}</strong><span>Actief</span></article><article className="discount-stat-card discount-stat-card--used"><strong>{statistics.used}</strong><span>Gebruikt</span></article><article className="discount-stat-card discount-stat-card--expired"><strong>{statistics.expired}</strong><span>Verlopen</span></article><article className="discount-stat-card discount-stat-card--inactive"><strong>{statistics.inactive}</strong><span>Inactief</span></article></section>
        {message && <div className={`discount-message discount-message--${messageType}`}><span>{messageType === "success" ? "✓" : "!"}</span><p>{message}</p></div>}
        <section className="discount-list-card">
          <div className="discount-list-heading"><div><p className="discount-page-eyebrow">Alle kortingscodes</p><h2>Overzicht</h2></div><button type="button" className="discount-refresh-button" onClick={() => void loadCodes()} disabled={loadingCodes}><span>↻</span>{loadingCodes ? "Laden…" : "Vernieuwen"}</button></div>
          <div className="discount-toolbar"><label className="discount-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Zoek op code, naam, e-mail, product of tekst…" /></label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusKey)}><option value="all">Alle statussen</option><option value="active">Actief</option><option value="used">Gebruikt</option><option value="expired">Verlopen</option><option value="inactive">Inactief</option></select><select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}><option value="newest">Nieuwste eerst</option><option value="oldest">Oudste eerst</option><option value="expiry">Einddatum</option><option value="usage">Meest gebruikt</option></select></div>
          {loadingCodes ? <div className="discount-loading-state"><span className="discount-loading-spinner"/><p>Kortingscodes laden…</p></div> : visibleCodes.length === 0 ? <div className="discount-empty-state"><span>🏷️</span><h3>Geen resultaten</h3><p>Pas je zoekterm of filter aan.</p></div> : <><div className="discount-table-wrapper"><table className="discount-table"><thead><tr><th>Status</th><th>Korting</th><th>Code en ontvanger</th><th>Product</th><th>Gebruik</th><th>Geldig tot</th><th>Acties</th></tr></thead><tbody>{visibleCodes.map((item) => { const status = getCodeStatus(item); return <tr key={item.id} onDoubleClick={() => openEdit(item)} title="Dubbelklik om te bewerken"><td><span className={`discount-status discount-status--${status.key}`}>{status.label}</span></td><td><strong className="discount-amount">{getDiscountLabel(item)}</strong></td><td><div className="discount-recipient"><strong>{item.code}</strong><span>{item.customer_name || "Alle klanten"}</span><small>{item.email || "Niet gekoppeld"}</small>{item.description && <p>{item.description}</p>}</div></td><td><span className="discount-product">{getProductLabel(item.product)}</span></td><td><div className="discount-usage"><strong>{item.used_count}</strong><span>van {item.max_uses ?? "onbeperkt"}</span></div><span className="discount-remaining-badge">{getRemainingLabel(item)}</span></td><td><time>{formatDate(item.valid_until)}</time></td><td><div className="discount-row-actions"><button type="button" className="discount-copy-button" onClick={() => void copyCode(item)}>{copiedId === item.id ? "Gekopieerd" : "Kopiëren"}</button><button type="button" className="discount-edit-button" onClick={() => openEdit(item)}>Bewerken</button><button type="button" className="discount-delete-button" disabled={deletingId === item.id} onClick={() => void deleteCode(item)}>{deletingId === item.id ? "Bezig…" : "Verwijderen"}</button></div></td></tr>; })}</tbody></table></div><div className="discount-mobile-list">{visibleCodes.map((item) => { const status = getCodeStatus(item); return <article className="discount-mobile-card" key={item.id} onDoubleClick={() => openEdit(item)}><div className="discount-mobile-card__top"><span className={`discount-status discount-status--${status.key}`}>{status.label}</span><strong>{getDiscountLabel(item)}</strong></div><div className="discount-mobile-code"><span>Code</span><strong>{item.code}</strong></div><p className="discount-remaining-badge">{getRemainingLabel(item)}</p><dl><div><dt>Ontvanger</dt><dd>{item.customer_name || "Alle klanten"}</dd></div><div><dt>Product</dt><dd>{getProductLabel(item.product)}</dd></div><div><dt>Gebruik</dt><dd>{item.used_count} van {item.max_uses ?? "onbeperkt"}</dd></div><div><dt>Geldig tot</dt><dd>{formatDate(item.valid_until)}</dd></div></dl>{item.description && <p className="discount-mobile-description">{item.description}</p>}<div className="discount-mobile-actions"><button type="button" onClick={() => void copyCode(item)}>Kopiëren</button><button type="button" onClick={() => openEdit(item)}>Bewerken</button><button type="button" className="danger" onClick={() => void deleteCode(item)}>Verwijderen</button></div></article>; })}</div></>}
        </section>
      </section>
      <button type="button" className="discount-floating-button" onClick={() => setViewMode("create")}><span>＋</span></button>
      {editing && <div className="discount-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(null); }}><section className="discount-edit-modal" role="dialog" aria-modal="true" aria-labelledby="discount-edit-title"><header><div><p className="discount-page-eyebrow">Kortingscode aanpassen</p><h2 id="discount-edit-title">{editing.code}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Sluiten">×</button></header><form onSubmit={handleEdit}>{fields(editing)}<footer className="discount-form-actions"><button type="button" className="discount-cancel-button" onClick={() => setEditing(null)}>Annuleren</button><button type="submit" className="discount-submit-button" disabled={saving}>{saving ? "Opslaan…" : "Wijzigingen opslaan"}</button></footer></form></section></div>}
    </main>
  );
}
