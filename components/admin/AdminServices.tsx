"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AdminServices.module.css";

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
  created_at?: string;
  updated_at?: string;
};

type ServiceForm = {
  title: string;
  subtitle: string;
  category: string;
  description: string;
  price: string;
  button_text: string;
  href: string;
  event_dates: string;
  image_url: string;
  is_visible: boolean;
  sort_order: string;
};

const emptyForm: ServiceForm = {
  title: "",
  subtitle: "",
  category: "Begeleiding",
  description: "",
  price: "",
  button_text: "Bekijk",
  href: "",
  event_dates: "",
  image_url: "",
  is_visible: true,
  sort_order: "0",
};

function toForm(service: Service): ServiceForm {
  return {
    title: service.title ?? "",
    subtitle: service.subtitle ?? "",
    category: service.category ?? "Begeleiding",
    description: service.description ?? "",
    price: String(service.price ?? ""),
    button_text: service.button_text ?? "Bekijk",
    href: service.href ?? "",
    event_dates: service.event_dates ?? "",
    image_url: service.image_url ?? "",
    is_visible: Boolean(service.is_visible),
    sort_order: String(service.sort_order ?? 0),
  };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sortedServices = useMemo(
    () =>
      [...services].sort(
        (a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title)
      ),
    [services]
  );

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/services", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "De diensten konden niet geladen worden.");
      }

      setServices(payload.services ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "De diensten konden niet geladen worden."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  function updateField<K extends keyof ServiceForm>(
    key: K,
    value: ServiceForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  function startEditing(service: Service) {
    setEditingId(service.id);
    setForm(toForm(service));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const price = Number(form.price.replace(",", "."));
    const sortOrder = Number(form.sort_order);

    if (!form.title.trim()) {
      setError("Vul een titel in.");
      setSaving(false);
      return;
    }

    if (!form.href.trim()) {
      setError("Vul een link in, bijvoorbeeld /webshop/mijn-dienst.");
      setSaving(false);
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Vul een geldige prijs in.");
      setSaving(false);
      return;
    }

    const body = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      category: form.category.trim() || "Begeleiding",
      description: form.description.trim() || null,
      price,
      button_text: form.button_text.trim() || "Bekijk",
      href: form.href.trim(),
      event_dates: form.event_dates.trim() || null,
      image_url: form.image_url.trim() || null,
      is_visible: form.is_visible,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
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

      if (!response.ok) {
        throw new Error(payload.error || "Opslaan is mislukt.");
      }

      setMessage(editingId ? "De dienst is aangepast." : "De dienst is toegevoegd.");
      setEditingId(null);
      setForm(emptyForm);
      await loadServices();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Opslaan is mislukt."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility(service: Service) {
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: !service.is_visible }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "De zichtbaarheid kon niet aangepast worden.");
      }

      setServices((current) =>
        current.map((item) =>
          item.id === service.id ? payload.service : item
        )
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "De zichtbaarheid kon niet aangepast worden."
      );
    }
  }

  async function deleteService(service: Service) {
    const confirmed = window.confirm(
      `Ben je zeker dat je "${service.title}" wilt verwijderen?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Verwijderen is mislukt.");
      }

      setServices((current) => current.filter((item) => item.id !== service.id));

      if (editingId === service.id) {
        resetForm();
      }

      setMessage("De dienst is verwijderd.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Verwijderen is mislukt."
      );
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Studio SaGo admin</span>
          <h1>Diensten beheren</h1>
          <p>
            Voeg diensten toe, pas prijzen aan, verberg kaarten tijdelijk of
            verwijder ze volledig.
          </p>
        </div>

        <div className={styles.countCard}>
          <strong>{services.length}</strong>
          <span>{services.length === 1 ? "dienst" : "diensten"}</span>
        </div>
      </header>

      {(message || error) && (
        <div
          className={`${styles.notice} ${
            error ? styles.noticeError : styles.noticeSuccess
          }`}
          role="status"
        >
          {error || message}
        </div>
      )}

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formHeading}>
          <div>
            <span className={styles.formBadge}>
              {editingId ? "Dienst aanpassen" : "Nieuwe dienst"}
            </span>
            <h2>
              {editingId
                ? "Pas de geselecteerde dienst aan"
                : "Voeg een nieuwe dienst toe"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={resetForm}
            >
              Annuleren
            </button>
          )}
        </div>

        <div className={styles.formGrid}>
          <label>
            <span>Titel *</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Bijvoorbeeld 5-beurtenkaart Lager onderwijs"
              required
            />
          </label>

          <label>
            <span>Categorie</span>
            <input
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="Begeleiding"
            />
          </label>

          <label>
            <span>Subtitel</span>
            <input
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
              placeholder="Optionele extra regel"
            />
          </label>

          <label>
            <span>Datum of periode</span>
            <input
              value={form.event_dates}
              onChange={(event) =>
                updateField("event_dates", event.target.value)
              }
              placeholder="14, 15, 16 & 17 juli"
            />
          </label>

          <label>
            <span>Prijs in euro *</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="250"
              required
            />
          </label>

          <label>
            <span>Volgorde</span>
            <input
              type="number"
              step="1"
              value={form.sort_order}
              onChange={(event) =>
                updateField("sort_order", event.target.value)
              }
            />
          </label>

          <label>
            <span>Tekst op knop</span>
            <input
              value={form.button_text}
              onChange={(event) =>
                updateField("button_text", event.target.value)
              }
              placeholder="Bekijk"
            />
          </label>

          <label>
            <span>Link *</span>
            <input
              value={form.href}
              onChange={(event) => updateField("href", event.target.value)}
              placeholder="/webshop/mijn-dienst"
              required
            />
          </label>

          <label className={styles.fullWidth}>
            <span>Afbeeldingslink</span>
            <input
              value={form.image_url}
              onChange={(event) => updateField("image_url", event.target.value)}
              placeholder="/assets/diensten/mijn-afbeelding.jpg"
            />
          </label>

          <label className={styles.fullWidth}>
            <span>Beschrijving</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Optionele korte beschrijving"
              rows={4}
            />
          </label>

          <label className={styles.visibilityToggle}>
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={(event) =>
                updateField("is_visible", event.target.checked)
              }
            />
            <span>
              <strong>Zichtbaar in de webshop</strong>
              <small>
                Schakel dit uit om een dienst tijdelijk te verbergen.
              </small>
            </span>
          </label>
        </div>

        <button className={styles.primaryButton} type="submit" disabled={saving}>
          {saving
            ? "Bezig met opslaan..."
            : editingId
            ? "Wijzigingen opslaan"
            : "Dienst toevoegen"}
        </button>
      </form>

      <section className={styles.listSection}>
        <div className={styles.listHeading}>
          <div>
            <span className={styles.eyebrow}>Overzicht</span>
            <h2>Huidige diensten</h2>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => void loadServices()}
          >
            Vernieuwen
          </button>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Diensten laden...</div>
        ) : sortedServices.length === 0 ? (
          <div className={styles.emptyState}>
            Er zijn nog geen diensten toegevoegd.
          </div>
        ) : (
          <div className={styles.cards}>
            {sortedServices.map((service) => (
              <article
                key={service.id}
                className={`${styles.serviceCard} ${
                  !service.is_visible ? styles.hiddenCard : ""
                }`}
              >
                <div className={styles.cardTop}>
                  <div>
                    <span className={styles.category}>{service.category}</span>
                    <h3>{service.title}</h3>
                    {service.subtitle && <p>{service.subtitle}</p>}
                    {service.event_dates && (
                      <p className={styles.dates}>{service.event_dates}</p>
                    )}
                  </div>

                  <span
                    className={`${styles.status} ${
                      service.is_visible
                        ? styles.statusVisible
                        : styles.statusHidden
                    }`}
                  >
                    {service.is_visible
                      ? "Zichtbaar in webshop"
                      : "Verborgen uit webshop"}
                  </span>
                </div>

                {!service.is_visible && (
                  <div className={styles.hiddenNotice}>
                    Deze dienst is momenteel niet zichtbaar voor bezoekers van de webshop.
                  </div>
                )}

                {service.description && (
                  <p className={styles.description}>{service.description}</p>
                )}

                <div className={styles.cardMeta}>
                  <strong>{formatPrice(Number(service.price))}</strong>
                  <span>Volgorde: {service.sort_order}</span>
                  <span>{service.href}</span>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => startEditing(service)}
                  >
                    Aanpassen
                  </button>

                  <button
                    type="button"
                    className={styles.visibilityButton}
                    onClick={() => void toggleVisibility(service)}
                  >
                    {service.is_visible
                      ? "Verbergen uit webshop"
                      : "Opnieuw tonen in webshop"}
                  </button>

                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => void deleteService(service)}
                  >
                    Verwijderen
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
