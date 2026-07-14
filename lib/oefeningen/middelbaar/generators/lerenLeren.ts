import { mc, type ExerciseInput, type Random } from "./shared";

type LevelProfile = {
  focus: string;
  questions: ExerciseInput[];
};

function buildCommonQuestions(category: string, level: number): ExerciseInput[] {
  const advanced = level >= 6;

  return [
    mc(
      category,
      "Welke planning is het meest haalbaar?",
      [
        "Concrete blokken van 30–45 minuten met korte pauzes en een duidelijk doel",
        "Vier uur achter elkaar zonder pauze",
        "Beginnen zonder te bepalen wat af moet zijn",
        "Alle vakken tegelijk openen",
      ],
      "Concrete blokken van 30–45 minuten met korte pauzes en een duidelijk doel"
    ),
    mc(
      category,
      "Wat betekent actief ophalen?",
      [
        "De leerstof zonder boek proberen uit te leggen of beantwoorden",
        "Dezelfde pagina meerdere keren herlezen",
        "Zo veel mogelijk markeren",
        "Alle voorbeelden overschrijven",
      ],
      "De leerstof zonder boek proberen uit te leggen of beantwoorden"
    ),
    mc(
      category,
      "Wat doe je het best na een fout antwoord?",
      [
        "Nagaan waarom het fout ging en daarna een gelijkaardige oefening opnieuw maken",
        "Het antwoord wissen en meteen stoppen",
        "Alleen naar de totaalscore kijken",
        "De oefening overslaan zonder ze te bekijken",
      ],
      "Nagaan waarom het fout ging en daarna een gelijkaardige oefening opnieuw maken"
    ),
    mc(
      category,
      "Welke aanpak helpt het meest om leerstof lang te onthouden?",
      [
        "Gespreid herhalen op verschillende dagen",
        "Alles de avond voor de toets leren",
        "Alleen vlak voor het slapen herlezen",
        "Eén keer een lange samenvatting maken",
      ],
      "Gespreid herhalen op verschillende dagen"
    ),
    mc(
      category,
      "Hoe controleer je het betrouwbaarst of je iets kent?",
      [
        "Je legt het zonder hulpmiddelen uit en past het toe in een nieuwe vraag",
        "Je kijkt of de tekst vertrouwd aanvoelt",
        "Je leest de titel nog eens",
        "Je markeert extra woorden",
      ],
      "Je legt het zonder hulpmiddelen uit en past het toe in een nieuwe vraag"
    ),
    mc(
      category,
      "Wat is een goede eerste stap bij een grote taak?",
      [
        "De taak opdelen in kleine, concrete stappen",
        "Wachten tot je veel tijd en motivatie hebt",
        "Eerst alle makkelijke vakken afwerken",
        "De volledige taak in één blok plannen",
      ],
      "De taak opdelen in kleine, concrete stappen"
    ),
    mc(
      category,
      "Welke omgeving ondersteunt concentratie het best?",
      [
        "Een opgeruimde plek met meldingen uit en alleen het nodige materiaal",
        "Een plek met televisie en berichten op de achtergrond",
        "Studeren met meerdere sociale media open",
        "Regelmatig wisselen tussen vijf taken",
      ],
      "Een opgeruimde plek met meldingen uit en alleen het nodige materiaal"
    ),
    mc(
      category,
      "Waarom plan je buffertijd?",
      [
        "Om vertragingen of moeilijkere taken op te vangen",
        "Om alle pauzes te schrappen",
        "Om minder precies te hoeven plannen",
        "Om pas later te beslissen wat je doet",
      ],
      "Om vertragingen of moeilijkere taken op te vangen"
    ),
    mc(
      category,
      "Welke pauze ondersteunt een volgend studieblok het best?",
      [
        "Even bewegen, drinken en daarna op tijd opnieuw beginnen",
        "Een lange reeks filmpjes bekijken",
        "Een nieuw computerspel starten",
        "De pauze zonder einduur laten duren",
      ],
      "Even bewegen, drinken en daarna op tijd opnieuw beginnen"
    ),
    mc(
      category,
      "Wat is een concreet leerdoel?",
      [
        "Ik kan na dit blok vijf begrippen zonder boek uitleggen",
        "Ik ga vanavond veel studeren",
        "Ik wil beter worden",
        "Ik lees iets voor school",
      ],
      "Ik kan na dit blok vijf begrippen zonder boek uitleggen"
    ),
    mc(
      category,
      "Welke volgorde is logisch bij het studeren?",
      [
        "Doel bepalen, actief oefenen, controleren en bijsturen",
        "Markeren, stoppen en hopen dat je het kent",
        "Alles overschrijven en niets controleren",
        "Meteen antwoorden bekijken en daarna de vraag lezen",
      ],
      "Doel bepalen, actief oefenen, controleren en bijsturen"
    ),
    mc(
      category,
      "Wat doe je wanneer een planning structureel niet lukt?",
      [
        "De duur van taken realistischer inschatten en de planning aanpassen",
        "Dezelfde planning blijven herhalen",
        "Alle pauzes verwijderen",
        "Minder belangrijke taken altijd eerst doen",
      ],
      "De duur van taken realistischer inschatten en de planning aanpassen"
    ),
    mc(
      category,
      advanced
        ? "Welke aanpak bevordert transfer naar nieuwe vragen?"
        : "Welke aanpak helpt je om een regel toe te passen?",
      advanced
        ? [
            "Oefenen met wisselende voorbeelden en uitleggen waarom een strategie werkt",
            "Alleen één gekend voorbeeld uit het hoofd leren",
            "Antwoorden kopiëren zonder redenering",
            "Feedback niet opnieuw bekijken",
          ]
        : [
            "De regel gebruiken in verschillende voorbeelden",
            "De regel alleen overschrijven",
            "Eén voorbeeld uit het hoofd leren",
            "De oplossing onmiddellijk bekijken",
          ],
      advanced
        ? "Oefenen met wisselende voorbeelden en uitleggen waarom een strategie werkt"
        : "De regel gebruiken in verschillende voorbeelden"
    ),
    mc(
      category,
      "Wat betekent prioriteiten stellen?",
      [
        "Eerst bepalen wat dringend én belangrijk is",
        "Altijd beginnen met de leukste taak",
        "Alle taken even dringend noemen",
        "Alleen de kortste taak kiezen",
      ],
      "Eerst bepalen wat dringend én belangrijk is"
    ),
    mc(
      category,
      "Welke reflectievraag helpt je het meest na een toets?",
      [
        "Welke aanpak werkte, waar liep ik vast en wat pas ik volgende keer aan?",
        "Welk cijfer hadden mijn vrienden?",
        "Hoe snel kan ik de toets vergeten?",
        "Welke vragen waren volgens mij oneerlijk?",
      ],
      "Welke aanpak werkte, waar liep ik vast en wat pas ik volgende keer aan?"
    ),
  ];
}

