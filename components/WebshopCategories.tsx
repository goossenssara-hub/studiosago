"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import styles from "./WebshopCategories.module.css";

export type WebshopService = {
  id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  description: string | null;
  price: string | number | null;
  button_text: string | null;
  href: string | null;
  event_dates: string | null;
  image_url: string | null;
  is_visible: boolean;
  sort_order: number | null;
  download_count?: number | null;
};

type CategoryTheme = "lager" | "secundair" | "tekst" | "digitaal";
type CategoryIconType = "book" | "cap" | "pen" | "download";

type CategoryDefinition = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  theme: CategoryTheme;
  icon: CategoryIconType;
  match: (service: WebshopService) => boolean;
};

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("nl-BE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function searchableText(service: WebshopService): string {
  return normalize(
    [
      service.category,
      service.title,
      service.subtitle,
      service.description,
      service.href,
    ].join(" ")
  );
}

const categoryDefinitions: CategoryDefinition[] = [
  {
    id: "digitale-producten",
    eyebrow: "Werkboeken & downloads",
    title: "Digitale producten",
    intro:
      "Hier verschijnen digitale werkboeken, planners, oefenbundels en downloads.",
    theme: "digitaal",
    icon: "download",
    match: (service) => {
      /*
       * Alleen diensten die in de admin expliciet onder
       * "Digitale producten" staan, mogen hier verschijnen.
       *
       * Het woord "digitaal" in een beschrijving van begeleiding
       * (bijvoorbeeld "digitaal of aan huis") mag een dienst dus
       * niet langer in deze categorie plaatsen.
       */
      return normalize(service.category) === "digitale producten";
    },
  },
  {
    id: "lager-onderwijs",
    eyebrow: "Begeleiding & voorbereiding",
    title: "Lager onderwijs",
    intro:
      "Persoonlijke begeleiding en een sterke voorbereiding op de stap naar het eerste leerjaar.",
    theme: "lager",
    icon: "book",
    match: (service) => {
      const text = searchableText(service);

      return (
        text.includes("lager onderwijs") ||
        text.includes("basisonderwijs") ||
        text.includes("eerste leerjaar") ||
        text.includes("lager-onderwijs") ||
        text.includes("beurtenkaart lager")
      );
    },
  },
  {
    id: "secundair-onderwijs",
    eyebrow: "Studiebegeleiding & overgang",
    title: "Secundair onderwijs",
    intro:
      "Gerichte ondersteuning bij leren, plannen en de overgang naar het eerste middelbaar.",
    theme: "secundair",
    icon: "cap",
    match: (service) => {
      const text = searchableText(service);

      return (
        text.includes("secundair onderwijs") ||
        text.includes("middelbaar") ||
        text.includes("secundair-onderwijs") ||
        text.includes("beurtenkaart secundair")
      );
    },
  },
  {
    id: "correctie-teksten",
    eyebrow: "Taal & afwerking",
    title: "Correctie van teksten",
    intro:
      "Laat je tekst zorgvuldig nakijken op spelling, grammatica, formulering en leesbaarheid.",
    theme: "tekst",
    icon: "pen",
    match: (service) => {
      const text = searchableText(service);

      return (
        text.includes("correctie") ||
        text.includes("tekstcorrectie") ||
        text.includes("tekst correctie") ||
        text.includes("copywriting")
      );
    },
  }
];


function isRemovedFirstGradeWorkshop(service: WebshopService): boolean {
  const text = searchableText(service);
  const eventDates = normalize(service.event_dates);
  const price = normalize(service.price);

  return (
    text.includes("naar het eerste leerjaar") ||
    text.includes("klaar voor de sprong eerste leerjaar") ||
    text.includes("klaar-voor-de-sprong-eerste-leerjaar") ||
    (text.includes("klaar voor de sprong") && text.includes("eerste leerjaar")) ||
    (eventDates.includes("12, 13 & 14 augustus") && price.includes("180"))
  );
}

function formatPrice(value: WebshopService["price"]): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("nl-BE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  if (text.includes("€")) {
    return text;
  }

  const numeric = Number(text.replace(",", "."));

  if (Number.isFinite(numeric)) {
    return new Intl.NumberFormat("nl-BE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    }).format(numeric);
  }

  return text;
}

function getProductDetails(service: WebshopService) {
  const subtitle = service.subtitle?.trim() || null;
  const eventDates = service.event_dates?.trim() || null;
  const description = service.description?.trim() || null;

  return {
    subtitle,
    eventDates,
    description,
    hasDetails: Boolean(subtitle || eventDates || description),
  };
}

