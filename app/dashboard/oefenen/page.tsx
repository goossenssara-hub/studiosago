import Link from "next/link";
import PageShell from "@/components/PageShell";

const leerjaren = [
  {
    title: "1e leerjaar",
    href: "",
    available: false,
  },
  {
    title: "2e leerjaar",
    href: "",
    available: false,
  },
  {
    title: "3e leerjaar",
    href: "",
    available: false,
  },
  {
    title: "4e leerjaar",
    href: "/dashboard/oefenen/vierde-leerjaar",
    available: true,
  },
  {
    title: "5e leerjaar",
    href: "",
    available: false,
  },
  {
    title: "6e leerjaar",
    href: "/dashboard/oefenen/zesde-leerjaar",
    available: true,
  },
];

export default function OefenenPage() {
  return (
    <PageShell>
      <main className="oefenen-overzicht-page">
        <section className="subpage-hero">
          <p className="eyebrow">Studio SaGo</p>

          <h1>Oefenplatform</h1>

          <p>
            Kies hieronder jouw leerjaar en ga aan de slag met taal,
            wiskunde en Frans.
          </p>
        </section>

        <section className="leerjaar-section">
          <div className="leerjaar-grid">
            {leerjaren.map((item) =>
              item.available ? (
                <Link
                  key={item.title}
                  href={item.href}
                  className="leerjaar-card active"
                >
                  <h2>{item.title}</h2>

                  <p>Open oefeningen</p>
                </Link>
              ) : (
                <div
                  key={item.title}
                  className="leerjaar-card disabled"
                >
                  <h2>{item.title}</h2>

                  <p>Binnenkort beschikbaar</p>
                </div>
              )
            )}
          </div>

<Link
  href="/oefenen/middelbaar"
  className="secundair-card active-secondary"
>
  <span>Secundair onderwijs</span>
  <small>Bekijk leerjaren, vakken en vaardigheden</small>
</Link>
        </section>
      </main>
    </PageShell>
  );
}