const profiles: Record<number, LevelProfile> = {
  1: {
    focus: "eenvoudig plannen en starten",
    questions: [
      mc("", "Je hebt woensdag een taak en vrijdag een toets. Wat plan je vandaag?", ["Een klein deel van de taak en een eerste kort toetsblok", "Niets, want beide deadlines zijn nog niet vandaag", "Alleen je boekentas ordenen", "Alles donderdagavond"], "Een klein deel van de taak en een eerste kort toetsblok"),
      mc("", "Welke taak is het meest concreet?", ["Oefening 1 tot en met 5 maken", "Wiskunde doen", "Veel leren", "Mijn best doen"], "Oefening 1 tot en met 5 maken"),
      mc("", "Je vindt het moeilijk om te beginnen. Wat helpt?", ["Een starttaak van vijf minuten kiezen", "Wachten tot je zin krijgt", "Eerst een uur op je telefoon", "Alle taken tegelijk openen"], "Een starttaak van vijf minuten kiezen"),
      mc("", "Wat leg je vooraf klaar?", ["Alleen het materiaal dat je voor dit studieblok nodig hebt", "Al je schoolboeken", "Speelgoed en snacks", "Meerdere schermen"], "Alleen het materiaal dat je voor dit studieblok nodig hebt"),
      mc("", "Wanneer vink je een taak af?", ["Wanneer de afgesproken stap echt klaar is", "Wanneer je eraan gedacht hebt", "Wanneer je begonnen bent", "Wanneer iemand anders ze maakt"], "Wanneer de afgesproken stap echt klaar is"),
    ],
  },
  2: {
    focus: "taken opdelen en tijd inschatten",
    questions: [
      mc("", "Je moet 24 pagina's in vier dagen leren. Wat is een goede verdeling?", ["Elke dag 6 pagina's leren en kort herhalen", "De eerste drie dagen niets en op dag vier alles", "Elke dag alleen de titels lezen", "De helft overslaan"], "Elke dag 6 pagina's leren en kort herhalen"),
      mc("", "Een taak duurt ongeveer 50 minuten. Hoe plan je ze realistisch?", ["Twee blokken met een korte pauze", "Tien minuten zonder controle", "Drie uur zonder pauze", "Zonder einduur"], "Twee blokken met een korte pauze"),
      mc("", "Wat is een goede deelstap voor een presentatie?", ["Vandaag drie betrouwbare bronnen zoeken", "De presentatie maken", "Alles afwerken", "Iets over het onderwerp doen"], "Vandaag drie betrouwbare bronnen zoeken"),
      mc("", "Je bent vroeger klaar dan gepland. Wat doe je?", ["Kort controleren of alvast een volgende kleine stap uitvoeren", "De rest van de planning schrappen", "Alle volgende taken uitstellen", "Nieuwe meldingen openen"], "Kort controleren of alvast een volgende kleine stap uitvoeren"),
      mc("", "Waarom noteer je een begin- en einduur?", ["Omdat je dan weet wanneer je start en wanneer het blok stopt", "Omdat de taak daardoor vanzelf klaar is", "Om pauzes te vermijden", "Om meer taken tegelijk te doen"], "Omdat je dan weet wanneer je start en wanneer het blok stopt"),
    ],
  },
  3: {
    focus: "actief ophalen en gespreid herhalen",
    questions: [
      mc("", "Je onthoudt weinig na herlezen. Wat verander je?", ["Het boek sluiten en jezelf vragen stellen", "Nog sneller herlezen", "Meer kleuren gebruiken", "Alleen de afbeeldingen bekijken"], "Het boek sluiten en jezelf vragen stellen"),
      mc("", "Welke activiteit is actief ophalen?", ["Een blanco schema uit het hoofd aanvullen", "Een ingevuld schema bekijken", "De tekst onderlijnen", "De leerstof overschrijven"], "Een blanco schema uit het hoofd aanvullen"),
      mc("", "Wanneer herhaal je leerstof het best?", ["Op meerdere momenten met tijd ertussen", "Alleen onmiddellijk na de les", "Eén keer vlak voor de toets", "Pas na de toets"], "Op meerdere momenten met tijd ertussen"),
      mc("", "Wat doe je met flashcards die je fout beantwoordt?", ["Vaker opnieuw aanbieden en de reden van de fout bekijken", "Uit de stapel verwijderen", "Het antwoord erop schrijven zonder te oefenen", "Alle kaarten wegleggen"], "Vaker opnieuw aanbieden en de reden van de fout bekijken"),
      mc("", "Wat is beter dan alleen een samenvatting lezen?", ["De kern zonder samenvatting proberen te reconstrueren", "De samenvatting groter afdrukken", "Meer woorden markeren", "Ze woord voor woord kopiëren"], "De kern zonder samenvatting proberen te reconstrueren"),
    ],
  },
  4: {
    focus: "fouten analyseren en strategie kiezen",
    questions: [
      mc("", "Je maakt steeds dezelfde rekenfout. Wat doe je?", ["De foutstap benoemen en een gelijkaardige oefening opnieuw maken", "Alleen het juiste antwoord bekijken", "Moeilijke oefeningen overslaan", "De uitkomst uit het hoofd leren"], "De foutstap benoemen en een gelijkaardige oefening opnieuw maken"),
      mc("", "Welke foutanalyse is het meest bruikbaar?", ["Ik vergat eerst de haakjes uit te rekenen", "Ik ben slecht in wiskunde", "De oefening was vervelend", "Ik had pech"], "Ik vergat eerst de haakjes uit te rekenen"),
      mc("", "Je begrijpt een tekst niet. Welke strategie past?", ["Per alinea de kernzin zoeken en moeilijke woorden verduidelijken", "De hele tekst zo snel mogelijk herlezen", "Alle woorden markeren", "Alleen de laatste zin lezen"], "Per alinea de kernzin zoeken en moeilijke woorden verduidelijken"),
      mc("", "Wanneer is hulp vragen het meest effectief?", ["Nadat je kunt tonen waar je vastloopt en wat je al probeerde", "Voordat je de vraag gelezen hebt", "Alleen na de deadline", "Wanneer je het antwoord wilt overschrijven"], "Nadat je kunt tonen waar je vastloopt en wat je al probeerde"),
      mc("", "Wat noteer je in een foutenlogboek?", ["Het fouttype, de oorzaak en een betere aanpak", "Alleen het cijfer", "De namen van klasgenoten", "Alle juiste antwoorden"], "Het fouttype, de oorzaak en een betere aanpak"),
    ],
  },
  5: {
    focus: "toetsweek plannen en prioriteiten bepalen",
    questions: [
      mc("", "Je hebt drie toetsen in één week. Wat doe je eerst?", ["Terugplannen vanaf elke toetsdatum en herhaalblokken verdelen", "Alleen voor de eerste toets leren", "Elke avond hetzelfde vak leren", "Wachten op extra uitleg"], "Terugplannen vanaf elke toetsdatum en herhaalblokken verdelen"),
      mc("", "Welke taak krijgt eerst prioriteit?", ["Een moeilijke toets morgen waarvoor je nog niet geoefend hebt", "Een afgewerkte taak versieren", "Een map voor volgende maand ordenen", "Een niet-dringende titelpagina maken"], "Een moeilijke toets morgen waarvoor je nog niet geoefend hebt"),
      mc("", "Waarom wissel je vakken af in een toetsweek?", ["Om concentratie te herstellen en verschillende soorten leerstof gespreid te oefenen", "Om niets af te werken", "Om meer materiaal open te leggen", "Om elke planning te vermijden"], "Om concentratie te herstellen en verschillende soorten leerstof gespreid te oefenen"),
      mc("", "Wat plan je de avond vóór een toets?", ["Een korte actieve herhaling en voldoende slaap", "Alle leerstof voor het eerst", "Een blok zonder einduur", "Alleen markeren tot laat"], "Een korte actieve herhaling en voldoende slaap"),
      mc("", "Je loopt één dag achter. Wat is de beste reactie?", ["De resterende planning herverdelen en het belangrijkste behouden", "Alles schrappen", "De volgende nacht overslaan", "Doen alsof er niets veranderd is"], "De resterende planning herverdelen en het belangrijkste behouden"),
    ],
  },
  6: {
    focus: "toepassen en leerstrategieën per vak",
    questions: [
      mc("", "Je kent definities maar kunt ze niet toepassen. Wat helpt?", ["Nieuwe voorbeelden oplossen en je redenering uitleggen", "De definities nog vaker overschrijven", "Alleen de eerste woorden leren", "Minder oefeningen maken"], "Nieuwe voorbeelden oplossen en je redenering uitleggen"),
      mc("", "Welke aanpak past het best bij woordenschat?", ["Actief ophalen in beide richtingen en woorden in zinnen gebruiken", "Alleen de woorden bekijken", "Alle definities één keer kopiëren", "Alleen alfabetisch ordenen"], "Actief ophalen in beide richtingen en woorden in zinnen gebruiken"),
      mc("", "Welke aanpak past het best bij wiskunde?", ["Gevarieerde oefeningen maken en tussenstappen controleren", "Formules alleen hardop lezen", "Uitwerkingen overschrijven", "Alleen makkelijke voorbeelden maken"], "Gevarieerde oefeningen maken en tussenstappen controleren"),
      mc("", "Welke aanpak past het best bij geschiedenis?", ["Oorzaken, gevolgen, tijdlijn en verbanden actief reconstrueren", "Alle jaartallen zonder context leren", "Alleen afbeeldingen bekijken", "De tekst eenmaal lezen"], "Oorzaken, gevolgen, tijdlijn en verbanden actief reconstrueren"),
      mc("", "Waarom leg je uit waarom een antwoord klopt?", ["Omdat je zo begrip en niet alleen herkenning controleert", "Omdat het antwoord dan automatisch juist wordt", "Omdat je minder hoeft te oefenen", "Omdat feedback overbodig wordt"], "Omdat je zo begrip en niet alleen herkenning controleert"),
    ],
  },
  7: {
    focus: "open vragen, feedback en transfer",
    questions: [
      mc("", "Je scoort goed op meerkeuze maar zwak op open vragen. Wat oefen je?", ["Zelf antwoorden formuleren zonder opties of boek", "Nog meer meerkeuzevragen", "Alle oplossingen markeren", "Alleen definities herkennen"], "Zelf antwoorden formuleren zonder opties of boek"),
      mc("", "Hoe gebruik je feedback het best?", ["De feedback vertalen naar een concrete aanpassing en opnieuw proberen", "Alleen lezen of het juist was", "De feedback bewaren voor later zonder actie", "Alle opmerkingen negeren"], "De feedback vertalen naar een concrete aanpassing en opnieuw proberen"),
      mc("", "Wat is interleaving?", ["Verschillende verwante vraagtypes afwisselen", "Eén vraagtype urenlang herhalen", "Alle vakken door elkaar zonder doel", "Alleen pauzes plannen"], "Verschillende verwante vraagtypes afwisselen"),
      mc("", "Welke oefening toont de meeste transfer?", ["Een nieuw probleem oplossen met een gekende strategie", "Dezelfde voorbeeldzin kopiëren", "Een definitie herkennen", "Een antwoord uit het hoofd herhalen"], "Een nieuw probleem oplossen met een gekende strategie"),
      mc("", "Waarom vergelijk je twee mogelijke oplossingsstrategieën?", ["Om te bepalen wanneer elke strategie efficiënt en correct is", "Om één strategie altijd te vermijden", "Om minder tussenstappen te noteren", "Om het antwoord te raden"], "Om te bepalen wanneer elke strategie efficiënt en correct is"),
    ],
  },
  8: {
    focus: "planning bijsturen en uitstelgedrag aanpakken",
    questions: [
      mc("", "Je planning loopt telkens uit. Wat verander je?", ["Taken kleiner maken, tijd meten en buffertijd toevoegen", "Nog meer taken in hetzelfde blok zetten", "Alle pauzes schrappen", "Geen einduren meer noteren"], "Taken kleiner maken, tijd meten en buffertijd toevoegen"),
      mc("", "Welke aanpak helpt tegen uitstelgedrag?", ["Een duidelijke eerste stap en een korte starttijd afspreken", "Wachten op perfecte motivatie", "Eerst alle makkelijke afleiding afwerken", "De deadline negeren"], "Een duidelijke eerste stap en een korte starttijd afspreken"),
      mc("", "Wat is implementatie-intentie?", ["Een concreet als-dan-plan, bijvoorbeeld: als het 17 uur is, start ik aan mijn eerste blok", "Een vaag voornemen om meer te leren", "Een lijst met cijfers", "Een planning zonder tijdstip"], "Een concreet als-dan-plan, bijvoorbeeld: als het 17 uur is, start ik aan mijn eerste blok"),
      mc("", "Wanneer verklein je een taak verder?", ["Wanneer de stap nog te vaag of te groot voelt om te starten", "Wanneer ze al klaar is", "Alleen na de deadline", "Wanneer de taak leuk is"], "Wanneer de stap nog te vaag of te groot voelt om te starten"),
      mc("", "Wat doe je met afleidende gedachten tijdens een studieblok?", ["Kort noteren en na het blok bekijken", "Meteen elke gedachte uitvoeren", "Het hele blok onderbreken", "Meerdere taken openen"], "Kort noteren en na het blok bekijken"),
    ],
  },
  9: {
    focus: "metacognitie en betrouwbaar zelftesten",
    questions: [
      mc("", "Je denkt dat je iets kent omdat het vertrouwd klinkt. Wat doe je?", ["Jezelf testen zonder hulpmiddelen", "De tekst nog eenmaal bekijken", "Meer markeren", "De pagina fotograferen"], "Jezelf testen zonder hulpmiddelen"),
      mc("", "Wat is een metacognitieve inschatting?", ["Vooraf voorspellen hoe goed je iets beheerst en dit achteraf vergelijken met je resultaat", "Alleen je cijfer noteren", "De planning van iemand anders volgen", "Een samenvatting kopiëren"], "Vooraf voorspellen hoe goed je iets beheerst en dit achteraf vergelijken met je resultaat"),
      mc("", "Wanneer is zelfvertrouwen misleidend?", ["Wanneer herkenning wordt verward met zelfstandig kunnen uitleggen", "Wanneer je meerdere oefenvragen juist beantwoordt", "Wanneer je fouten analyseert", "Wanneer je feedback toepast"], "Wanneer herkenning wordt verward met zelfstandig kunnen uitleggen"),
      mc("", "Hoe verbeter je je inschatting van leerbeheersing?", ["Regelmatig voorspellen, testen en voorspelling met resultaat vergelijken", "Alleen op gevoel vertrouwen", "Moeilijke vragen vermijden", "Altijd dezelfde voorbeelden gebruiken"], "Regelmatig voorspellen, testen en voorspelling met resultaat vergelijken"),
      mc("", "Welke leerling gebruikt monitoring het best?", ["De leerling die tijdens het oefenen controleert wat nog niet lukt en zijn aanpak aanpast", "De leerling die alleen het eindcijfer bekijkt", "De leerling die fouten overslaat", "De leerling die altijd hetzelfde schema volgt"], "De leerling die tijdens het oefenen controleert wat nog niet lukt en zijn aanpak aanpast"),
    ],
  },
  10: {
    focus: "examenstrategie, evalueren en bijsturen",
    questions: [
      mc("", "Je bereidt een grote examenperiode voor. Wat is de beste aanpak?", ["Gespreid oefenen, vakken afwisselen, jezelf toetsen en de planning bijsturen", "Per vak één lange nacht studeren", "Alleen samenvattingen lezen", "De moeilijkste vakken tot het einde uitstellen"], "Gespreid oefenen, vakken afwisselen, jezelf toetsen en de planning bijsturen"),
      mc("", "Welke informatie gebruik je om een examenplanning bij te sturen?", ["Oefenresultaten, resterende leerdoelen, beschikbare tijd en moeilijkheid", "Alleen je oorspronkelijke planning", "Alleen het aantal pagina's", "Alleen je gevoel"], "Oefenresultaten, resterende leerdoelen, beschikbare tijd en moeilijkheid"),
      mc("", "Wat is een goede strategie tijdens een examen?", ["Eerst instructies en puntenverdeling bekijken, tijd verdelen en ruimte voor controle bewaren", "Meteen met de langste vraag starten", "Geen tijd reserveren voor controle", "Alle antwoorden in willekeurige volgorde schrijven"], "Eerst instructies en puntenverdeling bekijken, tijd verdelen en ruimte voor controle bewaren"),
      mc("", "Wat doe je wanneer je tijdens een examen vastloopt?", ["Markeren, voorlopig doorgaan en later met resterende tijd terugkeren", "De rest van het examen stoppen", "Blijven proberen zonder tijd te controleren", "Een willekeurig lang antwoord schrijven"], "Markeren, voorlopig doorgaan en later met resterende tijd terugkeren"),
      mc("", "Welke eindevaluatie leidt het meest tot verbetering?", ["Per vak bepalen welke strategie werkte, welke fouten terugkeerden en wat je concreet verandert", "Alleen het gemiddelde berekenen", "De examens wegleggen", "De planning zonder aanpassing bewaren"], "Per vak bepalen welke strategie werkte, welke fouten terugkeerden en wat je concreet verandert"),
    ],
  },
};

export function generateLerenLeren(
  level: number,
  _random: Random
): ExerciseInput[] {
  const safeLevel = Math.max(1, Math.min(10, Math.round(level || 1)));
  const profile = profiles[safeLevel];
  const category = `Plannen en studeren · niveau ${safeLevel} · ${profile.focus}`;

  const levelQuestions = profile.questions.map((exercise) => ({
    ...exercise,
    category,
  }));

  return [...levelQuestions, ...buildCommonQuestions(category, safeLevel)];
}
