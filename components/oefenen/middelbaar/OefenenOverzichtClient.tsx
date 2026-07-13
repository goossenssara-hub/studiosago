"use client";

import Link from "next/link";

const lager = [
  { title: "4e leerjaar", href: "/oefenen/vierde-leerjaar", enabled: true },
  { title: "5e leerjaar", href: "#", enabled: false },
  { title: "6e leerjaar", href: "/oefenen/zesde-leerjaar", enabled: true },
];

export default function OefenenOverzichtClient() {
  return (
    <main className="oefenen-overzicht-page">
      <section className="oefenpagina">
        <div className="oefen-hero">
          <p className="eyebrow">Studio SaGo Leerlingportaal</p>
          <h1>Kies jouw oefenroute</h1>
          <p>
            Oefen op jouw niveau, verzamel vooruitgang en klim stap voor stap
            naar de top.
          </p>
        </div>

        <section className="leerjaar-section">
          <h2 className="section-title">Lager onderwijs</h2>

          <div className="leerjaar-grid">
            {lager.map((item) =>
              item.enabled ? (
                <Link className="leerjaar-card active" href={item.href} key={item.title}>
                  <span className="year-icon">🎒</span>
                  <h2>{item.title}</h2>
                  <p>Start met oefenen</p>
                </Link>
              ) : (
                <div className="leerjaar-card disabled" key={item.title}>
                  <span className="year-icon">🔒</span>
                  <h2>{item.title}</h2>
                  <p>Binnenkort beschikbaar</p>
                </div>
              )
            )}
          </div>

          <Link className="secundair-card active-secondary" href="/oefenen/middelbaar">
            <span className="year-icon">🏔️</span>
            <h2>Middelbaar onderwijs</h2>
            <p>Bekijk leerjaren, vakken en vaardigheden</p>
          </Link>
        </section>
      </section>
    </main>
  );
}
