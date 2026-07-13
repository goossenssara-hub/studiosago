import Link from "next/link";
import PageShell from "@/components/PageShell";

const options = [
  {
    id: "individual-primary",
    eyebrow: "Lager onderwijs",
    icon: "📘",
    title: "Individuele begeleiding",
    price: "€35",
    unit: "per sessie",
    duration: "60 minuten",
    description:
      "Persoonlijke studie- of huiswerkbegeleiding voor een leerling uit het lager onderwijs.",
    details: [
      "Digitaal of aan huis binnen 15 km rond Peer",
      "Taal, wiskunde, W.O. of leren leren",
      "Eenmalige digitale kennismaking inbegrepen",
    ],
    href: "/afspraak/boeken?type=individual&level=primary",
    className: "teal",
  },
  {
    id: "individual-secondary",
    eyebrow: "Secundair onderwijs",
    icon: "🎓",
    title: "Individuele begeleiding",
    price: "€40",
    unit: "per sessie",
    duration: "60 minuten",
    description:
      "Persoonlijke begeleiding voor leerstof, studiecoaching, planning en executieve functies.",
    details: [
      "Digitaal of aan huis binnen 15 km rond Peer",
      "Nederlands, wetenschappen, geschiedenis, aardrijkskunde, PAV, MAVO en andere vakken op aanvraag",
      "Eenmalige digitale kennismaking inbegrepen",
    ],
    href: "/afspraak/boeken?type=individual&level=secondary",
    className: "navy",
  },
  {
    id: "group-primary",
    eyebrow: "Kleine groep · lager",
    icon: "👥",
    title: "Begeleiding in kleine groep",
    price: "€22",
    unit: "per leerling per uur",
    duration: "60 minuten",
    description:
      "Voor 2 tot 5 leerlingen uit het lager onderwijs met hetzelfde leerdoel.",
    details: [
      "Alle leerling- en oudergegevens worden afzonderlijk ingevuld",
      "Digitaal of aan huis binnen 15 km rond Peer",
      "Alle betrokkenen krijgen toegang tot de digitale kennismaking",
    ],
    href: "/afspraak/boeken?type=group&level=primary",
    className: "green",
  },
  {
    id: "group-secondary",
    eyebrow: "Kleine groep · secundair",
    icon: "🧑‍🤝‍🧑",
    title: "Begeleiding in kleine groep",
    price: "€30",
    unit: "per leerling per uur",
    duration: "60 minuten",
    description:
      "Voor 2 tot 5 leerlingen uit het secundair onderwijs met hetzelfde leerdoel.",
    details: [
      "Leren leren, studiecoaching, executieve functies of vakinhoudelijke begeleiding",
      "Studierichting en school worden per leerling geregistreerd",
      "Alle betrokkenen krijgen toegang tot de digitale kennismaking",
    ],
    href: "/afspraak/boeken?type=group&level=secondary",
    className: "purple",
  },
];

export default function AfspraakPage() {
  return (
    <PageShell>
      <main className="appointment-choice-page">
        <section className="appointment-choice-hero">
          <div className="appointment-choice-copy">
            <p className="eyebrow">Studio SaGo</p>

            <h1>Maak een afspraak</h1>

            <p className="appointment-choice-lead">
              Kies individuele begeleiding of begeleiding in een kleine groep.
              Na de betaling kun je een beschikbaar moment vastleggen.
            </p>

            <div className="appointment-choice-notice">
              <span aria-hidden="true">💻</span>

              <div>
                <strong>Digitale kennismaking inbegrepen</strong>

                <p>
                  Na de aankoop kan éénmalig een gratis digitaal
                  kennismakingsgesprek van 30 minuten worden ingepland.
                  Kennismakingsgesprekken kunnen niet los worden geboekt.
                </p>

                <p>
                  Bij begeleiding in groep ontvangen alle betrokken ouders en
                  deelnemers dezelfde digitale vergaderlink.
                </p>
              </div>
            </div>

            <div className="appointment-choice-quicklinks">
              <Link
                href="/dashboard"
                className="appointment-choice-primary"
              >
                Ik heb al een beurtenkaart
              </Link>

              <Link
                href="/contact"
                className="appointment-choice-secondary"
              >
                Eerst een vraag stellen
              </Link>
            </div>
          </div>

          <aside className="appointment-choice-info">
            <div>
              <span aria-hidden="true">1</span>

              <section>
                <strong>Kies je begeleiding</strong>

                <p>
                  Individueel of met 2 tot 5 leerlingen.
                </p>
              </section>
            </div>

            <div>
              <span aria-hidden="true">2</span>

              <section>
                <strong>Vul alle gegevens in</strong>

                <p>
                  Ook school, leerjaar, studierichting en
                  schoolcontactpersoon.
                </p>
              </section>
            </div>

            <div>
              <span aria-hidden="true">3</span>

              <section>
                <strong>Betaal veilig</strong>

                <p>
                  De afspraak kan pas na een geslaagde betaling worden
                  vastgelegd.
                </p>
              </section>
            </div>

            <div>
              <span aria-hidden="true">4</span>

              <section>
                <strong>Kies je moment</strong>

                <p>
                  De afspraak en eventuele Google Meet-link worden automatisch
                  gekoppeld.
                </p>
              </section>
            </div>
          </aside>
        </section>

        <section className="appointment-choice-section">
          <header className="appointment-choice-heading">
            <p className="eyebrow">Begeleiding</p>

            <h2>Wat wil je boeken?</h2>

            <p>
              Een losse begeleiding duurt 60 minuten. Bij een groep vult iedere
              leerling zijn of haar gegevens in en wordt iedere leerling aan de
              juiste ouder gekoppeld.
            </p>
          </header>

          <div className="appointment-choice-grid">
            {options.map((option) => (
              <article
                key={option.id}
                className={`appointment-choice-card ${option.className}`}
              >
                <div className="appointment-choice-card-top">
                  <span
                    className="appointment-choice-icon"
                    aria-hidden="true"
                  >
                    {option.icon}
                  </span>

                  <span className="appointment-choice-duration">
                    {option.duration}
                  </span>
                </div>

                <p className="appointment-choice-eyebrow">
                  {option.eyebrow}
                </p>

                <h2>{option.title}</h2>

                <div className="appointment-choice-price">
                  <strong>{option.price}</strong>
                  <span>{option.unit}</span>
                </div>

                <p className="appointment-choice-description">
                  {option.description}
                </p>

                <ul>
                  {option.details.map((detail) => (
                    <li key={detail}>
                      <span aria-hidden="true">✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>

                <Link
                  href={option.href}
                  className="appointment-choice-button"
                >
                  Gegevens invullen
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="appointment-choice-footer-card">
          <span
            className="appointment-choice-footer-icon"
            aria-hidden="true"
          >
            🎟️
          </span>

          <div>
            <strong>Al een 10-beurtenkaart?</strong>

            <p>
              Gebruik dan niet de losse betaalflow. Plan rechtstreeks via je
              actieve beurtenkaart in het klantendashboard.
            </p>
          </div>

          <Link href="/dashboard">
            Naar mijn dashboard
          </Link>
        </section>
      </main>
    </PageShell>
  );
}