"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

type DiscountCode = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  product: string;
  email: string | null;
  customer_name: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
};

type ViewMode = "overview" | "create";

function formatDate(date: string | null) {
  if (!date) return "Geen einddatum";

  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function getDefaultValidUntil() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getProductLabel(product: string) {
  const labels: Record<string, string> = {
    all: "Alle producten",
    "10-beurtenkaart-lager": "10-beurtenkaart lager",
    "10-beurtenkaart-secundair": "10-beurtenkaart secundair",
    "klaar-voor-de-sprong-middelbaar":
      "Klaar voor de Sprong middelbaar",
    "klaar-voor-de-sprong-eerste-leerjaar":
      "Klaar voor de Sprong eerste leerjaar",
    tekstcorrectie: "Tekstcorrectie",
  };

  return labels[product] || product;
}

function getDiscountLabel(item: DiscountCode) {
  if (item.discount_type === "percentage") {
    return `${Number(item.discount_value)}%`;
  }

  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(item.discount_value));
}

function getCodeStatus(item: DiscountCode) {
  const now = new Date();
  const expirationDate = item.valid_until
    ? new Date(`${item.valid_until}T23:59:59`)
    : null;

  const isExpired =
    expirationDate !== null &&
    !Number.isNaN(expirationDate.getTime()) &&
    expirationDate < now;

  const hasReachedLimit =
    item.max_uses !== null && item.used_count >= item.max_uses;

  if (isExpired) {
    return {
      key: "expired",
      label: "Verlopen",
    };
  }

  if (!item.active) {
    return {
      key: "inactive",
      label: "Inactief",
    };
  }

  if (hasReachedLimit) {
    return {
      key: "used",
      label: "Gebruikt",
    };
  }

  return {
    key: "active",
    label: "Actief",
  };
}

