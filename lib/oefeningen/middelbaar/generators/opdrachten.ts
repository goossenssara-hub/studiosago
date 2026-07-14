import { mc, shuffle, type ExerciseInput, type Random } from "./shared";

type InstructionProfile = {
  verb: string;
  meaning: string;
  expected: string;
  weakAnswer: string;
  strongAnswer: string;
};

const profiles: readonly InstructionProfile[] = [
  {
    verb: "noem",
    meaning: "geef kort de gevraagde elementen zonder uitgebreide uitleg",
    expected: "een beknopte opsomming",
    weakAnswer: "een lang verhaal zonder duidelijke elementen",
    strongAnswer: "Drie oorzaken zijn tijdsdruk, onduidelijke afspraken en materiaaltekort.",
  },
  {
    verb: "beschrijf",
    meaning: "vertel nauwkeurig wat je waarneemt of weet",
    expected: "kenmerken en relevante details",
    weakAnswer: "alleen een persoonlijk oordeel",
    strongAnswer: "De grafiek stijgt geleidelijk van januari tot april en daalt daarna licht.",
  },
  {
    verb: "verklaar",
    meaning: "geef oorzaken of redenen en leg het verband uit",
    expected: "een oorzaak met een logisch gevolg",
    weakAnswer: "alleen de uitkomst noemen",
    strongAnswer: "De temperatuur daalt doordat bomen schaduw geven en water verdampen.",
  },
  {
    verb: "vergelijk",
    meaning: "zoek relevante overeenkomsten en verschillen",
    expected: "minstens één overeenkomst en één verschil",
    weakAnswer: "slechts één bron samenvatten",
    strongAnswer: "Beide plannen verlagen uitstoot, maar plan A is goedkoper en plan B werkt sneller.",
  },
  {
    verb: "analyseer",
    meaning: "onderzoek onderdelen, patronen en onderlinge verbanden",
    expected: "onderdelen, verbanden en betekenis",
    weakAnswer: "de tekst letterlijk overschrijven",
    strongAnswer: "De stijging hangt vooral samen met prijsdaling; na de prijsverhoging vlakt de groei af.",
  },
  {
    verb: "beargumenteer",
    meaning: "neem een standpunt in en ondersteun het met redenen en bewijs",
    expected: "standpunt, argumenten en bewijs",
    weakAnswer: "alleen schrijven dat je iets goed of slecht vindt",
    strongAnswer: "Ik steun het voorstel, omdat de proefresultaten verbeteren en de afleiding meetbaar daalt.",
  },
  {
    verb: "beoordeel",
    meaning: "weeg informatie af aan de hand van criteria en geef een oordeel",
    expected: "criteria, afweging en onderbouwd oordeel",
    weakAnswer: "een oordeel zonder maatstaf",
    strongAnswer: "Volgens de criteria kostprijs, bereik en haalbaarheid is plan B het meest geschikt.",
  },
  {
    verb: "evalueer",
    meaning: "bespreek sterke en zwakke punten en formuleer een besluit",
    expected: "pluspunten, beperkingen en conclusie",
    weakAnswer: "alleen voordelen opsommen",
    strongAnswer: "De aanpak is snel en betaalbaar, maar bereikt weinig leerlingen; daarom is bijsturing nodig.",
  },
  {
    verb: "synthetiseer",
    meaning: "combineer informatie uit meerdere bronnen tot één samenhangend geheel",
    expected: "geïntegreerde informatie uit verschillende bronnen",
    weakAnswer: "de bronnen afzonderlijk navertellen",
    strongAnswer: "Samen tonen de bronnen dat de maatregel werkt wanneer begeleiding en duidelijke regels samengaan.",
  },
  {
    verb: "reflecteer",
    meaning: "koppel ervaring en inzicht aan wat je een volgende keer kunt verbeteren",
    expected: "ervaring, inzicht en concrete bijsturing",
    weakAnswer: "alleen vertellen of iets leuk was",
    strongAnswer: "Ik begon te laat, waardoor ik gehaast werkte; volgende keer plan ik twee controlemomenten.",
  },
] as const;

const contexts = [
  "een tabel over energieverbruik",
  "een tekst over smartphonegebruik op school",
  "twee grafieken over vervoerskeuzes",
  "een experiment met plantengroei",
  "een artikel over sociale media",
  "een verslag van een klasproject",
] as const;