function CategoryIcon({ type }: { type: CategoryIconType }) {
  if (type === "book") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
      </svg>
    );
  }

  if (type === "cap") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3 9 9-5 9 5-9 5-9-5Z" />
        <path d="M7 12.5V17c2.7 2 7.3 2 10 0v-4.5" />
        <path d="M21 9v6" />
      </svg>
    );
  }

  if (type === "pen") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
        <path d="m14.5 7 3 3" />
        <path d="M4 4h7" />
        <path d="M4 8h5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function DownloadCountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export default function WebshopCategories({
  services,
}: {
  services: WebshopService[];
}) {
  const [previewProduct, setPreviewProduct] = useState<WebshopService | null>(null);
  const [gateProduct, setGateProduct] = useState<WebshopService | null>(null);
  const [gateMode, setGateMode] = useState<"preview" | "download">("preview");
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [gateError, setGateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockedEmails, setUnlockedEmails] = useState<Record<string, string>>({});
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(services.map((service) => [service.id, Number(service.download_count ?? 0)]))
  );

  useEffect(() => {
    if (!previewProduct && !gateProduct) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewProduct(null);
        setGateProduct(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewProduct, gateProduct]);

  useEffect(() => {
    const digitalProducts = services.filter(
      (service) =>
        service.is_visible === true &&
        normalize(service.category) === "digitale producten" &&
        Boolean(service.href?.toLowerCase().endsWith(".pdf"))
    );

    if (digitalProducts.length === 0) return;

    let cancelled = false;

    Promise.all(
      digitalProducts.map(async (product) => {
        try {
          const response = await fetch(
            `/api/digital-download/${encodeURIComponent(product.id)}?count=1`,
            { cache: "no-store" }
          );
          if (!response.ok) return null;
          const data = (await response.json()) as { count?: number };
          return [product.id, Number(data.count ?? 0)] as const;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (cancelled) return;
      setDownloadCounts((current) => {
        const next = { ...current };
        for (const result of results) {
          if (result) next[result[0]] = result[1];
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [services]);


  function openGate(product: WebshopService, mode: "preview" | "download") {
    const knownEmail = unlockedEmails[product.id];

    if (knownEmail) {
      if (mode === "preview") {
        setPreviewProduct(product);
      } else {
        void startDownload(product, knownEmail);
      }
      return;
    }

    setGateMode(mode);
    setGateProduct(product);
    setGateError("");
  }

  async function registerPreviewAccess(product: WebshopService, userEmail: string) {
    const response = await fetch(`/api/digital-preview/${encodeURIComponent(product.id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, marketingConsent }),
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) throw new Error(data.error || "Het voorbeeld kon niet worden geopend.");
  }

  async function startDownload(product: WebshopService, userEmail: string) {
    if (!product.href) return;

    setIsSubmitting(true);
    setGateError("");

    try {
      const response = await fetch(`/api/digital-download/${encodeURIComponent(product.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          file: product.href,
          marketingConsent,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        count?: number;
        downloadUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.downloadUrl) {
        throw new Error(data.error || "De download kon niet worden gestart.");
      }

      setDownloadCounts((current) => ({
        ...current,
        [product.id]: Number(data.count ?? current[product.id] ?? 0),
      }));
      setUnlockedEmails((current) => ({ ...current, [product.id]: userEmail }));
      setGateProduct(null);

      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.downloadUrl.split("/").pop() || "studio-sago-download.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setGateError(error instanceof Error ? error.message : "Er ging iets mis.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitGate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gateProduct) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setGateError("Vul een geldig e-mailadres in.");
      return;
    }

    setIsSubmitting(true);
    setGateError("");

    try {
      if (gateMode === "preview") {
        await registerPreviewAccess(gateProduct, normalizedEmail);
        setUnlockedEmails((current) => ({ ...current, [gateProduct.id]: normalizedEmail }));
        const product = gateProduct;
        setGateProduct(null);
        setPreviewProduct(product);
      } else {
        await startDownload(gateProduct, normalizedEmail);
      }
    } catch (error) {
      setGateError(error instanceof Error ? error.message : "Er ging iets mis.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleServices = services
    .filter(
      (service) =>
        service.is_visible === true && !isRemovedFirstGradeWorkshop(service)
    )
    .sort(
      (a, b) =>
        Number(a.sort_order ?? 9999) - Number(b.sort_order ?? 9999)
    );

  const categories = categoryDefinitions
    .map((definition) => ({
      ...definition,
      products: visibleServices.filter(definition.match),
    }))
    .filter(
      (category) =>
        category.theme === "digitaal" || category.products.length > 0
    );

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Studio SaGo</p>
        <h1>Waarmee kunnen we je helpen?</h1>
        <p className={styles.heroText}>
          Kies eerst een categorie en ga daarna rechtstreeks naar het product
          dat bij jouw vraag past.
        </p>

        {categories.length > 0 ? (
          <nav
            className={styles.quickNav}
            aria-label="Categorieën in de webshop"
          >
            {categories.map((category) => (
              <a key={category.id} href={`#${category.id}`}>
                <span
                  className={`${styles.navDot} ${styles[category.theme]}`}
                />
                {category.title}
              </a>
            ))}
          </nav>
        ) : null}
      </section>

      <section className={styles.categoryGrid} aria-label="Ons aanbod">
        {categories.map((category, index) => {
          const isComingSoon =
            category.theme === "digitaal" &&
            category.products.length === 0;

          return (
            <article
              key={category.id}
              id={category.id}
              className={`${styles.categoryCard} ${styles[category.theme]}`}
            >
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>
                  <CategoryIcon type={category.icon} />
                </div>

                <div className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>

              <p className={styles.eyebrow}>{category.eyebrow}</p>
              <h2>{category.title}</h2>
              <p className={styles.intro}>{category.intro}</p>

              {isComingSoon ? (
                <div className={styles.comingSoon}>
                  <span>Binnenkort beschikbaar</span>
                  <p>
                    Deze categorie is al voorzien. Zodra je in de admin een
                    digitaal product zichtbaar zet, verschijnt het hier
                    automatisch.
                  </p>
                </div>
              ) : (
                <div className={styles.productList}>
                  {category.products.map((product) => {
                    const price = formatPrice(product.price);
                    const href = product.href?.trim();
                    const details = getProductDetails(product);

                    const content = (
                      <>
                        <span className={styles.productCopy}>
                          <span className={styles.productTitleRow}>
                            <strong>{product.title}</strong>
                            {price ? <small>{price}</small> : null}
                          </span>

                          {details.subtitle ? (
                            <span className={styles.productSubtitle}>
                              {details.subtitle}
                            </span>
                          ) : null}

                          {details.eventDates ? (
                            <span className={styles.productDates}>
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3" y="5" width="18" height="16" rx="3" />
                                <path d="M8 3v4M16 3v4M3 10h18" />
                              </svg>
                              {details.eventDates}
                            </span>
                          ) : null}

                          {details.description ? (
                            <span className={styles.productDescription}>
                              {details.description}
                            </span>
                          ) : null}

                        </span>

                        <span className={styles.arrow}>
                          <ArrowIcon />
                        </span>
                      </>
                    );

                    if (!href) {
                      return (
                        <div
                          key={product.id}
                          className={`${styles.productButton} ${styles.disabledProduct}`}
                          aria-disabled="true"
                        >
                          {content}
                        </div>
                      );
                    }

                    const isDownload =
                      normalize(product.category) === "digitale producten" &&
                      href.toLowerCase().endsWith(".pdf");

                    if (isDownload) {
                      const downloadCount = Number(downloadCounts[product.id] ?? product.download_count ?? 0);

                      return (
                        <article key={product.id} className={styles.digitalProductCard}>
                          <button
                            type="button"
                            className={styles.productCoverButton}
                            onClick={() => openGate(product, "preview")}
                            aria-label={`Bekijk een voorbeeld van ${product.title}`}
                          >
                            <img
                              src={product.image_url?.trim() || "/images/studio-sago-ontdekkingsbord-cover.png"}
                              alt={`Voorbeeldafbeelding van ${product.title}`}
                              className={styles.productCover}
                            />
                            <span className={styles.coverOverlay}>
                              <EyeIcon />
                              Bekijk het spel
                            </span>
                          </button>

                          <div className={styles.digitalProductContent}>
                            <div className={styles.productCopy}>
                              <span className={styles.productTitleRow}>
                                <strong>{product.title}</strong>
                                {price ? <small>{price}</small> : null}
                              </span>

                              {details.subtitle ? (
                                <span className={styles.productSubtitle}>{details.subtitle}</span>
                              ) : null}

                              {details.eventDates ? (
                                <span className={styles.freeBadge}>{details.eventDates}</span>
                              ) : null}

                              {details.description ? (
                                <span className={styles.productDescription}>{details.description}</span>
                              ) : null}
                            </div>

                            <div className={styles.digitalProductFooter}>
                              <div className={styles.digitalActions}>
                                <button
                                  type="button"
                                  className={styles.previewButton}
                                  onClick={() => openGate(product, "preview")}
                                >
                                  <EyeIcon />
                                  Doorbladeren
                                </button>
                                <button
                                  type="button"
                                  className={styles.downloadButton}
                                  onClick={() => openGate(product, "download")}
                                  aria-label={`${product.button_text?.trim() || "Gratis downloaden"}: ${product.title}`}
                                >
                                  <DownloadIcon />
                                  {product.button_text?.trim() || "Gratis downloaden"}
                                </button>
                              </div>

                              <p className={styles.downloadCounter} aria-live="polite">
                                <DownloadCountIcon />
                                {downloadCount.toLocaleString("nl-BE")} {downloadCount === 1 ? "download" : "downloads"}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    }

                    return (
                      <Link
                        key={product.id}
                        href={href}
                        className={styles.productButton}
                        aria-label={`${product.button_text?.trim() || "Bekijk"}: ${product.title}`}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className={styles.helpCard}>
        <div>
          <p className={styles.eyebrow}>Nog niet zeker?</p>
          <h2>We bekijken samen wat het beste past.</h2>
          <p>
            Neem gerust contact op wanneer je twijfelt tussen een beurtenkaart,
            traject of andere ondersteuning.
          </p>
        </div>

        <Link href="/contact" className={styles.contactButton}>
          Contact opnemen
          <ArrowIcon />
        </Link>
      </section>

      {gateProduct ? (
        <div
          className={`${styles.modalBackdrop} ${styles.downloadGateBackdrop}`}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) setGateProduct(null);
          }}
        >
          <section
            className={styles.downloadGateModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-gate-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>Gratis Studio SaGo-product</span>
                <h2 id="email-gate-title">
                  {gateMode === "preview" ? "Bekijk eerst het voorbeeld" : "Ontvang je gratis download"}
                </h2>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setGateProduct(null)}
                aria-label="Venster sluiten"
                disabled={isSubmitting}
              >
                <CloseIcon />
              </button>
            </header>

            <form className={styles.downloadGateForm} onSubmit={submitGate}>
              <p className={styles.downloadGateIntro}>
                Laat je e-mailadres achter om het Studio SaGo Ontdekkingsbord
                {gateMode === "preview" ? " te kunnen doorbladeren." : " gratis te downloaden."}
              </p>

              <label className={styles.emailField}>
                E-mailadres <span aria-hidden="true">*</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="jouwnaam@email.be"
                  autoComplete="email"
                  required
                  autoFocus
                />
              </label>

              <label className={styles.consentRow}>
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(event) => setMarketingConsent(event.target.checked)}
                />
                <span>
Stuur me af en toe gratis educatieve tips, nieuwe downloads en exclusieve Studio SaGo-materialen. Je kunt je op elk moment uitschrijven.                </span>
              </label>

              <p className={styles.privacyNote}>
                Je e-mailadres wordt gebruikt om toegang te geven tot dit gratis product.
              </p>

              {gateError ? <p className={styles.formError} role="alert">{gateError}</p> : null}

              <button
                type="submit"
                className={`${styles.downloadButton} ${styles.downloadSubmitButton}`}
                disabled={isSubmitting}
              >
                {gateMode === "preview" ? <EyeIcon /> : <DownloadIcon />}
                {isSubmitting
                  ? "Even geduld…"
                  : gateMode === "preview"
                    ? "Bevestigen en voorbeeld bekijken"
                    : "Bevestigen en gratis downloaden"}
              </button>
            </form>
          </section>
        </div>
      ) : null}

      {previewProduct?.href ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewProduct(null);
          }}
        >
          <section
            className={styles.previewModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-preview-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>Gratis spel bekijken</span>
                <h2 id="pdf-preview-title">{previewProduct.title}</h2>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setPreviewProduct(null)}
                aria-label="Voorbeeld sluiten"
              >
                <CloseIcon />
              </button>
            </header>

            <div className={styles.pdfViewerWrap}>
              <iframe
                src={`${previewProduct.href}#view=FitH&toolbar=1&navpanes=0`}
                title={`Doorblader ${previewProduct.title}`}
                className={styles.pdfViewer}
              />
            </div>

            <footer className={styles.modalFooter}>
              <p>Gebruik de pijlen of scroll om door de pagina’s te bladeren.</p>
              <button
                type="button"
                className={styles.downloadButton}
                onClick={() => openGate(previewProduct, "download")}
              >
                <DownloadIcon />
                Gratis downloaden
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </main>
  );
}