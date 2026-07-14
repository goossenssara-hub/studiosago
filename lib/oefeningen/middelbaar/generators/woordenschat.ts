import { mc, shuffle, type ExerciseInput, type Random } from "./shared";

type WordEntry = {
  word: string;
  meaning: string;
  synonym: string;
  antonym: string;
  sentence: string;
};

const levels: readonly (readonly WordEntry[])[] = [
  [
    { word: "relevant", meaning: "belangrijk voor de vraag of het onderwerp", synonym: "ter zake", antonym: "onbelangrijk", sentence: "Deze informatie is relevant voor ons onderzoek." },
    { word: "concluderen", meaning: "na nadenken tot een besluit komen", synonym: "besluiten", antonym: "twijfelen", sentence: "Uit de resultaten kunnen we concluderen dat de aanpak werkt." },
    { word: "prioriteit", meaning: "iets dat eerst aandacht krijgt", synonym: "voorrang", antonym: "bijzaak", sentence: "De toets van morgen krijgt vandaag prioriteit." },
    { word: "verklaren", meaning: "duidelijk maken waarom iets gebeurt", synonym: "toelichten", antonym: "verzwijgen", sentence: "Kun je verklaren waarom het waterpeil stijgt?" },
    { word: "vergelijken", meaning: "overeenkomsten en verschillen onderzoeken", synonym: "naast elkaar zetten", antonym: "negeren", sentence: "Vergelijk de twee tabellen en noteer het verschil." },
    { word: "samenvatten", meaning: "de belangrijkste informatie kort weergeven", synonym: "beknopt weergeven", antonym: "uitweiden", sentence: "Vat de tekst samen in drie zinnen." },
    { word: "kenmerk", meaning: "eigenschap waaraan je iets herkent", synonym: "eigenschap", antonym: "toeval", sentence: "Een snavel is een kenmerk van vogels." },
    { word: "gevolg", meaning: "wat door een oorzaak ontstaat", synonym: "resultaat", antonym: "oorzaak", sentence: "Vertraging was het gevolg van de storm." },
    { word: "oorzaak", meaning: "reden waardoor iets gebeurt", synonym: "aanleiding", antonym: "gevolg", sentence: "De kapotte kabel was de oorzaak van de storing." },
    { word: "doelgericht", meaning: "met een duidelijk doel voor ogen", synonym: "gericht", antonym: "doelloos", sentence: "Ze werkt doelgericht aan haar planning." },
  ],
  [
    { word: "impliciet", meaning: "niet rechtstreeks gezegd maar wel bedoeld", synonym: "onuitgesproken", antonym: "expliciet", sentence: "De schrijver geeft impliciet kritiek op de maatregel." },
    { word: "illustreren", meaning: "met een voorbeeld verduidelijken", synonym: "toelichten", antonym: "verduisteren", sentence: "De grafiek illustreert de sterke groei." },
    { word: "onderbouwen", meaning: "met redenen of bewijs ondersteunen", synonym: "staven", antonym: "weerleggen", sentence: "Onderbouw je mening met twee argumenten." },
    { word: "expliciet", meaning: "duidelijk en rechtstreeks uitgedrukt", synonym: "uitdrukkelijk", antonym: "impliciet", sentence: "De regel staat expliciet in de opdracht." },
    { word: "argument", meaning: "reden waarmee je een standpunt verdedigt", synonym: "reden", antonym: "tegenwerping", sentence: "Zijn sterkste argument is gebaseerd op cijfers." },
    { word: "chronologisch", meaning: "in volgorde van tijd", synonym: "tijdvolgordelijk", antonym: "willekeurig", sentence: "Zet de gebeurtenissen chronologisch." },
    { word: "objectief", meaning: "gebaseerd op feiten en niet op persoonlijke voorkeur", synonym: "onpartijdig", antonym: "subjectief", sentence: "Een nieuwsbericht hoort zo objectief mogelijk te zijn." },
    { word: "subjectief", meaning: "beïnvloed door persoonlijke gevoelens of voorkeur", synonym: "persoonlijk", antonym: "objectief", sentence: "De recensie is duidelijk subjectief." },
    { word: "essentieel", meaning: "absoluut noodzakelijk of zeer belangrijk", synonym: "onmisbaar", antonym: "overbodig", sentence: "Voldoende slaap is essentieel voor concentratie." },
    { word: "signaleren", meaning: "opmerken en onder de aandacht brengen", synonym: "melden", antonym: "verbergen", sentence: "De leerling signaleert een fout in de tabel." },
  ],
  [
    { word: "nuanceren", meaning: "een uitspraak minder absoluut en preciezer maken", synonym: "verfijnen", antonym: "veralgemenen", sentence: "De onderzoeker nuanceert zijn eerste conclusie." },
    { word: "analyseren", meaning: "in onderdelen en verbanden onderzoeken", synonym: "ontleden", antonym: "oppervlakkig bekijken", sentence: "Analyseer de oorzaken van het probleem." },
    { word: "criterium", meaning: "maatstaf waarmee je iets beoordeelt", synonym: "maatstaf", antonym: "willekeur", sentence: "Duidelijkheid is een belangrijk criterium." },
    { word: "interpreteren", meaning: "betekenis geven aan informatie", synonym: "duiden", antonym: "miskennen", sentence: "Interpreteer de gegevens uit de grafiek." },
    { word: "structuur", meaning: "manier waarop onderdelen geordend zijn", synonym: "opbouw", antonym: "chaos", sentence: "De tekst heeft een duidelijke structuur." },
    { word: "verband", meaning: "relatie tussen twee of meer zaken", synonym: "samenhang", antonym: "losstaandheid", sentence: "Er is een verband tussen slaap en leren." },
    { word: "strategie", meaning: "doordachte aanpak om een doel te bereiken", synonym: "aanpak", antonym: "impuls", sentence: "Deze leesstrategie helpt om kernwoorden te vinden." },
    { word: "formuleren", meaning: "gedachten duidelijk in woorden uitdrukken", synonym: "verwoorden", antonym: "verzwijgen", sentence: "Formuleer je antwoord in een volledige zin." },
    { word: "selecteren", meaning: "bewust kiezen uit meerdere mogelijkheden", synonym: "uitkiezen", antonym: "alles behouden", sentence: "Selecteer alleen de relevante gegevens." },
    { word: "classificeren", meaning: "indelen volgens kenmerken", synonym: "rangschikken", antonym: "vermengen", sentence: "Classificeer de dieren volgens hun leefgebied." },
  ],
  [
    { word: "consistent", meaning: "zonder tegenspraak of sterke afwijking", synonym: "samenhangend", antonym: "tegenstrijdig", sentence: "De resultaten zijn consistent met eerdere metingen." },
    { word: "significant", meaning: "duidelijk betekenisvol of opvallend", synonym: "aanzienlijk", antonym: "verwaarloosbaar", sentence: "Er is een significante stijging in de verkoop." },
    { word: "context", meaning: "omstandigheden die de betekenis beïnvloeden", synonym: "samenhang", antonym: "isolement", sentence: "Bekijk de uitspraak in haar historische context." },
    { word: "perspectief", meaning: "manier waarop iemand naar iets kijkt", synonym: "invalshoek", antonym: "eenzijdigheid", sentence: "De auteur schrijft vanuit een economisch perspectief." },
    { word: "indicatie", meaning: "aanwijzing dat iets mogelijk zo is", synonym: "aanwijzing", antonym: "zekerheid", sentence: "De daling is een indicatie van minder vraag." },
    { word: "afleiden", meaning: "uit bekende informatie een conclusie halen", synonym: "concluderen", antonym: "gissen", sentence: "Uit de bron kun je afleiden dat er onenigheid was." },
    { word: "tegenstrijdig", meaning: "niet met elkaar in overeenstemming", synonym: "inconsistent", antonym: "eensluidend", sentence: "De getuigen leggen tegenstrijdige verklaringen af." },
    { word: "reproduceren", meaning: "opnieuw maken of weergeven", synonym: "herhalen", antonym: "vernieuwen", sentence: "De leerling kan de methode correct reproduceren." },
    { word: "evalueren", meaning: "beoordelen op basis van criteria", synonym: "beoordelen", antonym: "negeren", sentence: "Evalueer de betrouwbaarheid van de bron." },
    { word: "complex", meaning: "samengesteld en niet eenvoudig", synonym: "ingewikkeld", antonym: "eenvoudig", sentence: "Het probleem is complex maar oplosbaar." },
  ],
  [
    { word: "hypothese", meaning: "voorlopige verklaring die je kunt toetsen", synonym: "veronderstelling", antonym: "vaststaand feit", sentence: "De wetenschapper formuleert een hypothese." },
    { word: "variabele", meaning: "kenmerk dat kan veranderen", synonym: "veranderlijke", antonym: "constante", sentence: "Leeftijd is een variabele in dit onderzoek." },
    { word: "correlatie", meaning: "samenhang tussen twee variabelen", synonym: "samenhang", antonym: "onafhankelijkheid", sentence: "Er is correlatie tussen oefentijd en score." },
    { word: "observatie", meaning: "gerichte waarneming", synonym: "waarneming", antonym: "aanname", sentence: "De observatie werd nauwkeurig genoteerd." },
    { word: "experiment", meaning: "proef om een verwachting te onderzoeken", synonym: "proef", antonym: "theorie", sentence: "Het experiment test het effect van licht." },
    { word: "consequentie", meaning: "gevolg van een handeling of beslissing", synonym: "gevolg", antonym: "oorzaak", sentence: "Een consequentie van uitstel is tijdsdruk." },
    { word: "factor", meaning: "element dat invloed heeft op een resultaat", synonym: "invloedsfactor", antonym: "irrelevantie", sentence: "Motivatie is een belangrijke factor." },
    { word: "theoretisch", meaning: "gebaseerd op ideeën en modellen", synonym: "conceptueel", antonym: "praktisch", sentence: "De theoretische uitleg komt voor de oefening." },
    { word: "empirisch", meaning: "gebaseerd op waarneming of ervaring", synonym: "proefondervindelijk", antonym: "speculatief", sentence: "De bewering wordt empirisch onderzocht." },
    { word: "proportioneel", meaning: "in een vaste verhouding toenemend of afnemend", synonym: "evenredig", antonym: "onevenredig", sentence: "De kosten stijgen proportioneel met het aantal deelnemers." },
  ],
  [
    { word: "causaliteit", meaning: "oorzakelijk verband", synonym: "oorzaak-gevolgrelatie", antonym: "toeval", sentence: "Correlatie bewijst geen causaliteit." },
    { word: "representatief", meaning: "kenmerkend voor de grotere groep", synonym: "typisch", antonym: "afwijkend", sentence: "De steekproef moet representatief zijn." },
    { word: "methodologie", meaning: "wijze waarop onderzoek wordt uitgevoerd", synonym: "onderzoeksmethode", antonym: "willekeur", sentence: "De methodologie staat beschreven in het rapport." },
    { word: "steekproef", meaning: "kleinere groep die een populatie vertegenwoordigt", synonym: "selectie", antonym: "volledige populatie", sentence: "De steekproef telt vijfhonderd deelnemers." },
    { word: "generaliseerbaar", meaning: "toepasbaar op een grotere groep", synonym: "veralgemeenbaar", antonym: "uniek", sentence: "De resultaten zijn niet zomaar generaliseerbaar." },
    { word: "procedure", meaning: "vaste reeks stappen", synonym: "werkwijze", antonym: "improvisatie", sentence: "Volg de procedure nauwkeurig." },
    { word: "systematisch", meaning: "volgens een vaste en ordelijke aanpak", synonym: "methodisch", antonym: "willekeurig", sentence: "De gegevens werden systematisch verzameld." },
    { word: "kwantitatief", meaning: "uitgedrukt in aantallen of cijfers", synonym: "numeriek", antonym: "kwalitatief", sentence: "De enquête levert kwantitatieve gegevens." },
    { word: "kwalitatief", meaning: "gericht op kenmerken en ervaringen", synonym: "beschrijvend", antonym: "kwantitatief", sentence: "Interviews leveren kwalitatieve informatie." },
    { word: "populatie", meaning: "volledige groep waarop onderzoek betrekking heeft", synonym: "doelgroep", antonym: "steekproef", sentence: "De populatie bestaat uit alle eerstejaarsleerlingen." },
  ],
  [
    { word: "ambigu", meaning: "voor meerdere uitleg vatbaar", synonym: "dubbelzinnig", antonym: "eenduidig", sentence: "De vraag is ambigu geformuleerd." },
    { word: "paradox", meaning: "schijnbare tegenspraak die toch betekenis kan hebben", synonym: "schijnbare tegenstelling", antonym: "vanzelfsprekendheid", sentence: "Minder keuze kan soms meer vrijheid geven: dat is een paradox." },
    { word: "premisse", meaning: "uitgangspunt van een redenering", synonym: "vooronderstelling", antonym: "conclusie", sentence: "De eerste premisse blijkt onjuist." },
    { word: "inferentie", meaning: "conclusie die uit gegevens wordt afgeleid", synonym: "gevolgtrekking", antonym: "observatie", sentence: "Die inferentie gaat verder dan de bron toelaat." },
    { word: "analogie", meaning: "vergelijking op basis van overeenkomst", synonym: "parallel", antonym: "contrast", sentence: "De docent gebruikt een analogie om het begrip uit te leggen." },
    { word: "retorisch", meaning: "gericht op overtuigend taalgebruik", synonym: "welsprekend", antonym: "neutraal", sentence: "De spreker stelt een retorische vraag." },
    { word: "tegenargument", meaning: "argument dat een standpunt bestrijdt", synonym: "weerwoord", antonym: "ondersteuning", sentence: "Behandel ook het sterkste tegenargument." },
    { word: "deductief", meaning: "redenerend van algemene regel naar geval", synonym: "afleidend", antonym: "inductief", sentence: "De oplossing volgt een deductieve redenering." },
    { word: "inductief", meaning: "redenerend van voorbeelden naar algemene regel", synonym: "veralgemenend", antonym: "deductief", sentence: "De conclusie is inductief opgebouwd." },
    { word: "coherent", meaning: "logisch samenhangend", synonym: "samenhangend", antonym: "onsamenhangend", sentence: "Het betoog is helder en coherent." },
  ],
  [
    { word: "validiteit", meaning: "mate waarin je meet wat je wilt meten", synonym: "geldigheid", antonym: "ongeldigheid", sentence: "De onderzoeker controleert de validiteit van de test." },
    { word: "betrouwbaarheid", meaning: "mate waarin een meting stabiel en herhaalbaar is", synonym: "consistentie", antonym: "onzekerheid", sentence: "De betrouwbaarheid neemt toe bij herhaalde metingen." },
    { word: "bias", meaning: "systematische vertekening", synonym: "vooringenomenheid", antonym: "neutraliteit", sentence: "De vraagstelling kan bias veroorzaken." },
    { word: "confounder", meaning: "storende variabele die een verband beïnvloedt", synonym: "verstorende factor", antonym: "controlevariabele", sentence: "Leeftijd kan hier een confounder zijn." },
    { word: "replicatie", meaning: "herhaling van een onderzoek", synonym: "herhaalonderzoek", antonym: "eenmaligheid", sentence: "Replicatie versterkt het vertrouwen in een resultaat." },
    { word: "transparant", meaning: "duidelijk en controleerbaar", synonym: "inzichtelijk", antonym: "ondoorzichtig", sentence: "De selectieprocedure moet transparant zijn." },
    { word: "robust", meaning: "bestand tegen kleine veranderingen of fouten", synonym: "stevig", antonym: "kwetsbaar", sentence: "De conclusie blijft robust bij een andere berekening." },
    { word: "ethisch", meaning: "in overeenstemming met morele principes", synonym: "verantwoord", antonym: "onethisch", sentence: "De onderzoekers handelen volgens ethische regels." },
    { word: "operationaliseren", meaning: "een abstract begrip meetbaar maken", synonym: "meetbaar definiëren", antonym: "vaag houden", sentence: "De onderzoekers operationaliseren het begrip motivatie." },
    { word: "controlevariabele", meaning: "variabele die constant wordt gehouden", synonym: "constante factor", antonym: "onbeheerste factor", sentence: "Temperatuur fungeert als controlevariabele." },
  ],
  [
    { word: "synthetiseren", meaning: "informatie combineren tot een nieuw geheel", synonym: "samenvoegen", antonym: "opsplitsen", sentence: "Synthetiseer de inzichten uit drie bronnen." },
    { word: "weerleggen", meaning: "aantonen dat een bewering niet standhoudt", synonym: "ontkrachten", antonym: "bevestigen", sentence: "Nieuwe gegevens weerleggen de oude theorie." },
    { word: "extrapoleren", meaning: "een trend buiten bekende gegevens doortrekken", synonym: "doortrekken", antonym: "interpoleren", sentence: "We mogen deze korte trend niet zomaar extrapoleren." },
    { word: "interpoleren", meaning: "een waarde tussen bekende waarden schatten", synonym: "tussenschatten", antonym: "extrapoleren", sentence: "Interpoleer de waarde voor het ontbrekende jaar." },
    { word: "conceptualiseren", meaning: "een begrip theoretisch vormgeven", synonym: "begripsmatig uitwerken", antonym: "concretiseren", sentence: "De auteur conceptualiseert burgerschap als participatie." },
    { word: "discours", meaning: "samenhangende manier van spreken en denken over een onderwerp", synonym: "denkkader", antonym: "stilte", sentence: "Het publieke discours over technologie verandert snel." },
    { word: "normatief", meaning: "gebaseerd op waarden en opvattingen over wat hoort", synonym: "waarderend", antonym: "descriptief", sentence: "De uitspraak is normatief, niet louter feitelijk." },
    { word: "descriptief", meaning: "beschrijvend zonder waardeoordeel", synonym: "beschrijvend", antonym: "normatief", sentence: "Het eerste deel van het rapport is descriptief." },
    { word: "contingent", meaning: "afhankelijk van omstandigheden en niet noodzakelijk", synonym: "voorwaardelijk", antonym: "onvermijdelijk", sentence: "Het succes is contingent op voldoende middelen." },
    { word: "dichotomie", meaning: "indeling in twee tegengestelde delen", synonym: "tweedeling", antonym: "continuüm", sentence: "De tekst stelt een te eenvoudige dichotomie voor." },
  ],
  [
    { word: "epistemisch", meaning: "betrekking hebbend op kennis en zekerheid", synonym: "kennistheoretisch", antonym: "praktisch", sentence: "De bron heeft een andere epistemische status dan een mening." },
    { word: "deterministisch", meaning: "volledig bepaald door voorafgaande factoren", synonym: "vooraf bepaald", antonym: "willekeurig", sentence: "Het model is te deterministisch voor menselijk gedrag." },
    { word: "falsifieerbaar", meaning: "in principe weerlegbaar door bewijs", synonym: "toetsbaar", antonym: "onweerlegbaar", sentence: "Een wetenschappelijke hypothese moet falsifieerbaar zijn." },
    { word: "ontologisch", meaning: "betrekking hebbend op wat bestaat", synonym: "zijnstheoretisch", antonym: "methodologisch", sentence: "De discussie vertrekt vanuit een ontologische vraag." },
    { word: "paradigma", meaning: "algemeen denkkader binnen een vakgebied", synonym: "denkkader", antonym: "uitzondering", sentence: "De ontdekking veranderde het wetenschappelijke paradigma." },
    { word: "heuristiek", meaning: "praktische vuistregel voor probleemoplossing", synonym: "zoekstrategie", antonym: "volledig algoritme", sentence: "Deze heuristiek versnelt het beslissingsproces." },
    { word: "axioma", meaning: "uitgangspunt dat zonder bewijs wordt aangenomen", synonym: "grondstelling", antonym: "afgeleide conclusie", sentence: "Het bewijs vertrekt van een axioma." },
    { word: "probabilistisch", meaning: "gebaseerd op kansen in plaats van zekerheid", synonym: "kansmatig", antonym: "deterministisch", sentence: "De voorspelling is probabilistisch." },
    { word: "dialectisch", meaning: "ontwikkeld door wisselwerking van tegengestelde ideeën", synonym: "tegenstellend", antonym: "eenzijdig", sentence: "Het essay volgt een dialectische opbouw." },
    { word: "reductionistisch", meaning: "een complex geheel verklarend vanuit te weinig onderdelen", synonym: "vereenvoudigend", antonym: "holistisch", sentence: "Die verklaring is volgens de auteur reductionistisch." },
  ],
] as const;

