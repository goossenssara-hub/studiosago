"use client";

import Link from "next/link";
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
  },
  {
    id: "digitale-producten",
    eyebrow: "Werkboeken & downloads",
    title: "Digitale producten",
    intro:
      "Hier verschijnen digitale werkboeken, planners, oefenbundels en downloads.",
    theme: "digitaal",
    icon: "download",
    match: (service) => {
      const text = searchableText(service);

      return (
        text.includes("digitaal") ||
        text.includes("download") ||
        text.includes("werkboek") ||
        text.includes("planner") ||
        text.includes("oefenbundel")
      );
    },
  },
];

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

export default function WebshopCategories({
  services,
}: {
  services: WebshopService[];
}) {
  /*
   * Extra veiligheidsfilter:
   * ook wanneer per ongeluk een verborgen dienst wordt doorgegeven,
   * verschijnt die nooit in deze component.
   */
  const visibleServices = services
    .filter((service) => service.is_visible === true)
    .sort(
      (a, b) =>
        Number(a.sort_order ?? 9999) - Number(b.sort_order ?? 9999)
    );

  const categories = categoryDefinitions
    .map((definition) => ({
      ...definition,
      products: visibleServices.filter(definition.match),
    }))
    /*
     * Digitale producten blijft als voorbereide categorie zichtbaar.
     * Andere categorieën verdwijnen wanneer er geen zichtbare diensten zijn.
     */
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

                          {!details.hasDetails ? (
                            <span className={styles.productDescription}>
                              Bekijk alle informatie over dit aanbod.
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
    </main>
  );
}
