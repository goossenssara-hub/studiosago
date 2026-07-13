"use client";

import Link from "next/link";

const years = [
  {
    title: "1e middelbaar",
    description: "Wiskunde, Nederlands en leren leren",
    href: "/oefenen/middelbaar/eerste",
    enabled: true,
  },
  {
    title: "2e middelbaar",
    description: "Binnenkort beschikbaar",
    href: "#",
    enabled: false,
  },
  {
    title: "3e middelbaar",
    description: "Binnenkort beschikbaar",
    href: "#",
    enabled: false,
  },
  {
    title: "4e middelbaar",
    description: "Binnenkort beschikbaar",
    href: "#",
    enabled: false,
  },
  {
    title: "5e middelbaar",
    description: "Binnenkort beschikbaar",
    href: "#",
    enabled: false,
  },
  {
    title: "6e middelbaar",
    description: "Binnenkort beschikbaar",
    href: "#",
    enabled: false,
  },
];

export default function MiddelbaarLeerjarenClient() {
  return (
    <main className="oefenpagina">
      <div className="exercise-back">
        <Link className="back-button" href="/oefenen">
          ← Terug naar alle oefeningen
        </Link>
      </div>

      <section className="oefen-hero">
        <p className="eyebrow">Studio SaGo Leerlingportaal</p>
        <h1>Middelbaar onderwijs</h1>
        <p>
          Kies je leerjaar. Het eerste middelbaar is al volledig beschikbaar.
          De andere leerjaren staan klaar voor een latere uitbreiding.
        </p>
      </section>

      <section className="secondary-years-grid">
        {years.map((year, index) =>
          year.enabled ? (
            <Link className="secondary-year-card enabled" href={year.href} key={year.title}>
              <span className="secondary-year-number">{index + 1}</span>
              <div>
                <h2>{year.title}</h2>
                <p>{year.description}</p>
              </div>
              <span className="secondary-year-action">Openen →</span>
            </Link>
          ) : (
            <div className="secondary-year-card disabled" key={year.title}>
              <span className="secondary-year-number">{index + 1}</span>
              <div>
                <h2>{year.title}</h2>
                <p>{year.description}</p>
              </div>
              <span className="secondary-year-action">🔒</span>
            </div>
          )
        )}
      </section>
    </main>
  );
}
