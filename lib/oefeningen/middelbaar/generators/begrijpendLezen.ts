import { mc, type ExerciseInput, type Random } from "./shared";

type ReadingText = {
  title: string;
  text: string;
  mainIdea: string;
  purpose: string;
  structure: string;
};

const textsByLevel: readonly (readonly ReadingText[])[] = [
  [
    {
      title: `Smartphones op school`,
      text: `Steeds meer scholen spreken af dat smartphones tijdens de lessen in een afgesloten kast blijven. Leerkrachten merken daardoor minder onderbrekingen en meer aandacht. Sommige leerlingen vinden de regel streng, maar anderen ervaren meer rust. De school organiseert daarom ook lessen over bewust mediagebruik.`,
      mainIdea: `Een smartphonebeleid kan de rust vergroten, maar mediawijsheid blijft nodig.`,
      purpose: `informeren en nuanceren`,
      structure: `oorzaak-gevolg`,
    },
    {
      title: `De schooltuin`,
      text: `Leerlingen vernieuwen samen met buurtbewoners de schooltuin. Ze plaatsen plantenbakken, maken een composthoek en kiezen planten die bijen aantrekken. De tuin wordt niet alleen mooier, maar dient ook als leerplek voor biologie en techniek.`,
      mainIdea: `De vernieuwde schooltuin combineert natuur, samenwerking en leren.`,
      purpose: `informeren`,
      structure: `opsomming`,
    },
    {
      title: `Veilig fietsen`,
      text: `De gemeente legt een nieuwe fietsroute aan tussen drie dorpen. De route vermijdt drukke kruispunten en krijgt extra verlichting. Toch vragen ouders ook toezicht bij de gevaarlijkste oversteekplaats.`,
      mainIdea: `De fietsroute wordt veiliger, maar één knelpunt vraagt extra aandacht.`,
      purpose: `informeren`,
      structure: `probleem-oplossing`,
    },
  ],
  [
    {
      title: `Bomen tegen hitte`,
      text: `Steden planten extra bomen om hitte te beperken. Bomen geven schaduw en verdampen water, waardoor straten lokaal afkoelen. Deze aanpak vraagt wel ruimte, onderhoud en voldoende water tijdens droge periodes.`,
      mainIdea: `Bomen helpen tegen hitte, maar de aanpak heeft praktische voorwaarden.`,
      purpose: `informeren en nuanceren`,
      structure: `oorzaak-gevolg`,
    },
    {
      title: `Gespreid leren`,
      text: `Een klas testte twee manieren van studeren. De ene groep leerde alles op één avond, de andere groep verdeelde dezelfde leerstof over vier dagen. Een week later onthield de tweede groep duidelijk meer.`,
      mainIdea: `Gespreid leren leidt in deze test tot beter onthouden.`,
      purpose: `informeren`,
      structure: `vergelijking`,
    },
    {
      title: `Afval op school`,
      text: `De school vervangt wegwerpbekers door herbruikbare drinkflessen. Daardoor daalt de hoeveelheid afval, maar leerlingen moeten hun fles zelf meenemen en reinigen. Na een maand blijkt de afvalbak in de refter veel minder snel vol.`,
      mainIdea: `Herbruikbare flessen verminderen afval, mits leerlingen verantwoordelijkheid nemen.`,
      purpose: `informeren`,
      structure: `oorzaak-gevolg`,
    },
  ],
  [
    {
      title: `Betrouwbare bronnen`,
      text: `Online informatie verspreidt zich snel, maar niet elke bron is betrouwbaar. Wie auteur, datum, bedoeling en bewijs controleert, verkleint de kans om misleidende berichten te geloven. Ook vergelijken met andere bronnen is belangrijk.`,
      mainIdea: `Bronnen controleren en vergelijken helpt misleiding voorkomen.`,
      purpose: `instrueren en informeren`,
      structure: `probleem-oplossing`,
    },
    {
      title: `Openbaar vervoer`,
      text: `Openbaar vervoer kan files en uitstoot verminderen. Het effect blijft beperkt wanneer verbindingen onregelmatig zijn of overstappen te lang duren. Betrouwbaarheid is daarom minstens even belangrijk als een lage prijs.`,
      mainIdea: `Goed openbaar vervoer moet betrouwbaar én betaalbaar zijn.`,
      purpose: `informeren en nuanceren`,
      structure: `argumentatie`,
    },
    {
      title: `Bewegen en concentratie`,
      text: `Onderzoekers lieten leerlingen twintig minuten wandelen voor een moeilijke taak. Gemiddeld werkten zij daarna aandachtiger dan leerlingen die bleven zitten. De onderzoekers waarschuwen wel dat één kleine test geen definitief bewijs levert.`,
      mainIdea: `Bewegen lijkt concentratie te helpen, maar meer onderzoek is nodig.`,
      purpose: `informeren en nuanceren`,
      structure: `onderzoek-resultaat`,
    },
  ],
  [
    {
      title: `Digitale middelen`,
      text: `Digitale middelen kunnen het leren ondersteunen, bijvoorbeeld met directe feedback. Onbeperkt gebruik leidt echter vaak tot afleiding. Een verbod alleen volstaat niet: leerlingen moeten leren wanneer technologie nuttig is.`,
      mainIdea: `Technologie helpt vooral bij doelgericht en bewust gebruik.`,
      purpose: `informeren en overtuigen`,
      structure: `voor- en nadeel`,
    },
    {
      title: `Water besparen`,
      text: `Een sporthal installeert zuinige douchekoppen en sensoren. Het waterverbruik daalt, maar de investering is niet meteen terugverdiend. De beheerder verwacht dat de besparing na enkele jaren groter wordt dan de kosten.`,
      mainIdea: `Waterbesparing vraagt eerst investering en levert later voordeel op.`,
      purpose: `informeren`,
      structure: `tijd-volgorde`,
    },
    {
      title: `Groepswerk`,
      text: `Groepswerk kan leerlingen leren overleggen en taken verdelen. Toch ontstaat soms ongelijkheid wanneer één leerling bijna alles uitvoert. Duidelijke rollen en tussentijdse controles kunnen dat probleem beperken.`,
      mainIdea: `Groepswerk werkt beter met duidelijke rollen en opvolging.`,
      purpose: `informeren en adviseren`,
      structure: `probleem-oplossing`,
    },
  ],
  [
    {
      title: `Wetenschappelijk bewijs`,
      text: `Wetenschappers waarschuwen dat één onderzoek zelden een definitief antwoord geeft. Resultaten moeten worden herhaald, gecontroleerd en vergeleken. Pas wanneer verschillende studies ongeveer dezelfde richting tonen, wordt een conclusie sterker.`,
      mainIdea: `Sterke wetenschappelijke conclusies steunen op herhaald en vergelijkend onderzoek.`,
      purpose: `informeren`,
      structure: `stappenplan`,
    },
    {
      title: `Prijs of kwaliteit`,
      text: `Een school vergelijkt drie laptops. Het goedkoopste model heeft een zwakke batterij, terwijl het duurste model functies bevat die leerlingen nauwelijks gebruiken. De school kiest uiteindelijk het middelste model, omdat prijs en bruikbaarheid daar het best in evenwicht zijn.`,
      mainIdea: `De beste keuze is niet altijd de goedkoopste of duurste, maar de meest passende.`,
      purpose: `informeren en verklaren`,
      structure: `vergelijking`,
    },
    {
      title: `Voedselverspilling`,
      text: `Een supermarkt verkoopt producten met een korte houdbaarheidsdatum aan een lagere prijs. Daardoor wordt minder voedsel weggegooid. Toch moeten klanten goed controleren wanneer ze het product willen gebruiken.`,
      mainIdea: `Korting op bijna vervallen producten vermindert verspilling, maar vraagt planning.`,
      purpose: `informeren`,
      structure: `oorzaak-gevolg`,
    },
  ],
  [
    {
      title: `Argumenten beoordelen`,
      text: `Een overtuigende tekst gebruikt argumenten, voorbeelden en betrouwbare bronnen. Toch kan dezelfde informatie anders worden voorgesteld door bepaalde cijfers te benadrukken en andere weg te laten. Kritische lezers letten daarom ook op selectie en formulering.`,
      mainIdea: `Een tekst kan overtuigend lijken door selectieve presentatie; kritisch lezen blijft nodig.`,
      purpose: `informeren en waarschuwen`,
      structure: `argumentatie`,
    },
    {
      title: `AI in het onderwijs`,
      text: `Artificiële intelligentie kan feedback versnellen en oefeningen aanpassen aan het niveau van een leerling. Tegelijk roept het vragen op over privacy, auteurschap en zelfstandig denken. Scholen zoeken regels die innovatie toelaten zonder verantwoordelijkheid te verliezen.`,
      mainIdea: `AI biedt onderwijskansen, maar vereist duidelijke en verantwoordelijke afspraken.`,
      purpose: `informeren en nuanceren`,
      structure: `voor- en nadeel`,
    },
    {
      title: `Toerisme in natuurgebieden`,
      text: `Toerisme levert inkomsten op voor natuurgebieden, maar veel bezoekers kunnen planten en dieren verstoren. Beheerders werken daarom met vaste wandelpaden, bezoekerslimieten en informatiecampagnes.`,
      mainIdea: `Natuurtoerisme vraagt maatregelen die inkomsten en bescherming combineren.`,
      purpose: `informeren`,
      structure: `probleem-oplossing`,
    },
  ],
  [
    {
      title: `Gemiddelden`,
      text: `Gemiddelden kunnen verschillen tussen groepen verbergen. Een maatregel kan gemiddeld positief lijken, terwijl een specifieke groep erop achteruitgaat. Wie alleen naar het gemiddelde kijkt, mist dus mogelijk belangrijke ongelijkheid.`,
      mainIdea: `Gemiddelden geven niet altijd zicht op verschillen en ongelijkheid.`,
      purpose: `informeren en waarschuwen`,
      structure: `stelling-uitleg`,
    },
    {
      title: `Historische bronnen`,
      text: `Historische bronnen geven nooit een volledig neutraal beeld. Ze zijn gemaakt vanuit een bepaalde positie, met een doel en voor een publiek. Kritisch bronnenonderzoek vergelijkt daarom meerdere perspectieven.`,
      mainIdea: `Historische bronnen moeten vanuit hun context en naast andere perspectieven worden gelezen.`,
      purpose: `informeren`,
      structure: `redenering`,
    },
    {
      title: `Slaap en prestaties`,
      text: `Verschillende studies vinden een verband tussen voldoende slaap en betere schoolprestaties. Dat betekent niet automatisch dat extra slaap rechtstreeks hogere cijfers veroorzaakt. Ook stress, gezondheid en thuissituatie kunnen invloed hebben.`,
      mainIdea: `Een verband tussen slaap en prestaties bewijst nog geen rechtstreeks oorzakelijk effect.`,
      purpose: `informeren en nuanceren`,
      structure: `oorzaak versus samenhang`,
    },
  ],
  [
    {
      title: `Privacy en apps`,
      text: `Veel gratis apps verzamelen gegevens over locatie, gebruik en voorkeuren. Gebruikers geven daar vaak toestemming voor zonder de voorwaarden te lezen. Transparante instellingen helpen, maar ook bedrijven en wetgevers dragen verantwoordelijkheid.`,
      mainIdea: `Digitale privacy is een gedeelde verantwoordelijkheid van gebruikers, bedrijven en overheid.`,
      purpose: `informeren en overtuigen`,
      structure: `verdeling van verantwoordelijkheid`,
    },
    {
      title: `Klimaatbeleid`,
      text: `Klimaatmaatregelen hebben vaak verschillende effecten op bevolkingsgroepen. Een belasting kan gemiddeld uitstoot verminderen, maar huishoudens met een laag inkomen relatief zwaar treffen. Compensatie kan het beleid eerlijker maken zonder het doel los te laten.`,
      mainIdea: `Doeltreffend klimaatbeleid moet ook rekening houden met sociale rechtvaardigheid.`,
      purpose: `informeren en nuanceren`,
      structure: `probleem-oplossing`,
    },
    {
      title: `Onderzoeksvragen`,
      text: `Een goede onderzoeksvraag is duidelijk, afgebakend en onderzoekbaar. Een te brede vraag levert vaak oppervlakkige antwoorden op, terwijl een extreem smalle vraag weinig betekenis heeft. De juiste afbakening hangt af van tijd, bronnen en doel.`,
      mainIdea: `Een bruikbare onderzoeksvraag zoekt evenwicht tussen breedte, haalbaarheid en relevantie.`,
      purpose: `informeren en adviseren`,
      structure: `vergelijking`,
    },
  ],
  [
    {
      title: `Algoritmes`,
      text: `Algoritmes bepalen mede welke berichten, filmpjes en advertenties mensen zien. Ze voorspellen voorkeuren op basis van eerder gedrag, maar kunnen daardoor bestaande interesses en vooroordelen versterken. Meer keuze lijkt beschikbaar, terwijl het zicht op andere perspectieven juist kleiner kan worden.`,
      mainIdea: `Personalisatie door algoritmes kan de blik vernauwen en vooroordelen versterken.`,
      purpose: `informeren en waarschuwen`,
      structure: `paradox`,
    },
    {
      title: `Representatief onderzoek`,
      text: `Een enquête onder honderd vrijwilligers kan interessante aanwijzingen geven, maar is niet automatisch representatief voor alle jongeren. Mensen die vrijwillig deelnemen verschillen mogelijk van mensen die niet reageren. De manier van werven beïnvloedt dus de conclusie.`,
      mainIdea: `De steekproef en werving bepalen hoe ver onderzoeksresultaten mogen worden veralgemeend.`,
      purpose: `informeren`,
      structure: `voorwaarde-conclusie`,
    },
    {
      title: `Economische groei`,
      text: `Economische groei wordt vaak voorgesteld als teken van vooruitgang. Toch zegt groei alleen weinig over verdeling, welzijn of milieuschade. Daarom gebruiken sommige onderzoekers aanvullende indicatoren naast het bruto binnenlands product.`,
      mainIdea: `Economische groei alleen volstaat niet om brede vooruitgang te meten.`,
      purpose: `informeren en nuanceren`,
      structure: `stelling-tegenargument`,
    },
  ],
  [
    {
      title: `Kennis en onzekerheid`,
      text: `Wetenschappelijke kennis is niet zwak omdat ze kan veranderen. Nieuwe gegevens kunnen eerdere verklaringen verfijnen of vervangen. Juist die bereidheid tot correctie maakt wetenschap betrouwbaar, zolang onzekerheid eerlijk wordt benoemd.`,
      mainIdea: `De mogelijkheid tot bijsturing is een sterkte van wetenschap, geen tekortkoming.`,
      purpose: `informeren en overtuigen`,
      structure: `paradox`,
    },
    {
      title: `Historische synthese`,
      text: `Een historische synthese combineert bronnen zonder hun verschillen weg te poetsen. De schrijver moet aangeven waar bronnen elkaar ondersteunen, tegenspreken of stiltes laten. Een overtuigende synthese maakt dus ook onzekerheid zichtbaar.`,
      mainIdea: `Een sterke historische synthese verbindt perspectieven en benoemt tegenstrijdigheid en onzekerheid.`,
      purpose: `informeren en instrueren`,
      structure: `vergelijking en synthese`,
    },
    {
      title: `Technologische vooruitgang`,
      text: `Technologische vooruitgang wordt soms voorgesteld als onvermijdelijk. Toch bepalen keuzes van ontwerpers, bedrijven, overheden en gebruikers welke toepassingen worden ontwikkeld en wie ervan profiteert. Technologie verandert de samenleving, maar wordt ook door die samenleving gevormd.`,
      mainIdea: `Technologische ontwikkeling is geen autonoom proces, maar ontstaat door maatschappelijke keuzes.`,
      purpose: `informeren en nuanceren`,
      structure: `wederzijdse beïnvloeding`,
    },
  ],
] as const;

