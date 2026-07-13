import Link from "next/link";

/*
  Plaats deze kaart of knop in het onderdeel "Oefenen" van je leerlingendashboard.

  Staat jouw huidige knop al in een array? Gebruik dan minimaal:
  href: "/oefenen/middelbaar"
*/

export default function MiddelbaarOefenenDashboardKnop() {
  return (
    <Link className="dashboard-oefen-card" href="/oefenen/middelbaar">
      <span className="dashboard-oefen-icon">🏔️</span>

      <div>
        <p className="eyebrow">Nieuw</p>
        <h3>Oefenen voor het middelbaar</h3>
        <p>
          Kies het eerste middelbaar en oefen per vak en vaardigheid.
        </p>
      </div>

      <span className="dashboard-oefen-arrow">→</span>
    </Link>
  );
}