function buildLevelExercises(
  level: number,
  random: Random
): ExerciseInput[] {
  const category = `Opdrachten begrijpen · niveau ${level}`;
  const current = profiles[level - 1];
  const previous = profiles[Math.max(0, level - 2)];
  const next = profiles[Math.min(profiles.length - 1, level)];
  const context = contexts[(level - 1) % contexts.length];

  const exercises: ExerciseInput[] = [
    mc(
      category,
      `Wat moet je doen bij het instructiewoord “${current.verb}”?`,
      [
        current.meaning,
        "de volledige vraag overschrijven",
        "alleen losse cijfers noteren",
        "zonder de bron te lezen antwoorden",
      ],
      current.meaning
    ),
    mc(
      category,
      `Welke antwoordvorm past het best bij “${current.verb}”?`,
      [
        current.expected,
        current.weakAnswer,
        "een willekeurig voorbeeld zonder verband",
        "alleen de titel van de bron",
      ],
      current.expected
    ),
    mc(
      category,
      `Welke leerling voert de opdracht “${current.verb} de resultaten” het best uit?`,
      [
        current.strongAnswer,
        current.weakAnswer,
        "Ik heb de vraag opnieuw opgeschreven.",
        "Ik weet het niet, maar dit lijkt mij juist.",
      ],
      current.strongAnswer
    ),
    mc(
      category,
      `Waarom is dit antwoord onvoldoende bij “${current.verb}”: “${current.weakAnswer}”?`,
      [
        `Omdat de opdracht ${current.expected} vraagt.`,
        "Omdat elk antwoord exact tien regels moet tellen.",
        "Omdat je nooit volledige zinnen mag gebruiken.",
        "Omdat de bron niet in alfabetische volgorde staat.",
      ],
      `Omdat de opdracht ${current.expected} vraagt.`
    ),
    mc(
      category,
      `Welke opdracht past het best bij ${context}?`,
      [
        `${current.verb} de belangrijkste informatie en gebruik de bron.`,
        "Kopieer de eerste zin zonder de rest te lezen.",
        "Geef een antwoord dat niet naar de bron verwijst.",
        "Schrijf alles op wat je over het onderwerp weet.",
      ],
      `${current.verb} de belangrijkste informatie en gebruik de bron.`
    ),
    mc(
      category,
      "Wat doe je het best vóór je begint te antwoorden?",
      [
        "Markeer het instructiewoord, de bron, de gegevens en wat precies gevraagd wordt.",
        "Begin meteen te schrijven zonder de hele vraag te lezen.",
        "Tel alle getallen op, ongeacht de opdracht.",
        "Lees alleen de titel en gok de bedoeling.",
      ],
      "Markeer het instructiewoord, de bron, de gegevens en wat precies gevraagd wordt."
    ),
    mc(
      category,
      "In de opdracht staat: “Gebruik bron 2 en geef twee redenen.” Wat moet zeker in je antwoord staan?",
      [
        "Twee redenen die aantoonbaar uit bron 2 komen.",
        "Eén reden uit je eigen ervaring.",
        "Alle informatie uit alle bronnen.",
        "Alleen een ja- of nee-antwoord.",
      ],
      "Twee redenen die aantoonbaar uit bron 2 komen."
    ),
    mc(
      category,
      "Wat betekent “motiveer je antwoord”?",
      [
        "Geef redenen of bewijs die je antwoord ondersteunen.",
        "Herhaal je antwoord drie keer.",
        "Schrijf alleen ja of nee.",
        "Laat voorbeelden en argumenten weg.",
      ],
      "Geef redenen of bewijs die je antwoord ondersteunen."
    ),
    mc(
      category,
      "Wat betekent “toon aan met gegevens uit de tabel”?",
      [
        "Verwijs naar concrete waarden uit de tabel en leg uit wat ze bewijzen.",
        "Beschrijf alleen hoe de tabel eruitziet.",
        "Gebruik uitsluitend je voorkennis.",
        "Noteer elk getal zonder conclusie.",
      ],
      "Verwijs naar concrete waarden uit de tabel en leg uit wat ze bewijzen."
    ),
    mc(
      category,
      "Welke aanpak voorkomt dat je een deelvraag vergeet?",
      [
        "Nummer de deelvragen en controleer na afloop elk antwoord.",
        "Schrijf één lang antwoord zonder structuur.",
        "Beantwoord alleen de laatste zin.",
        "Sla woorden als ‘en’, ‘maar’ en ‘vervolgens’ over.",
      ],
      "Nummer de deelvragen en controleer na afloop elk antwoord."
    ),
    mc(
      category,
      `Wat is het belangrijkste verschil tussen “${previous.verb}” en “${current.verb}”?`,
      [
        `“${previous.verb}” vraagt ${previous.expected}; “${current.verb}” vraagt ${current.expected}.`,
        "Er is geen verschil tussen instructiewoorden.",
        `“${current.verb}” vraagt altijd alleen een getal.`,
        `“${previous.verb}” mag nooit met een bron worden uitgevoerd.`,
      ],
      `“${previous.verb}” vraagt ${previous.expected}; “${current.verb}” vraagt ${current.expected}.`
    ),
    mc(
      category,
      `Welke opdracht vraagt meer verwerking: “${current.verb}” of “${next.verb}”?`,
      [
        `“${next.verb}”, omdat dit ${next.expected} vraagt.`,
        `“${current.verb}”, omdat elk korter woord moeilijker is.`,
        "Beide vragen altijd exact hetzelfde.",
        "Dat kun je alleen aan het aantal regels zien.",
      ],
      `“${next.verb}”, omdat dit ${next.expected} vraagt.`
    ),
    mc(
      category,
      "Een opdracht zegt: “Vergelijk de twee plannen en besluit welk plan haalbaarder is.” Welke structuur is het duidelijkst?",
      [
        "Overeenkomst(en), verschil(len), afweging en besluit.",
        "Eerst het besluit, zonder vergelijking.",
        "Alleen plan A volledig beschrijven.",
        "Losse details in willekeurige volgorde.",
      ],
      "Overeenkomst(en), verschil(len), afweging en besluit."
    ),
    mc(
      category,
      "Een vraag bevat het woord “verklaar”. Welk signaalwoord helpt je antwoord logisch op te bouwen?",
      ["omdat", "misschien", "trouwens", "eindelijk"],
      "omdat"
    ),
    mc(
      category,
      "Een vraag bevat het woord “beoordeel”. Welke informatie heb je nodig?",
      [
        "Duidelijke criteria en gegevens waarmee je die criteria kunt toepassen.",
        "Alleen je eerste indruk.",
        "Een lijst zonder rangorde of conclusie.",
        "Een antwoord van precies één woord.",
      ],
      "Duidelijke criteria en gegevens waarmee je die criteria kunt toepassen."
    ),
    mc(
      category,
      "Welke controle voer je het best uit nadat je klaar bent?",
      [
        "Nagaan of elk instructiewoord, elke deelvraag en elke gevraagde bron verwerkt is.",
        "Alle moeilijke woorden verwijderen.",
        "Het antwoord langer maken zonder inhoud toe te voegen.",
        "Alle leestekens vervangen door komma's.",
      ],
      "Nagaan of elk instructiewoord, elke deelvraag en elke gevraagde bron verwerkt is."
    ),
    mc(
      category,
      "Wat betekent “formuleer in eigen woorden”?",
      [
        "Behoud de betekenis, maar schrijf niet letterlijk over.",
        "Verander alleen één woord uit de bron.",
        "Voeg informatie toe die niet in de bron staat.",
        "Schrijf de zin woord voor woord over.",
      ],
      "Behoud de betekenis, maar schrijf niet letterlijk over."
    ),
    mc(
      category,
      "Welke bronverwijzing is het meest precies?",
      [
        "Volgens bron 3 stijgt het aantal van 42 naar 58 tussen 2024 en 2025.",
        "In de bron staat iets over een stijging.",
        "Ik denk dat het meer wordt.",
        "De grafiek ziet er overtuigend uit.",
      ],
      "Volgens bron 3 stijgt het aantal van 42 naar 58 tussen 2024 en 2025."
    ),
    mc(
      category,
      "Welke formulering maakt een conclusie voldoende voorzichtig?",
      [
        "De gegevens wijzen erop dat de maatregel waarschijnlijk effect heeft.",
        "De maatregel werkt altijd en overal.",
        "Eén voorbeeld bewijst de regel zonder uitzondering.",
        "Omdat twee waarden verschillen, is de oorzaak zeker bekend.",
      ],
      "De gegevens wijzen erop dat de maatregel waarschijnlijk effect heeft."
    ),
    mc(
      category,
      "Een opdracht vraagt maximaal 80 woorden. Wat is de beste strategie?",
      [
        "Selecteer alleen kerninformatie en schrap herhaling en voorbeelden die niet nodig zijn.",
        "Schrijf eerst 300 woorden en lever alles in.",
        "Laat het besluit weg om woorden te besparen.",
        "Gebruik zoveel mogelijk lange omschrijvingen.",
      ],
      "Selecteer alleen kerninformatie en schrap herhaling en voorbeelden die niet nodig zijn."
    ),
  ];

  return shuffle(random, exercises);
}

export function generateOpdrachten(
  level: number,
  random: Random
): ExerciseInput[] {
  const safeLevel = Math.max(1, Math.min(10, Math.round(level || 1)));
  return buildLevelExercises(safeLevel, random);
}