function questionsForText(category: string, item: ReadingText): ExerciseInput[] {
  const source = `${item.title}\n\n${item.text}`;
  const sentences = item.text.split(". ").map((sentence) =>
    sentence.endsWith(".") ? sentence : `${sentence}.`
  );
  return [
    mc(category, `${source}\n\nWat is de hoofdgedachte?`, [
      item.mainIdea,
      "De tekst geeft alleen losse details zonder centraal onderwerp.",
      "De tekst wil uitsluitend vermaken met een verzonnen verhaal.",
      "De titel is belangrijker dan alle informatie in de tekst.",
    ], item.mainIdea),
    mc(category, `${source}\n\nWat is het belangrijkste tekstdoel?`, [
      item.purpose,
      "uitsluitend ontspannen",
      "een product verkopen",
      "een recept stap voor stap uitleggen",
    ], item.purpose),
    mc(category, `${source}\n\nWelke tekststructuur staat het meest centraal?`, [
      item.structure,
      "alfabetische ordening",
      "een dialoog zonder conclusie",
      "een willekeurige opsomming zonder verband",
    ], item.structure),
    {
      category,
      question: `${source}\n\nNoteer een zin uit de tekst die de hoofdgedachte ondersteunt.`,
      answer: sentences,
    },
    mc(category, `${source}\n\nWelke conclusie is het best onderbouwd?`, [
      item.mainIdea,
      "Eén detail bewijst dat er nooit uitzonderingen bestaan.",
      "De tekst toont dat alle betrokkenen exact dezelfde mening hebben.",
      "Uit de tekst kan geen enkele redelijke conclusie worden getrokken.",
    ], item.mainIdea),
  ];
}

export function generateBegrijpendLezen(
  level: number,
  _random: Random
): ExerciseInput[] {
  const safeLevel = Math.max(1, Math.min(10, Math.round(level || 1)));
  const category = `Begrijpend lezen · niveau ${safeLevel}`;
  const items = textsByLevel[safeLevel - 1];

  return items.flatMap((item) => questionsForText(category, item));
}