function makeOptions(random: Random, answer: string, distractors: readonly string[]): string[] {
  const unique = Array.from(new Set([answer, ...distractors.filter((item) => item !== answer)]));
  return shuffle(random, unique.slice(0, 4));
}

export function generateWoordenschat(level: number, random: Random): ExerciseInput[] {
  const category = `Woordenschat en schooltaal · niveau ${level}`;
  const entries = levels[Math.max(0, Math.min(levels.length - 1, level - 1))];
  const allMeanings = entries.map((entry) => entry.meaning);
  const allWords = entries.map((entry) => entry.word);
  const exercises: ExerciseInput[] = [];

  entries.forEach((entry, index) => {
    const others = entries.filter((_, otherIndex) => otherIndex !== index);
    const meaningDistractors = shuffle(random, others.map((item) => item.meaning)).slice(0, 3);
    const wordDistractors = shuffle(random, others.map((item) => item.word)).slice(0, 3);
    const synonymDistractors = shuffle(random, others.map((item) => item.synonym)).slice(0, 3);
    const antonymDistractors = shuffle(random, others.map((item) => item.antonym)).slice(0, 3);

    exercises.push(
      mc(category, `Wat betekent “${entry.word}”?`, makeOptions(random, entry.meaning, meaningDistractors), entry.meaning),
      mc(category, `Welk woord past bij deze betekenis: “${entry.meaning}”?`, makeOptions(random, entry.word, wordDistractors), entry.word),
      mc(category, `Wat is het beste synoniem van “${entry.word}”?`, makeOptions(random, entry.synonym, synonymDistractors), entry.synonym),
      mc(category, `Wat is het beste antoniem van “${entry.word}”?`, makeOptions(random, entry.antonym, antonymDistractors), entry.antonym),
      mc(category, `Welke zin gebruikt “${entry.word}” correct?`, makeOptions(random, entry.sentence, [
        `De leerling ${entry.word} gisteren naar school.`,
        `Het boek werd ${entry.word} opgegeten.`,
        `Wij hebben de tafel ${entry.word} gezongen.`,
      ]), entry.sentence)
    );
  });

  exercises.push(
    mc(category, "Welke aanpak helpt het best om de betekenis van een onbekend woord af te leiden?", [
      "Lees de volledige zin en zoek aanwijzingen in de context.",
      "Kijk alleen naar de eerste letter.",
      "Sla het woord altijd over.",
      "Kies automatisch het langste antwoord.",
    ], "Lees de volledige zin en zoek aanwijzingen in de context."),
    mc(category, "Wat is een woordfamilie?", [
      "Een groep woorden met dezelfde stam en verwante betekenis.",
      "Woorden die toevallig even lang zijn.",
      "Alle woorden op dezelfde bladzijde.",
      "Woorden met uitsluitend dezelfde laatste letter.",
    ], "Een groep woorden met dezelfde stam en verwante betekenis."),
    mc(category, "Waarom is context belangrijk bij woordenschat?", [
      "De omringende woorden helpen de bedoelde betekenis bepalen.",
      "Context verandert elk woord in een werkwoord.",
      "Context maakt spelling onbelangrijk.",
      "Context toont alleen de lengte van een woord.",
    ], "De omringende woorden helpen de bedoelde betekenis bepalen.")
  );

  void allMeanings;
  void allWords;
  return shuffle(random, exercises);
}
