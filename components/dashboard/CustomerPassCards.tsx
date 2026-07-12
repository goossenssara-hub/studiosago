"use client";

import Image from "next/image";
import Link from "next/link";
import "@/app/styles/customer-pass-cards.css";

export type CustomerPass = {
  id: string;

  product?: string | null;
  title?: string | null;
  product_name?: string | null;

  education_level?: string | null;
  level?: string | null;

  total_credits?: number | null;
  total_sessions?: number | null;

  remaining_credits?: number | null;
  remaining_sessions?: number | null;

  used_credits?: number | null;

  price?: number | string | null;
  amount?: number | string | null;

  status?: string | null;
  created_at?: string | null;
};

type CustomerPassCardsProps = {
  passes: CustomerPass[];
};

type PassLevel = "primary" | "secondary";

type PassTitle = {
  main: string;
  education: string;
};

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getPassName(pass: CustomerPass) {
  return (
    pass.product ||
    pass.title ||
    pass.product_name ||
    "Beurtenkaart"
  );
}

function getTotalCredits(pass: CustomerPass) {
  const savedTotal = Number(
    pass.total_sessions ??
      pass.total_credits
  );

  if (
    Number.isFinite(savedTotal) &&
    savedTotal > 0
  ) {
    return savedTotal;
  }

  const passName = normalizeText(
    getPassName(pass)
  );

  if (
    passName.includes("5-beurten") ||
    passName.includes("5 beurten")
  ) {
    return 5;
  }

  if (
    passName.includes("6-beurten") ||
    passName.includes("6 beurten")
  ) {
    return 6;
  }

  if (
    passName.includes("10-beurten") ||
    passName.includes("10 beurten")
  ) {
    return 10;
  }

  return 10;
}

function getRemainingCredits(
  pass: CustomerPass,
  totalCredits: number
) {
  const savedRemaining = Number(
    pass.remaining_sessions ??
      pass.remaining_credits
  );

  if (!Number.isFinite(savedRemaining)) {
    return totalCredits;
  }

  return Math.max(
    0,
    Math.min(totalCredits, savedRemaining)
  );
}

function getUsedCredits(
  pass: CustomerPass,
  totalCredits: number,
  remainingCredits: number
) {
  const savedUsed = Number(
    pass.used_credits
  );

  if (Number.isFinite(savedUsed)) {
    return Math.max(
      0,
      Math.min(totalCredits, savedUsed)
    );
  }

  return Math.max(
    0,
    totalCredits - remainingCredits
  );
}

