"use client";

import {
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./AdminServices.module.css";

type ServiceCategory =
  | "Lager onderwijs"
  | "Secundair onderwijs"
  | "Correctie van teksten"
  | "Digitale producten";

type Service = {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  description: string | null;
  price: number;
  button_text: string;
  href: string;
  event_dates: string | null;
  image_url: string | null;
  is_visible: boolean;
  sort_order: number;
};

type ServiceForm = {
  title: string;
  subtitle: string;
  category: ServiceCategory | "";
  description: string;
  price: string;
  button_text: string;
  href: string;
  event_dates: string;
  image_url: string;
  is_visible: boolean;
};

const CATEGORY_OPTIONS: ServiceCategory[] = [
  "Lager onderwijs",
  "Secundair onderwijs",
  "Correctie van teksten",
  "Digitale producten",
];

const emptyForm: ServiceForm = {
  title: "",
  subtitle: "",
  category: "",
  description: "",
  price: "",
  button_text: "Bekijk",
  href: "",
  event_dates: "",
  image_url: "",
  is_visible: true,
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("nl-BE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toForm(service: Service): ServiceForm {
  return {
    title: service.title ?? "",
    subtitle: service.subtitle ?? "",
    category: CATEGORY_OPTIONS.includes(service.category as ServiceCategory)
      ? (service.category as ServiceCategory)
      : "",
    description: service.description ?? "",
    price: String(service.price ?? ""),
    button_text: service.button_text ?? "Bekijk",
    href: service.href ?? "",
    event_dates: service.event_dates ?? "",
    image_url: service.image_url ?? "",
    is_visible: Boolean(service.is_visible),
  };
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ServiceCategory>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/services", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Diensten laden is mislukt.");
      setServices(payload.services ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Diensten laden is mislukt.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const filteredByCategory = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("nl-BE");
    return CATEGORY_OPTIONS.reduce<Record<ServiceCategory, Service[]>>((result, category) => {
      const list = services
        .filter((service) => service.category === category)
        .filter((service) => categoryFilter === "all" || service.category === categoryFilter)
        .filter((service) => {
          if (!needle) return true;
          return [service.title, service.subtitle, service.description, service.href]
            .join(" ")
            .toLocaleLowerCase("nl-BE")
            .includes(needle);
        })
        .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
      result[category] = list;
      return result;
    }, {} as Record<ServiceCategory, Service[]>);
  }, [services, query, categoryFilter]);

  function updateField<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEditing(service: Service) {
    setEditingId(service.id);
    setForm(toForm(service));
    setOpenMenuId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const price = Number(form.price.replace(",", "."));
    if (!form.title.trim()) {
      setError("Vul een titel in.");
      setSaving(false);
      return;
    }
    if (!form.category) {
      setError("Kies een categorie.");
      setSaving(false);
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Vul een geldige prijs in.");
      setSaving(false);
      return;
    }

    const href = form.href.trim() || `/webshop/${slugify(form.title)}`;
    const body = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      category: form.category,
      description: form.description.trim() || null,
      price,
      button_text: form.button_text.trim() || "Bekijk",
      href,
      event_dates: form.event_dates.trim() || null,
      image_url: form.image_url.trim() || null,
      is_visible: form.is_visible,
      sort_order: editingId
        ? services.find((item) => item.id === editingId)?.sort_order ?? 0
        : services.filter((item) => item.category === form.category).length,
    };

    try {
      const response = await fetch(
        editingId ? `/api/admin/services/${editingId}` : "/api/admin/services",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Opslaan is mislukt.");
      setMessage(editingId ? "Dienst aangepast." : "Dienst toegevoegd.");
      resetForm();
      await loadServices();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Opslaan is mislukt.");
    } finally {
      setSaving(false);
    }
  }

  async function patchService(id: string, patch: Record<string, unknown>) {
    const response = await fetch(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Aanpassen is mislukt.");
    return payload.service as Service;
  }

  async function toggleVisibility(service: Service) {
    setError("");
    try {
      const updated = await patchService(service.id, { is_visible: !service.is_visible });
      setServices((current) => current.map((item) => (item.id === service.id ? updated : item)));
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Zichtbaarheid aanpassen is mislukt.");
    }
  }

  async function duplicateService(service: Service) {
    setOpenMenuId(null);
    setError("");
    const title = `${service.title} kopie`;
    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...service,
          id: undefined,
          title,
          href: `/webshop/${slugify(title)}-${Date.now().toString().slice(-5)}`,
          sort_order: services.filter((item) => item.category === service.category).length,
          is_visible: false,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Dupliceren is mislukt.");
      setMessage("Dienst gedupliceerd en verborgen toegevoegd.");
      await loadServices();
    } catch (duplicateError) {
      setError(duplicateError instanceof Error ? duplicateError.message : "Dupliceren is mislukt.");
    }
  }

  async function deleteService(service: Service) {
    setOpenMenuId(null);
    if (!window.confirm(`Ben je zeker dat je "${service.title}" wilt verwijderen?`)) return;
    const response = await fetch(`/api/admin/services/${service.id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Verwijderen is mislukt.");
      return;
    }
    setServices((current) => current.filter((item) => item.id !== service.id));
  }

  async function persistOrder(category: ServiceCategory, ordered: Service[]) {
    setReordering(true);
    setError("");
    try {
      const response = await fetch("/api/admin/services/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          items: ordered.map((service, index) => ({ id: service.id, sort_order: index })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Volgorde opslaan is mislukt.");
      setMessage("Nieuwe volgorde opgeslagen.");
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Volgorde opslaan is mislukt.");
      await loadServices();
    } finally {
      setReordering(false);
    }
  }

  function handleDrop(event: DragEvent, target: Service, category: ServiceCategory) {
    event.preventDefault();
    if (!draggedId || draggedId === target.id) return;
    const source = services.find((item) => item.id === draggedId);
    if (!source || source.category !== category) return;

    const categoryItems = services
      .filter((item) => item.category === category)
      .sort((a, b) => a.sort_order - b.sort_order);
    const fromIndex = categoryItems.findIndex((item) => item.id === draggedId);
    const toIndex = categoryItems.findIndex((item) => item.id === target.id);
    const reordered = [...categoryItems];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const newOrders = new Map(reordered.map((item, index) => [item.id, index]));
    setServices((current) =>
      current.map((item) =>
        item.category === category
          ? { ...item, sort_order: newOrders.get(item.id) ?? item.sort_order }
          : item
      )
    );
    setDraggedId(null);
    void persistOrder(category, reordered);
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Studio SaGo admin</span>
          <h1>Diensten beheren</h1>
          <p>Sleep kaarten binnen hun categorie. De webshop neemt de nieuwe volgorde automatisch over.</p>
        </div>
        <div className={styles.countCard}><strong>{services.length}</strong><span>diensten</span></div>
      </header>

      {(message || error) && (
        <div className={`${styles.notice} ${error ? styles.noticeError : styles.noticeSuccess}`} role="status">
          {error || message}
        </div>
      )}

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formHeading}>
          <div><span className={styles.formBadge}>{editingId ? "Dienst aanpassen" : "Nieuwe dienst"}</span><h2>{editingId ? "Pas de geselecteerde dienst aan" : "Voeg een dienst toe"}</h2></div>
          {editingId && <button type="button" className={styles.secondaryButton} onClick={resetForm}>Annuleren</button>}
        </div>
        <div className={styles.formGrid}>
          <label><span>Titel *</span><input value={form.title} onChange={(e) => updateField("title", e.target.value)} required /></label>
          <label><span>Categorie *</span><select value={form.category} onChange={(e) => updateField("category", e.target.value as ServiceCategory | "")} required><option value="">Kies</option>{CATEGORY_OPTIONS.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label><span>Subtitel</span><input value={form.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} /></label>
          <label><span>Prijs *</span><input type="number" min="0" step="0.01" value={form.price} onChange={(e) => updateField("price", e.target.value)} required /></label>
          <label><span>Knoptekst</span><input value={form.button_text} onChange={(e) => updateField("button_text", e.target.value)} /></label>
          <label><span>Webshoplink</span><input value={form.href} onChange={(e) => updateField("href", e.target.value)} placeholder="Automatisch wanneer leeg" /></label>
          <label className={styles.fullWidth}><span>Beschrijving</span><textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} /></label>
          <label><span>Datum/periode</span><input value={form.event_dates} onChange={(e) => updateField("event_dates", e.target.value)} /></label>
          <label><span>Afbeeldingslink</span><input value={form.image_url} onChange={(e) => updateField("image_url", e.target.value)} /></label>
          <label className={styles.visibilityToggle}><input type="checkbox" checked={form.is_visible} onChange={(e) => updateField("is_visible", e.target.checked)} /><span>Zichtbaar in webshop</span></label>
        </div>
        <button className={styles.primaryButton} disabled={saving}>{saving ? "Opslaan..." : editingId ? "Wijzigingen opslaan" : "Dienst toevoegen"}</button>
      </form>

      <section className={styles.listSection}>
        <div className={styles.toolbar}>
          <input className={styles.search} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek dienst..." />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as "all" | ServiceCategory)}><option value="all">Alle categorieën</option>{CATEGORY_OPTIONS.map((category) => <option key={category}>{category}</option>)}</select>
          {reordering && <span className={styles.savingOrder}>Volgorde opslaan...</span>}
        </div>

        {loading ? <p>Laden...</p> : CATEGORY_OPTIONS.map((category) => {
          const items = filteredByCategory[category];
          if (categoryFilter !== "all" && categoryFilter !== category) return null;
          return (
            <section key={category} className={styles.categorySection}>
              <button type="button" className={styles.categoryHeader} onClick={() => setCollapsed((current) => ({ ...current, [category]: !current[category] }))}>
                <span>{collapsed[category] ? "▸" : "▾"}</span><strong>{category}</strong><em>{items.length}</em>
              </button>
              {!collapsed[category] && <div className={styles.cards}>
                {items.map((service) => (
                  <article
                    key={service.id}
                    className={`${styles.serviceCard} ${!service.is_visible ? styles.hiddenCard : ""} ${draggedId === service.id ? styles.dragging : ""}`}
                    draggable
                    onDragStart={() => setDraggedId(service.id)}
                    onDragEnd={() => setDraggedId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, service, category)}
                  >
                    <div className={styles.cardTop}>
                      <button type="button" className={styles.dragHandle} aria-label="Versleep dienst">⋮⋮</button>
                      <span className={styles.category}>{service.category}</span>
                      <button type="button" className={styles.visibilitySwitch} onClick={() => void toggleVisibility(service)} aria-pressed={service.is_visible}>{service.is_visible ? "👁 Zichtbaar" : "🙈 Verborgen"}</button>
                      <div className={styles.menuWrap}>
                        <button type="button" className={styles.menuButton} onClick={() => setOpenMenuId((current) => current === service.id ? null : service.id)}>•••</button>
                        {openMenuId === service.id && <div className={styles.menu}>
                          <button type="button" onClick={() => startEditing(service)}>Bewerken</button>
                          <button type="button" onClick={() => void duplicateService(service)}>Dupliceren</button>
                          <button type="button" onClick={() => void toggleVisibility(service)}>{service.is_visible ? "Verbergen" : "Tonen"}</button>
                          <button type="button" className={styles.danger} onClick={() => void deleteService(service)}>Verwijderen</button>
                        </div>}
                      </div>
                    </div>
                    <h3>{service.title}</h3>
                    {service.subtitle && <p className={styles.subtitle}>{service.subtitle}</p>}
                    {service.description && <p className={styles.description}>{service.description}</p>}
                    <div className={styles.cardFooter}><strong>{formatPrice(Number(service.price))}</strong><span>{service.href}</span></div>
                  </article>
                ))}
                {items.length === 0 && <p className={styles.empty}>Geen diensten in deze categorie.</p>}
              </div>}
            </section>
          );
        })}
      </section>
    </section>
  );
}
