import PageShell from "@/components/PageShell";

const sections = [
  { id: "algemeen", title: "Algemene voorwaarden" },
  { id: "privacy", title: "Privacyverklaring" },
  { id: "cookies", title: "Cookiebeleid" },
  { id: "annulering", title: "Retour & annulering" },
  { id: "disclaimer", title: "Disclaimer" },
  { id: "begeleiding", title: "Huiswerkbegeleiding" },
  { id: "workshops", title: "Workshops & kampen" },
  { id: "fotografie", title: "Fotografievoorwaarden" },
  { id: "webshop", title: "Webshopvoorwaarden" },
  { id: "website", title: "Websitevoorwaarden" },
  { id: "beeldmateriaal", title: "Beeldmateriaal & AVG" },
];

export default function AlgemeneVoorwaardenPage() {
  return (
    <PageShell>
      <main className="legal-page">
        <section className="subpage-hero">
          <p className="eyebrow">Juridisch</p>
          <h1>Algemene voorwaarden</h1>
          <p>
            Alle juridische documenten van Studio SaGo en SaGo Photography op
            één overzichtelijke pagina.
          </p>
        </section>

        <section className="legal-hub">
          <aside className="legal-menu">
            <p>Documenten</p>

            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.title}
              </a>
            ))}
          </aside>

          <div className="legal-documents">
            <article id="algemeen" className="legal-card">
              <p className="legal-date">Laatst bijgewerkt: 7 juli 2026</p>
              <h2>Algemene voorwaarden – Studio SaGo</h2>

              <h3>1. Identiteit</h3>
              <p>
                Studio SaGo biedt educatieve diensten, workshops, kampen,
                digitale producten, fysieke producten, tekstcorrectie,
                copywriting en aanverwante diensten aan via www.studiosago.be.
              </p>
              <p>
                Contact: <strong>creativestudiosago@gmail.com</strong>
              </p>

              <h3>2. Toepasselijkheid</h3>
              <p>
                Deze voorwaarden zijn van toepassing op alle offertes,
                reservaties, bestellingen, overeenkomsten en diensten van Studio
                SaGo.
              </p>

              <h3>3. Betaling</h3>
              <p>
                Reservaties en bestellingen zijn pas definitief na ontvangst van
                de volledige betaling.
              </p>

              <h3>4. Aansprakelijkheid</h3>
              <p>
                Studio SaGo levert haar diensten zorgvuldig, maar garandeert geen
                specifieke schoolresultaten, leerwinst of examenresultaten.
              </p>

              <h3>5. Intellectuele eigendom</h3>
              <p>
                Alle teksten, foto&apos;s, cursussen, werkboeken, planners,
                downloads en lesmaterialen blijven eigendom van Studio SaGo.
              </p>

              <h3>6. Belgisch recht</h3>
              <p>
                Op alle overeenkomsten is uitsluitend het Belgisch recht van
                toepassing.
              </p>
            </article>

            <article id="privacy" className="legal-card">
              <h2>Privacyverklaring</h2>
              <p>
                Studio SaGo verwerkt persoonsgegevens overeenkomstig de
                AVG/GDPR-wetgeving.
              </p>

              <h3>Welke gegevens verwerken wij?</h3>
              <ul>
                <li>Naam, e-mailadres, telefoonnummer en adresgegevens</li>
                <li>Gegevens van leerlingen, zoals naam, leerjaar en school</li>
                <li>Boekingsgegevens en betalingsstatus</li>
                <li>Beeldmateriaal indien toestemming werd gegeven</li>
              </ul>

              <h3>Waarom verwerken wij gegevens?</h3>
              <p>
                Voor klantenbeheer, boekingen, betalingen, administratie,
                communicatie, begeleiding, workshops, kampen, fotografie en
                wettelijke verplichtingen.
              </p>

              <h3>Contact</h3>
              <p>
                Vragen over privacy kunnen worden gestuurd naar{" "}
                <strong>creativestudiosago@gmail.com</strong>.
              </p>
            </article>

            <article id="cookies" className="legal-card">
              <h2>Cookiebeleid</h2>
              <p>
                Studio SaGo gebruikt cookies om de website correct te laten
                functioneren, voorkeuren te onthouden en de website te
                verbeteren.
              </p>

              <h3>Soorten cookies</h3>
              <ul>
                <li>Noodzakelijke cookies</li>
                <li>Functionele cookies</li>
                <li>Analytische cookies</li>
                <li>Marketingcookies, enkel na toestemming</li>
              </ul>

              <p>
                Je kunt cookies beheren of verwijderen via de instellingen van je
                browser.
              </p>
            </article>

            <article id="annulering" className="legal-card">
              <h2>Retour- en annuleringsbeleid</h2>

              <h3>Individuele begeleiding</h3>
              <p>
                Kosteloos annuleren kan tot 72 uur vóór de afspraak. Bij
                laattijdige annulering wordt de sessie volledig aangerekend.
              </p>

              <h3>Workshops en kampen</h3>
              <ul>
                <li>Meer dan 30 dagen vooraf: volledige terugbetaling</li>
                <li>Tussen 14 en 30 dagen: 50% terugbetaling</li>
                <li>Minder dan 14 dagen: geen terugbetaling</li>
              </ul>

              <h3>Digitale producten</h3>
              <p>
                Digitale producten kunnen niet worden terugbetaald zodra ze
                geleverd of toegankelijk gemaakt zijn.
              </p>
            </article>

            <article id="disclaimer" className="legal-card">
              <h2>Disclaimer</h2>
              <p>
                De informatie op deze website is algemeen en informatief. Studio
                SaGo doet inspanningen om correcte informatie te publiceren, maar
                kan niet garanderen dat alle informatie altijd volledig,
                foutloos of actueel is.
              </p>

              <p>
                Educatieve tips, downloads of begeleiding vervangen geen
                professioneel medisch, psychologisch of therapeutisch advies.
              </p>
            </article>

            <article id="begeleiding" className="legal-card">
              <h2>Voorwaarden huiswerkbegeleiding & studiecoaching</h2>
              <p>
                Studio SaGo ondersteunt leerlingen bij studievaardigheden,
                planning, leerstrategieën, vakinhoudelijke ondersteuning,
                zelfvertrouwen en zelfstandigheid.
              </p>

              <h3>Belangrijk</h3>
              <ul>
                <li>De leerling brengt het nodige materiaal mee.</li>
                <li>Ouders verstrekken correcte informatie.</li>
                <li>Beurtenkaarten zijn 12 maanden geldig.</li>
                <li>Resultaten kunnen niet gegarandeerd worden.</li>
              </ul>
            </article>

            <article id="workshops" className="legal-card">
              <h2>Voorwaarden workshops, kampen & trajecten</h2>
              <p>
                Inschrijvingen zijn pas definitief na betaling. Ouders bezorgen
                vooraf relevante medische informatie, allergieën of
                ondersteuningsnoden.
              </p>

              <h3>Respect en veiligheid</h3>
              <p>
                Pesten, agressie, discriminatie of grensoverschrijdend gedrag
                worden niet getolereerd en kunnen leiden tot stopzetting van
                deelname.
              </p>
            </article>

            <article id="fotografie" className="legal-card">
              <h2>Fotografievoorwaarden – SaGo Photography</h2>
              <p>
                Deze voorwaarden gelden voor fotosessies via{" "}
                <strong>www.sagophotography.be</strong>.
              </p>
              <p>
                Contact: <strong>studiosagophotography@gmail.com</strong>
              </p>

              <h3>Betaling</h3>
              <p>
                Fotosessies worden volledig vooraf betaald. Een boeking is pas
                definitief na ontvangst van de betaling.
              </p>

              <h3>Annulering</h3>
              <ul>
                <li>Tot 14 dagen vooraf: kosteloos annuleren of verplaatsen</li>
                <li>Tussen 14 dagen en 72 uur: 50% aangerekend</li>
                <li>Minder dan 72 uur: 100% aangerekend</li>
              </ul>

              <h3>Cadeaubonnen</h3>
              <p>
                Cadeaubonnen zijn 12 maanden geldig en niet inwisselbaar voor
                geld. Bij annulering gelden dezelfde voorwaarden.
              </p>

              <h3>Commercieel gebruik bij branding</h3>
              <p>
                Bij een brandingfotoshoot is een niet-exclusieve commerciële
                gebruikslicentie inbegrepen voor de eigen onderneming van de
                klant.
              </p>
            </article>

            <article id="webshop" className="legal-card">
              <h2>Webshopvoorwaarden</h2>
              <p>
                Deze voorwaarden gelden voor aankopen via www.studiosago.be,
                waaronder beurtenkaarten, digitale producten, fysieke producten,
                workshops, kampen en fotografiecadeaubonnen.
              </p>

              <h3>Betaling</h3>
              <p>
                Online betalingen verlopen via Mollie. Studio SaGo bewaart geen
                bankkaartgegevens.
              </p>

              <h3>Herroepingsrecht</h3>
              <p>
                Voor fysieke producten geldt het wettelijke herroepingsrecht van
                14 kalenderdagen, tenzij een wettelijke uitzondering van
                toepassing is.
              </p>
            </article>

            <article id="website" className="legal-card">
              <h2>Gebruiksvoorwaarden website</h2>
              <p>
                Deze voorwaarden gelden voor het gebruik van www.studiosago.be,
                klantaccounts, online boekingen en het dashboard.
              </p>

              <h3>Verboden gebruik</h3>
              <ul>
                <li>De website gebruiken voor onwettige doeleinden</li>
                <li>Beveiligingsmaatregelen omzeilen</li>
                <li>Schadelijke software verspreiden</li>
                <li>Valse of misleidende informatie verstrekken</li>
              </ul>
            </article>

            <article id="beeldmateriaal" className="legal-card">
              <h2>Beeldmateriaal & AVG</h2>
              <p>
                Tijdens activiteiten of fotosessies kunnen foto&apos;s en
                video&apos;s worden gemaakt. Beeldmateriaal wordt enkel gebruikt
                volgens de gegeven toestemming.
              </p>

              <h3>Toestemming kan gelden voor</h3>
              <ul>
                <li>Portfolio</li>
                <li>Website</li>
                <li>Sociale media</li>
                <li>Drukwerk</li>
                <li>Nieuwsbrief</li>
                <li>Betaalde advertenties</li>
              </ul>

              <p>
                Toestemming kan worden ingetrokken voor toekomstig gebruik via{" "}
                <strong>creativestudiosago@gmail.com</strong> of{" "}
                <strong>studiosagophotography@gmail.com</strong>.
              </p>
            </article>
          </div>
        </section>
      </main>
    </PageShell>
  );
}