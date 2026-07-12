"use client";

import Image from "next/image";
import Link from "next/link";
import "@/app/styles/customer-pass-cards.css";

export type CustomerPass = {
  id: string;

  // Naam van de kaart
  title?: string | null;
  product_name?: string | null;

  // Bijvoorbeeld: lager of secundair
  education_level?: string | null;
  level?: string | null;

  // Totaal aantal beurten
  total_credits?: number | null;
  total_sessions?: number | null;

  // Resterende beurten
  remaining_credits?: number | null;
  remaining_sessions?: number | null;

  // Eventueel rechtstreeks opgeslagen gebruikte beurten
  used_credits?: number | null;

  price?: number | null;
  status?: string | null;
};

type CustomerPassCardsProps = {
  passes: CustomerPass[];
};

function getTotalCredits(pass: CustomerPass) {
  return Number(
    pass.total_credits ??
      pass.total_sessions ??
      (pass.title?.includes("5-beurtenkaart") ? 5 : 10)
  );
}

function getRemainingCredits(pass: CustomerPass, totalCredits: number) {
  const remaining = Number(
    pass.remaining_credits ?? pass.remaining_sessions ?? totalCredits
  );

  return Math.max(0, Math.min(totalCredits, remaining));
}

function getUsedCredits(
  pass: CustomerPass,
  totalCredits: number,
  remainingCredits: number
) {
  if (pass.used_credits !== null && pass.used_credits !== undefined) {
    return Math.max(0, Math.min(totalCredits, Number(pass.used_credits)));
  }

  return Math.max(0, totalCredits - remainingCredits);
}

function getLevel(pass: CustomerPass) {
  const value = String(
    pass.education_level ??
      pass.level ??
      pass.product_name ??
      pass.title ??
      ""
  ).toLowerCase();

  if (value.includes("secundair") || value.includes("middelbaar")) {
    return "secondary";
  }

  return "primary";
}

function getPassPrice(
  pass: CustomerPass,
  totalCredits: number,
  level: "primary" | "secondary"
) {
  if (pass.price !== null && pass.price !== undefined) {
    return Number(pass.price);
  }

  if (totalCredits === 5) {
    return level === "secondary" ? 180 : 165;
  }

  if (totalCredits === 10) {
    return level === "secondary" ? 380 : 320;
  }

  return null;
}

function getPassTitle(
  pass: CustomerPass,
  totalCredits: number,
  level: "primary" | "secondary"
) {
  if (pass.title) {
    return pass.title;
  }

  return `${totalCredits}-beurtenkaart ${
    level === "secondary" ? "Secundair onderwijs" : "Lager onderwijs"
  }`;
}

export default function CustomerPassCards({
  passes,
}: CustomerPassCardsProps) {
  if (!passes?.length) {
    return (
      <section className="customer-passes-section">
        <div className="customer-passes-heading">
          <span className="customer-passes-heading-icon" aria-hidden="true">
            🎟️
          </span>

          <div>
            <p className="customer-passes-eyebrow">Begeleiding</p>
            <h2>Mijn beurtenkaarten</h2>
          </div>
        </div>

        <div className="customer-passes-empty">
          <div className="customer-passes-empty-icon">🎫</div>
          <h3>Nog geen actieve beurtenkaart</h3>
          <p>
            Zodra je een beurtenkaart aankoopt, verschijnt die hier automatisch.
          </p>

          <Link href="/webshop" className="customer-pass-shop-button">
            Bekijk de beurtenkaarten
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="customer-passes-section">
      <div className="customer-passes-heading">
        <span className="customer-passes-heading-icon" aria-hidden="true">
          🎟️
        </span>

        <div>
          <p className="customer-passes-eyebrow">Begeleiding</p>
          <h2>Mijn beurtenkaarten</h2>
        </div>
      </div>

      <div className="customer-passes-grid">
        {passes.map((pass) => {
          const totalCredits = getTotalCredits(pass);
          const remainingCredits = getRemainingCredits(pass, totalCredits);
          const usedCredits = getUsedCredits(
            pass,
            totalCredits,
            remainingCredits
          );

          const level = getLevel(pass);
          const price = getPassPrice(pass, totalCredits, level);
          const title = getPassTitle(pass, totalCredits, level);

          const progressPercentage =
            totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;

          const isFinished = remainingCredits <= 0;
          const isInactive =
            pass.status === "inactive" ||
            pass.status === "expired" ||
            pass.status === "cancelled";

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
                isFinished ? "customer-pass-card--finished" : "",
                isInactive ? "customer-pass-card--inactive" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="customer-pass-decoration customer-pass-decoration--one" />
              <div className="customer-pass-decoration customer-pass-decoration--two" />

              <div className="customer-pass-top">
                <div>
                  <span className="customer-pass-type">
                    {totalCredits} beurten
                  </span>

                  <h3>{title}</h3>

                  <p className="customer-pass-subtitle">
                    {level === "secondary"
                      ? "Persoonlijke begeleiding bij studeren, plannen en leren."
                      : "Persoonlijke begeleiding op maat van jouw kind."}
                  </p>
                </div>

                {price !== null && (
                  <div className="customer-pass-price">
                    €{price.toLocaleString("nl-BE")}
                  </div>
                )}
              </div>

              <div
                className="customer-pass-stamps"
                aria-label={`${usedCredits} van de ${totalCredits} beurten gebruikt`}
              >
                {Array.from({ length: totalCredits }).map((_, index) => {
                  const isUsed = index < usedCredits;

                  return (
                    <div
                      key={`${pass.id}-credit-${index}`}
                      className={[
                        "customer-pass-stamp",
                        isUsed ? "customer-pass-stamp--used" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      title={
                        isUsed
                          ? `Beurt ${index + 1} is gebruikt of ingeboekt`
                          : `Beurt ${index + 1} is nog beschikbaar`
                      }
                    >
                      {isUsed ? (
                        <Image
                          src="/assets/leerling-login/student-circle.png"
                          alt={`Stempel voor beurt ${index + 1}`}
                          width={74}
                          height={74}
                          className="customer-pass-stamp-image"
                        />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="customer-pass-progress">
                <div className="customer-pass-progress-information">
                  <span>
                    <strong>{usedCredits}</strong> van de {totalCredits} beurten
                    gebruikt
                  </span>

                  <span>
                    <strong>{remainingCredits}</strong>{" "}
                    {remainingCredits === 1 ? "beurt" : "beurten"} beschikbaar
                  </span>
                </div>

                <div
                  className="customer-pass-progress-track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={totalCredits}
                  aria-valuenow={usedCredits}
                >
                  <div
                    className="customer-pass-progress-value"
                    style={{
                      width: `${Math.min(100, progressPercentage)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="customer-pass-footer">
                <div className="customer-pass-status">
                  <span
                    className={[
                      "customer-pass-status-dot",
                      isFinished || isInactive
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

                {!isFinished && !isInactive ? (
                  <Link
                    href={`/afspraak-maken?passId=${encodeURIComponent(
                      pass.id
                    )}`}
                    className="customer-pass-button"
                  >
                    <span>Afspraak plannen</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <Link href="/webshop" className="customer-pass-button">
                    <span>Nieuwe kaart kopen</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="customer-passes-policy">
        <span className="customer-passes-policy-icon" aria-hidden="true">
          ↩
        </span>

        <p>
          Bij een annulatie van minstens <strong>72 uur op voorhand</strong>{" "}
          wordt de beurt automatisch teruggezet op je kaart.
        </p>
      </div>
    </section>
  );
}