function getLevel(
  pass: CustomerPass
): PassLevel {
  const value = normalizeText(
    [
      pass.education_level,
      pass.level,
      pass.product,
      pass.title,
      pass.product_name,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (
    value.includes("secundair") ||
    value.includes("middelbaar")
  ) {
    return "secondary";
  }

  return "primary";
}

function parsePrice(
  value: number | string | null | undefined
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const normalized = value
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function getPassPrice(
  pass: CustomerPass,
  totalCredits: number,
  level: PassLevel
) {
  const savedPrice =
    parsePrice(pass.price) ??
    parsePrice(pass.amount);

  if (savedPrice !== null) {
    return savedPrice;
  }

  if (totalCredits === 5) {
    return level === "secondary"
      ? 180
      : 165;
  }

  if (totalCredits === 10) {
    return level === "secondary"
      ? 380
      : 320;
  }

  return null;
}

function getPassTitle(
  pass: CustomerPass,
  totalCredits: number,
  level: PassLevel
): PassTitle {
  const savedTitle = String(
    getPassName(pass)
  ).trim();

  const education =
    level === "secondary"
      ? "Secundair onderwijs"
      : "Lager onderwijs";

  if (
    savedTitle &&
    savedTitle !== "Beurtenkaart"
  ) {
    const cleanedMain = savedTitle
      .replace(/lager onderwijs/gi, "")
      .replace(/secundair onderwijs/gi, "")
      .replace(/middelbaar onderwijs/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    return {
      main:
        cleanedMain ||
        `${totalCredits}-beurtenkaart`,
      education,
    };
  }

  return {
    main: `${totalCredits}-beurtenkaart`,
    education,
  };
}

function getSubtitle(level: PassLevel) {
  if (level === "secondary") {
    return "Persoonlijke begeleiding bij studeren, plannen en leren.";
  }

  return "Persoonlijke begeleiding op maat van jouw kind.";
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export default function CustomerPassCards({
  passes,
}: CustomerPassCardsProps) {
  if (!passes?.length) {
    return (
      <section className="customer-passes-section">
        <div className="customer-passes-heading">
          <span
            className="customer-passes-heading-icon"
            aria-hidden="true"
          >
            🎟️
          </span>

          <div>
            <p className="customer-passes-eyebrow">
              Begeleiding
            </p>

            <h2>Mijn beurtenkaarten</h2>
          </div>
        </div>

        <div className="customer-passes-empty">
          <div className="customer-passes-empty-icon">
            🎫
          </div>

          <h3>
            Nog geen actieve beurtenkaart
          </h3>

          <p>
            Zodra je een beurtenkaart
            aankoopt, verschijnt die hier
            automatisch.
          </p>

          <Link
            href="/webshop"
            className="customer-pass-shop-button"
          >
            Bekijk de beurtenkaarten
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="customer-passes-section">
      <div className="customer-passes-heading">
        <span
          className="customer-passes-heading-icon"
          aria-hidden="true"
        >
          🎟️
        </span>

        <div>
          <p className="customer-passes-eyebrow">
            Begeleiding
          </p>

          <h2>Mijn beurtenkaarten</h2>
        </div>
      </div>

      <div className="customer-passes-grid">
        {passes.map((pass) => {
          const totalCredits =
            getTotalCredits(pass);

          const remainingCredits =
            getRemainingCredits(
              pass,
              totalCredits
            );

          const usedCredits =
            getUsedCredits(
              pass,
              totalCredits,
              remainingCredits
            );

          const level = getLevel(pass);

          const price = getPassPrice(
            pass,
            totalCredits,
            level
          );

          const title = getPassTitle(
            pass,
            totalCredits,
            level
          );

          const progressPercentage =
            totalCredits > 0
              ? (usedCredits /
                  totalCredits) *
                100
              : 0;

          const normalizedStatus =
            normalizeText(pass.status);

          const isFinished =
            remainingCredits <= 0;

          const isInactive =
            normalizedStatus === "inactive" ||
            normalizedStatus === "expired" ||
            normalizedStatus === "cancelled" ||
            normalizedStatus === "canceled";

          return (
            <article
              key={pass.id}
              className={[
                "customer-pass-card",
                level === "secondary"
                  ? "customer-pass-card--secondary"
                  : "customer-pass-card--primary",
                totalCredits <= 6
                  ? "customer-pass-card--small"
                  : "customer-pass-card--large",
                isFinished
                  ? "customer-pass-card--finished"
                  : "",
                isInactive
                  ? "customer-pass-card--inactive"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="customer-pass-top">
                <div>
                  <span className="customer-pass-type">
                    {totalCredits}{" "}
                    {totalCredits === 1
                      ? "beurt"
                      : "beurten"}
                  </span>

                  <h3 className="customer-pass-title">
                    <span className="customer-pass-title-main">
                      {title.main}
                    </span>

                    <span className="customer-pass-title-education">
                      {title.education}
                    </span>
                  </h3>

                  <p className="customer-pass-subtitle">
                    {getSubtitle(level)}
                  </p>
                </div>

                {price !== null && (
                  <div className="customer-pass-price">
                    {formatPrice(price)}
                  </div>
                )}
              </div>

              <div
                className="customer-pass-stamps"
                aria-label={`${usedCredits} van de ${totalCredits} beurten gebruikt`}
              >
                {Array.from({
                  length: totalCredits,
                }).map((_, index) => {
                  const isUsed =
                    index < usedCredits;

                  const creditNumber =
                    index + 1;

                  return (
                    <div
                      key={`${pass.id}-credit-${creditNumber}`}
                      className={[
                        "customer-pass-stamp",
                        isUsed
                          ? "customer-pass-stamp--used"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      title={
                        isUsed
                          ? `Beurt ${creditNumber} is gebruikt of ingeboekt`
                          : `Beurt ${creditNumber} is nog beschikbaar`
                      }
                    >
                      {isUsed ? (
                        <Image
                          src="/assets/leerling-login/student-circle.png"
                          alt={`Studio SaGo-stempel voor beurt ${creditNumber}`}
                          width={74}
                          height={74}
                          className="customer-pass-stamp-image"
                        />
                      ) : (
                        <span>
                          {creditNumber}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="customer-pass-progress">
                <div className="customer-pass-progress-information">
                  <span>
                    <strong>
                      {usedCredits}
                    </strong>{" "}
                    van de {totalCredits}{" "}
                    {totalCredits === 1
                      ? "beurt"
                      : "beurten"}{" "}
                    gebruikt
                  </span>

                  <span>
                    <strong>
                      {remainingCredits}
                    </strong>{" "}
                    {remainingCredits === 1
                      ? "beurt"
                      : "beurten"}{" "}
                    beschikbaar
                  </span>
                </div>

                <div
                  className="customer-pass-progress-track"
                  role="progressbar"
                  aria-label="Gebruikte beurten"
                  aria-valuemin={0}
                  aria-valuemax={totalCredits}
                  aria-valuenow={usedCredits}
                >
                  <div
                    className="customer-pass-progress-value"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          progressPercentage
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="customer-pass-footer">
                <div className="customer-pass-status">
                  <span
                    className={[
                      "customer-pass-status-dot",
                      isFinished ||
                      isInactive
                        ? "customer-pass-status-dot--inactive"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />

                  {isInactive
                    ? "Niet actief"
                    : isFinished
                      ? "Volledig gebruikt"
                      : "Actieve beurtenkaart"}
                </div>

                {!isFinished &&
                !isInactive ? (
                  <Link
                    href={`/afspraak-maken?passId=${encodeURIComponent(
                      pass.id
                    )}`}
                    className="customer-pass-button"
                  >
                    <span>
                      Afspraak plannen
                    </span>

                    <span aria-hidden="true">
                      →
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/webshop"
                    className="customer-pass-button"
                  >
                    <span>
                      Nieuwe kaart kopen
                    </span>

                    <span aria-hidden="true">
                      →
                    </span>
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="customer-passes-policy">
        <span
          className="customer-passes-policy-icon"
          aria-hidden="true"
        >
          ↩
        </span>

        <p>
          Bij een annulatie van minstens{" "}
          <strong>
            72 uur op voorhand
          </strong>{" "}
          wordt de beurt automatisch
          teruggezet op je kaart.
        </p>
      </div>
    </section>
  );
}