export default function DiscountCodesAdmin() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  const [loading, setLoading] = useState(false);
  const [loadingCodes, setLoadingCodes] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const [discountType, setDiscountType] = useState<
    "fixed" | "percentage"
  >("fixed");

  const defaultValidUntil = useMemo(() => getDefaultValidUntil(), []);

  const loadCodes = useCallback(async () => {
    setLoadingCodes(true);

    try {
      const response = await fetch("/api/admin/discount-codes", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Kortingscodes konden niet geladen worden."
        );
      }

      setCodes(data.codes || []);
    } catch (error) {
      console.error("LOAD DISCOUNT CODES ERROR:", error);

      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Kortingscodes konden niet geladen worden."
      );
    } finally {
      setLoadingCodes(false);
    }
  }, []);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const statistics = useMemo(() => {
    let active = 0;
    let used = 0;
    let expired = 0;
    let inactive = 0;

    codes.forEach((item) => {
      const status = getCodeStatus(item);

      if (status.key === "active") active += 1;
      if (status.key === "used") used += 1;
      if (status.key === "expired") expired += 1;
      if (status.key === "inactive") inactive += 1;
    });

    return {
      total: codes.length,
      active,
      used,
      expired,
      inactive,
    };
  }, [codes]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const maxUsesValue = String(
      formData.get("max_uses") || ""
    ).trim();

    const body = {
      description:
        String(formData.get("description") || "").trim() || null,
      discount_type: String(
        formData.get("discount_type") || "fixed"
      ),
      discount_value: Number(
        formData.get("discount_value") || 20
      ),
      product: String(formData.get("product") || "all"),
      email: String(formData.get("email") || "").trim() || null,
      customer_name:
        String(formData.get("customer_name") || "").trim() || null,
      valid_until:
        String(formData.get("valid_until") || "").trim() || null,
      max_uses: maxUsesValue ? Number(maxUsesValue) : null,
    };

    if (
      !Number.isFinite(body.discount_value) ||
      body.discount_value <= 0
    ) {
      setMessageType("error");
      setMessage("Vul een geldige kortingswaarde in.");
      setLoading(false);
      return;
    }

    if (
      body.discount_type === "percentage" &&
      body.discount_value > 100
    ) {
      setMessageType("error");
      setMessage("Een procentuele korting kan maximaal 100% zijn.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/discount-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Kortingscode kon niet aangemaakt worden."
        );
      }

      setMessageType("success");
      setMessage(
        `Kortingscode ${data.code.code} werd succesvol aangemaakt.`
      );

      form.reset();
      setDiscountType("fixed");

      await loadCodes();
      setViewMode("overview");
    } catch (error) {
      console.error("CREATE DISCOUNT CODE ERROR:", error);

      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Kortingscode kon niet aangemaakt worden."
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateView() {
    setMessage("");
    setDiscountType("fixed");
    setViewMode("create");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeCreateView() {
    setMessage("");
    setViewMode("overview");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (viewMode === "create") {
    return (
      <main className="discount-admin-page discount-admin-page--form">
        <div className="discount-form-shell">
          <header className="discount-form-header">
            <button
              type="button"
              className="discount-back-button"
              onClick={closeCreateView}
              aria-label="Terug naar kortingscodes"
            >
              <span aria-hidden="true">←</span>
            </button>

            <div>
              <p className="discount-page-eyebrow">Studio SaGo</p>
              <h1>Nieuwe kortingscode</h1>
              <p>
                Maak een persoonlijke of algemene korting aan voor
                je webshop.
              </p>
            </div>
          </header>

          <form
            className="discount-create-form"
            onSubmit={handleSubmit}
          >
            <section className="discount-form-section">
              <div className="discount-section-heading">
                <span>01</span>

                <div>
                  <p>Ontvanger</p>
                  <h2>Voor wie is de korting?</h2>
                </div>
              </div>

              <div className="discount-field-grid">
                <label className="discount-field">
                  <span>Naam ontvanger</span>

                  <input
                    name="customer_name"
                    type="text"
                    placeholder="Bijvoorbeeld Emma Janssens"
                    autoComplete="name"
                  />
                </label>

                <label className="discount-field">
                  <span>E-mail ontvanger</span>

                  <input
                    name="email"
                    type="email"
                    placeholder="naam@voorbeeld.be"
                    autoComplete="email"
                  />
                </label>

                <label className="discount-field discount-field--full">
                  <span>Omschrijving of persoonlijke boodschap</span>

                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Bijvoorbeeld: €20 korting na deelname aan Klaar voor de Sprong"
                  />
                </label>
              </div>

              <p className="discount-field-help">
                Laat naam en e-mail leeg wanneer iedereen de
                kortingscode mag gebruiken.
              </p>
            </section>

            <section className="discount-form-section">
              <div className="discount-section-heading">
                <span>02</span>

                <div>
                  <p>Korting</p>
                  <h2>Stel de kortingswaarde in</h2>
                </div>
              </div>

              <div className="discount-field-grid">
                <label className="discount-field">
                  <span>Type korting *</span>

                  <select
                    name="discount_type"
                    value={discountType}
                    onChange={(event) =>
                      setDiscountType(
                        event.target.value as
                          | "fixed"
                          | "percentage"
                      )
                    }
                    required
                  >
                    <option value="fixed">Vast bedrag</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </label>

                <label className="discount-field">
                  <span>
                    {discountType === "percentage"
                      ? "Percentage (%) *"
                      : "Bedrag (€) *"}
                  </span>

                  <div className="discount-value-field">
                    <span>
                      {discountType === "percentage" ? "%" : "€"}
                    </span>

                    <input
                      name="discount_value"
                      type="number"
                      defaultValue="20"
                      min="1"
                      max={
                        discountType === "percentage"
                          ? "100"
                          : undefined
                      }
                      step={
                        discountType === "percentage"
                          ? "1"
                          : "0.01"
                      }
                      required
                    />
                  </div>
                </label>

                <label className="discount-field discount-field--full">
                  <span>Product *</span>

                  <select
                    name="product"
                    defaultValue="10-beurtenkaart-lager"
                    required
                  >
                    <option value="all">Alle producten</option>

                    <option value="10-beurtenkaart-lager">
                      10-beurtenkaart lager
                    </option>

                    <option value="10-beurtenkaart-secundair">
                      10-beurtenkaart secundair
                    </option>

                    <option value="klaar-voor-de-sprong-middelbaar">
                      Klaar voor de Sprong middelbaar
                    </option>

                    <option value="klaar-voor-de-sprong-eerste-leerjaar">
                      Klaar voor de Sprong eerste leerjaar
                    </option>

                    <option value="tekstcorrectie">
                      Tekstcorrectie
                    </option>
                  </select>
                </label>
              </div>
            </section>

            <section className="discount-form-section">
              <div className="discount-section-heading">
                <span>03</span>

                <div>
                  <p>Geldigheid</p>
                  <h2>Bepaal hoelang de code geldig blijft</h2>
                </div>
              </div>

              <div className="discount-field-grid">
                <label className="discount-field">
                  <span>Geldig tot</span>

                  <input
                    name="valid_until"
                    type="date"
                    defaultValue={defaultValidUntil}
                  />
                </label>

                <label className="discount-field">
                  <span>Maximaal aantal gebruiken</span>

                  <input
                    name="max_uses"
                    type="number"
                    min="1"
                    placeholder="Onbeperkt"
                  />
                </label>
              </div>

              <p className="discount-field-help">
                Laat het maximale aantal leeg voor onbeperkt gebruik.
              </p>
            </section>

            {message && (
              <div
                className={`discount-message discount-message--${messageType}`}
                role="status"
              >
                <span aria-hidden="true">
                  {messageType === "success" ? "✓" : "!"}
                </span>

                <p>{message}</p>
              </div>
            )}

            <footer className="discount-form-actions">
              <button
                type="button"
                className="discount-cancel-button"
                onClick={closeCreateView}
                disabled={loading}
              >
                Annuleren
              </button>

              <button
                type="submit"
                className="discount-submit-button"
                disabled={loading}
              >
                <span aria-hidden="true">🏷</span>

                {loading
                  ? "Kortingscode aanmaken..."
                  : "Kortingscode aanmaken"}
              </button>
            </footer>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="discount-admin-page">
      <section className="discount-overview-shell">
        <header className="discount-overview-header">
          <div className="discount-title-block">
            <div className="discount-title-navigation">
              <Link
                href="/admin"
                className="discount-admin-back-link"
                aria-label="Terug naar admin"
              >
                ←
              </Link>

              <p className="discount-page-eyebrow">Studio SaGo</p>
            </div>

            <div className="discount-title-row">
              <h1>Kortingscodes</h1>

              <span>
                {statistics.total}{" "}
                {statistics.total === 1
                  ? "kortingscode"
                  : "kortingscodes"}
              </span>
            </div>

            <p>
              Maak persoonlijke codes aan en volg het gebruik ervan
              op.
            </p>
          </div>

          <button
            type="button"
            className="discount-header-create-button"
            onClick={openCreateView}
          >
            <span aria-hidden="true">＋</span>
            Nieuwe kortingscode
          </button>
        </header>

        <section
          className="discount-statistics"
          aria-label="Statistieken kortingscodes"
        >
          <article className="discount-stat-card discount-stat-card--active">
            <strong>{statistics.active}</strong>
            <span>Actief</span>
          </article>

          <article className="discount-stat-card discount-stat-card--used">
            <strong>{statistics.used}</strong>
            <span>Gebruikt</span>
          </article>

          <article className="discount-stat-card discount-stat-card--expired">
            <strong>{statistics.expired}</strong>
            <span>Verlopen</span>
          </article>

          <article className="discount-stat-card discount-stat-card--inactive">
            <strong>{statistics.inactive}</strong>
            <span>Inactief</span>
          </article>
        </section>

        {message && (
          <div
            className={`discount-message discount-message--${messageType}`}
            role="status"
          >
            <span aria-hidden="true">
              {messageType === "success" ? "✓" : "!"}
            </span>

            <p>{message}</p>
          </div>
        )}

        <section className="discount-list-card">
          <div className="discount-list-heading">
            <div>
              <p className="discount-page-eyebrow">
                Alle kortingscodes
              </p>

              <h2>Overzicht</h2>
            </div>

            <button
              type="button"
              className="discount-refresh-button"
              onClick={loadCodes}
              disabled={loadingCodes}
            >
              <span aria-hidden="true">↻</span>
              {loadingCodes ? "Laden..." : "Vernieuwen"}
            </button>
          </div>

          {loadingCodes ? (
            <div className="discount-loading-state">
              <span className="discount-loading-spinner" />
              <p>Kortingscodes laden...</p>
            </div>
          ) : codes.length === 0 ? (
            <div className="discount-empty-state">
              <span aria-hidden="true">🏷️</span>
              <h3>Nog geen kortingscodes</h3>
              <p>
                Maak je eerste kortingscode aan voor een klant of
                webshopproduct.
              </p>

              <button type="button" onClick={openCreateView}>
                Eerste kortingscode maken
              </button>
            </div>
          ) : (
            <>
              <div className="discount-table-wrapper">
                <table className="discount-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Korting</th>
                      <th>Code en ontvanger</th>
                      <th>Product</th>
                      <th>Gebruik</th>
                      <th>Geldig tot</th>
                    </tr>
                  </thead>

                  <tbody>
                    {codes.map((item) => {
                      const status = getCodeStatus(item);

                      return (
                        <tr key={item.id}>
                          <td data-label="Status">
                            <span
                              className={`discount-status discount-status--${status.key}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td data-label="Korting">
                            <strong className="discount-amount">
                              {getDiscountLabel(item)}
                            </strong>
                          </td>

                          <td data-label="Code en ontvanger">
                            <div className="discount-recipient">
                              <strong>{item.code}</strong>

                              <span>
                                {item.customer_name ||
                                  "Alle klanten"}
                              </span>

                              <small>
                                {item.email ||
                                  "Niet aan een e-mailadres gekoppeld"}
                              </small>

                              {item.description && (
                                <p>{item.description}</p>
                              )}
                            </div>
                          </td>

                          <td data-label="Product">
                            <span className="discount-product">
                              {getProductLabel(item.product)}
                            </span>
                          </td>

                          <td data-label="Gebruik">
                            <div className="discount-usage">
                              <strong>{item.used_count}</strong>

                              <span>
                                van{" "}
                                {item.max_uses ??
                                  "onbeperkt"}
                              </span>
                            </div>
                          </td>

                          <td data-label="Geldig tot">
                            <time>
                              {formatDate(item.valid_until)}
                            </time>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="discount-mobile-list">
                {codes.map((item) => {
                  const status = getCodeStatus(item);

                  return (
                    <article
                      className="discount-mobile-card"
                      key={item.id}
                    >
                      <div className="discount-mobile-card__top">
                        <span
                          className={`discount-status discount-status--${status.key}`}
                        >
                          {status.label}
                        </span>

                        <strong>
                          {getDiscountLabel(item)}
                        </strong>
                      </div>

                      <div className="discount-mobile-code">
                        <span>Code</span>
                        <strong>{item.code}</strong>
                      </div>

                      <dl>
                        <div>
                          <dt>Ontvanger</dt>
                          <dd>
                            {item.customer_name || "Alle klanten"}
                          </dd>
                        </div>

                        <div>
                          <dt>E-mail</dt>
                          <dd>{item.email || "Iedereen"}</dd>
                        </div>

                        <div>
                          <dt>Product</dt>
                          <dd>{getProductLabel(item.product)}</dd>
                        </div>

                        <div>
                          <dt>Gebruik</dt>
                          <dd>
                            {item.used_count} van{" "}
                            {item.max_uses ?? "onbeperkt"}
                          </dd>
                        </div>

                        <div>
                          <dt>Geldig tot</dt>
                          <dd>{formatDate(item.valid_until)}</dd>
                        </div>
                      </dl>

                      {item.description && (
                        <p className="discount-mobile-description">
                          {item.description}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </section>

      <button
        type="button"
        className="discount-floating-button"
        onClick={openCreateView}
        aria-label="Nieuwe kortingscode maken"
      >
        <span aria-hidden="true">＋</span>
      </button>
    </main>
  );
}