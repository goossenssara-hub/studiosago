import type { SecondaryExercise } from "./types";
import { pick, seededRandom, shuffle } from "./utils";

function makeId(skill: string, level: number, index: number) {
  return `${skill}-${level}-${index}`;
}

function questionExercises(
  skill: string,
  level: number,
  seed: number
): SecondaryExercise[] {
  const random = seededRandom(seed + level * 97);
  const price = 12 + Math.floor(random() * 20);
  const amount = 3 + Math.floor(random() * 5);
  const total = price * amount;
  const distance = 120 + Math.floor(random() * 180);
  const firstPart = 45 + Math.floor(random() * 60);
  const remaining = distance - firstPart;

  return [
    {
      id: makeId(skill, level, 1),
      category: "De vraag ontleden",
      prompt:
        `Lina koopt ${amount} schriften van €${price}. Ze betaalt met €${total + 20}. ` +
        "Welke informatie heb je nodig om te berekenen hoeveel geld ze terugkrijgt?",
      instruction: "Kies de twee noodzakelijke gegevens.",
      type: "choice",
      options: [
        `Het aantal schriften en de prijs per schrift`,
        "De kleur van de schriften",
        "De naam van de winkel",
      ],
      answer: `Het aantal schriften en de prijs per schrift`,
      explanation:
        "Je moet eerst de totale kost berekenen. Daarvoor heb je het aantal en de prijs per stuk nodig.",
      strategy: ["Markeer de getallen", "Bepaal wat je zoekt", "Schrap overbodige informatie"],
    },
    {
      id: makeId(skill, level, 2),
      category: "De vraag ontleden",
      prompt:
        "Een klas vertrekt om 8.30 uur naar een museum. De busrit duurt 50 minuten. " +
        "Er zijn 24 leerlingen mee. Hoe laat komt de klas aan?",
      instruction: "Welk gegeven is overbodig?",
      type: "choice",
      options: ["8.30 uur", "50 minuten", "24 leerlingen"],
      answer: "24 leerlingen",
      explanation:
        "Het aantal leerlingen verandert niets aan het aankomstuur.",
    },
    {
      id: makeId(skill, level, 3),
      category: "Bewerking kiezen",
      prompt:
        `Een wandelroute is ${distance} km lang. Noor heeft al ${firstPart} km afgelegd. ` +
        "Welke bewerking gebruik je om te weten hoeveel kilometer ze nog moet wandelen?",
      type: "choice",
      options: [
        `${distance} + ${firstPart}`,
        `${distance} - ${firstPart}`,
        `${distance} × ${firstPart}`,
      ],
      answer: `${distance} - ${firstPart}`,
      explanation: "Je trekt het reeds afgelegde deel af van de totale afstand.",
    },
    {
      id: makeId(skill, level, 4),
      category: "Vraagstuk oplossen",
      prompt:
        `Een wandelroute is ${distance} km lang. Noor heeft al ${firstPart} km afgelegd. ` +
        "Hoeveel kilometer moet ze nog wandelen?",
      type: "number",
      answer: String(remaining),
      explanation: `${distance} - ${firstPart} = ${remaining}`,
      strategy: ["Wat weet ik?", "Wat zoek ik?", "Welke bewerking past?", "Controleer de eenheid"],
    },
    {
      id: makeId(skill, level, 5),
      category: "Vraag herformuleren",
      prompt:
        "Een sportclub bestelt 8 dozen met telkens 12 drinkflessen. " +
        "Formuleer in je eigen woorden wat je moet berekenen.",
      type: "choice",
      options: [
        "Hoeveel drinkflessen er in totaal zijn",
        "Hoe duur één drinkfles is",
        "Hoeveel dozen leeg zijn",
      ],
      answer: "Hoeveel drinkflessen er in totaal zijn",
      explanation: "Het woord 'telkens' wijst op gelijke groepen.",
    },
    {
      id: makeId(skill, level, 6),
      category: "Meerstapsvraagstuk",
      prompt:
        "Een uitstap kost €18 per leerling. Er gaan 26 leerlingen mee. " +
        "De school betaalt €120. Hoeveel euro moet de klas nog verzamelen?",
      type: "number",
      answer: "348",
      explanation: "26 × 18 = 468 en 468 - 120 = 348.",
      strategy: ["Bereken eerst de totale kost", "Trek daarna de bijdrage van de school af"],
    },
  ];
}

function genericMathExercises(
  skill: string,
  level: number,
  seed: number
): SecondaryExercise[] {
  const random = seededRandom(seed + level * 181);
  const a = 20 + Math.floor(random() * 80);
  const b = 2 + Math.floor(random() * 9);
  const product = a * b;

  const configs: Record<string, SecondaryExercise[]> = {
    "wiskunde-hoofdrekenen": [
      {
        id: makeId(skill, level, 1),
        category: "Hoofdrekenen",
        prompt: `${a} × ${b} =`,
        type: "number",
        answer: String(product),
        explanation: `${a} × ${b} = ${product}`,
      },
      {
        id: makeId(skill, level, 2),
        category: "Hoofdrekenen",
        prompt: `${product} ÷ ${b} =`,
        type: "number",
        answer: String(a),
      },
      {
        id: makeId(skill, level, 3),
        category: "Schatten",
        prompt: `Welke schatting ligt het dichtst bij ${a * 19}?`,
        type: "choice",
        options: [String(a * 20), String(a * 10), String(a * 30)],
        answer: String(a * 20),
      },
      {
        id: makeId(skill, level, 4),
        category: "Rekenvolgorde",
        prompt: `6 + ${b} × 4 =`,
        type: "number",
        answer: String(6 + b * 4),
        explanation: "Vermenigvuldigen komt voor optellen.",
      },
    ],
    "wiskunde-breuken-kommagetallen": [
      {
        id: makeId(skill, level, 1),
        category: "Breuken",
        prompt: "Welke breuk is gelijk aan 0,5?",
        type: "choice",
        options: ["1/2", "1/4", "3/4"],
        answer: "1/2",
      },
      {
        id: makeId(skill, level, 2),
        category: "Kommagetallen",
        prompt: "2,75 + 1,5 =",
        type: "number",
        answer: ["4.25", "4,25"],
      },
      {
        id: makeId(skill, level, 3),
        category: "Vergelijken",
        prompt: "Welke waarde is het grootst?",
        type: "choice",
        options: ["0,65", "2/3", "0,6"],
        answer: "2/3",
      },
      {
        id: makeId(skill, level, 4),
        category: "Breuken",
        prompt: "Vereenvoudig 6/12.",
        type: "text",
        answer: ["1/2", "0.5", "0,5"],
      },
    ],
    "wiskunde-procenten-verhoudingen": [
      {
        id: makeId(skill, level, 1),
        category: "Procenten",
        prompt: "Hoeveel is 25% van 80?",
        type: "number",
        answer: "20",
      },
      {
        id: makeId(skill, level, 2),
        category: "Kortingen",
        prompt: "Een trui kost €60 en krijgt 20% korting. Hoeveel euro korting krijg je?",
        type: "number",
        answer: "12",
      },
      {
        id: makeId(skill, level, 3),
        category: "Verhoudingen",
        prompt: "Voor 2 personen heb je 300 g pasta nodig. Hoeveel voor 6 personen?",
        type: "number",
        answer: "900",
      },
      {
        id: makeId(skill, level, 4),
        category: "Schaal",
        prompt: "Op een kaart is 1 cm gelijk aan 5 km. Hoeveel km is 4 cm?",
        type: "number",
        answer: "20",
      },
    ],
    "wiskunde-meetkunde": [
      {
        id: makeId(skill, level, 1),
        category: "Omtrek",
        prompt: "Een rechthoek is 8 cm lang en 5 cm breed. Bereken de omtrek.",
        type: "number",
        answer: ["26", "26 cm"],
      },
      {
        id: makeId(skill, level, 2),
        category: "Oppervlakte",
        prompt: "Een rechthoek is 8 cm lang en 5 cm breed. Bereken de oppervlakte.",
        type: "number",
        answer: ["40", "40 cm2", "40 cm²"],
      },
      {
        id: makeId(skill, level, 3),
        category: "Hoeken",
        prompt: "Hoe groot is een rechte hoek?",
        type: "number",
        answer: ["90", "90°"],
      },
      {
        id: makeId(skill, level, 4),
        category: "Eigenschappen",
        prompt: "Hoeveel even lange zijden heeft een vierkant?",
        type: "number",
        answer: "4",
      },
    ],
    "wiskunde-tabellen-grafieken": [
      {
        id: makeId(skill, level, 1),
        category: "Tabellen lezen",
        prompt:
          "In een tabel staat: maandag 12 bezoekers, dinsdag 18 en woensdag 15. Welke dag had de meeste bezoekers?",
        type: "choice",
        options: ["Maandag", "Dinsdag", "Woensdag"],
        answer: "Dinsdag",
      },
      {
        id: makeId(skill, level, 2),
        category: "Verschil berekenen",
        prompt: "Wat is het verschil tussen 18 bezoekers en 12 bezoekers?",
        type: "number",
        answer: "6",
      },
      {
        id: makeId(skill, level, 3),
        category: "Totaal berekenen",
        prompt: "Bereken het totaal van 12, 18 en 15 bezoekers.",
        type: "number",
        answer: "45",
      },
      {
        id: makeId(skill, level, 4),
        category: "Besluit trekken",
        prompt: "Welke uitspraak klopt bij de reeks 12, 18, 15?",
        type: "choice",
        options: [
          "Dinsdag is het hoogste aantal",
          "Maandag is het hoogste aantal",
          "Alle dagen zijn gelijk",
        ],
        answer: "Dinsdag is het hoogste aantal",
      },
    ],
  };

  return configs[skill] || [];
}

function dutchExercises(
  skill: string,
  level: number,
  seed: number
): SecondaryExercise[] {
  const random = seededRandom(seed + level * 239);

  const configs: Record<string, SecondaryExercise[]> = {
    "nederlands-opdrachten": [
      {
        id: makeId(skill, level, 1),
        category: "Instructiewoorden",
        prompt: "Wat moet je doen wanneer een opdracht zegt: 'vergelijk'?",
        type: "choice",
        options: [
          "Overeenkomsten en verschillen zoeken",
          "Een woord overschrijven",
          "Alleen je mening geven",
        ],
        answer: "Overeenkomsten en verschillen zoeken",
      },
      {
        id: makeId(skill, level, 2),
        category: "Instructiewoorden",
        prompt: "Wat betekent 'verklaar je antwoord'?",
        type: "choice",
        options: [
          "Je antwoord onderbouwen",
          "Alleen ja of nee schrijven",
          "De vraag kopiëren",
        ],
        answer: "Je antwoord onderbouwen",
      },
      {
        id: makeId(skill, level, 3),
        category: "Vraag herformuleren",
        prompt:
          "Opdracht: 'Noteer twee redenen waarom de hoofdpersoon vertrekt.' Hoeveel antwoorden moet je geven?",
        type: "number",
        answer: "2",
      },
      {
        id: makeId(skill, level, 4),
        category: "Sleutelwoorden",
        prompt:
          "Welk woord vertelt je dat je bewijs uit de tekst moet gebruiken: 'Toon met een zin uit de tekst aan dat Noor bang is.'",
        type: "choice",
        options: ["Toon aan", "Noor", "bang"],
        answer: "Toon aan",
      },
    ],
    "nederlands-begrijpend-lezen": [
      {
        id: makeId(skill, level, 1),
        category: "Hoofdgedachte",
        prompt:
          "Tekst: 'Steeds meer leerlingen fietsen naar school. Dat is gezond, goedkoop en beter voor het milieu.' Wat is de hoofdgedachte?",
        type: "choice",
        options: [
          "Fietsen naar school heeft voordelen",
          "Fietsen zijn duur",
          "Alle leerlingen wonen dichtbij",
        ],
        answer: "Fietsen naar school heeft voordelen",
      },
      {
        id: makeId(skill, level, 2),
        category: "Verwijswoorden",
        prompt:
          "In de zin 'Mila nam haar boek. Ze begon meteen te lezen.' Naar wie verwijst 'ze'?",
        type: "text",
        answer: "Mila",
      },
      {
        id: makeId(skill, level, 3),
        category: "Tekstverband",
        prompt: "Welk signaalwoord geeft een tegenstelling aan?",
        type: "choice",
        options: ["maar", "daarom", "eerst"],
        answer: "maar",
      },
      {
        id: makeId(skill, level, 4),
        category: "Bewijs zoeken",
        prompt:
          "Tekst: 'Sam trok zijn jas dicht en zijn handen trilden.' Welke zin toont dat Sam het koud heeft?",
        type: "text",
        answer: ["Sam trok zijn jas dicht en zijn handen trilden", "zijn handen trilden"],
      },
    ],
    "nederlands-woordenschat": [
      {
        id: makeId(skill, level, 1),
        category: "Schooltaal",
        prompt: "Wat betekent 'concludeer'?",
        type: "choice",
        options: [
          "Een besluit trekken",
          "Een tekst overschrijven",
          "Een vraag overslaan",
        ],
        answer: "Een besluit trekken",
      },
      {
        id: makeId(skill, level, 2),
        category: "Synoniemen",
        prompt: "Welk woord betekent ongeveer hetzelfde als 'belangrijk'?",
        type: "choice",
        options: ["essentieel", "toevallig", "onduidelijk"],
        answer: "essentieel",
      },
      {
        id: makeId(skill, level, 3),
        category: "Context",
        prompt:
          "De uitleg was beknopt: ze duurde maar één minuut. Wat betekent 'beknopt'?",
        type: "choice",
        options: ["kort", "moeilijk", "luid"],
        answer: "kort",
      },
      {
        id: makeId(skill, level, 4),
        category: "Schooltaal",
        prompt: "Wat betekent 'motiveer je antwoord'?",
        type: "choice",
        options: [
          "Leg uit waarom je antwoord klopt",
          "Schrijf sneller",
          "Gebruik maar één woord",
        ],
        answer: "Leg uit waarom je antwoord klopt",
      },
    ],
    "nederlands-spelling": [
      {
        id: makeId(skill, level, 1),
        category: "Werkwoordspelling",
        prompt: "Kies de juiste vorm: Morgen ___ hij naar school.",
        type: "choice",
        options: ["fietst", "fietsdt", "fietsd"],
        answer: "fietst",
      },
      {
        id: makeId(skill, level, 2),
        category: "Leestekens",
        prompt: "Welk leesteken hoort op het einde? 'Kom je morgen mee__'",
        type: "choice",
        options: ["?", ".", ","],
        answer: "?",
      },
      {
        id: makeId(skill, level, 3),
        category: "Meervoud",
        prompt: "Wat is het meervoud van 'museum'?",
        type: "text",
        answer: ["musea", "museums"],
      },
      {
        id: makeId(skill, level, 4),
        category: "Werkwoordspelling",
        prompt: "Kies de juiste zin.",
        type: "choice",
        options: [
          "Zij wordt morgen dertien.",
          "Zij word morgen dertien.",
          "Zij wort morgen dertien.",
        ],
        answer: "Zij wordt morgen dertien.",
      },
    ],
    "nederlands-taalbeschouwing": [
      {
        id: makeId(skill, level, 1),
        category: "Persoonsvorm",
        prompt: "Wat is de persoonsvorm in: 'De leerlingen maken hun taak.'",
        type: "text",
        answer: "maken",
      },
      {
        id: makeId(skill, level, 2),
        category: "Onderwerp",
        prompt: "Wat is het onderwerp in: 'Morgen vertrekt de trein om acht uur.'",
        type: "text",
        answer: "de trein",
      },
      {
        id: makeId(skill, level, 3),
        category: "Woordsoorten",
        prompt: "Welke woordsoort is 'mooie' in 'de mooie fiets'?",
        type: "choice",
        options: ["bijvoeglijk naamwoord", "werkwoord", "lidwoord"],
        answer: "bijvoeglijk naamwoord",
      },
      {
        id: makeId(skill, level, 4),
        category: "Zinsdelen",
        prompt: "Welk zinsdeel antwoordt op de vraag 'wanneer'?",
        type: "choice",
        options: [
          "bijwoordelijke bepaling van tijd",
          "onderwerp",
          "lijdend voorwerp",
        ],
        answer: "bijwoordelijke bepaling van tijd",
      },
    ],
    "nederlands-samenvatten": [
      {
        id: makeId(skill, level, 1),
        category: "Hoofd- en bijzaken",
        prompt:
          "Tekst: 'De school organiseert vrijdag een sportdag. Leerlingen brengen sportkledij en water mee.' Wat is de hoofdzaak?",
        type: "choice",
        options: [
          "Vrijdag is er een sportdag",
          "Water zit in een fles",
          "Sommige sportkledij is blauw",
        ],
        answer: "Vrijdag is er een sportdag",
      },
      {
        id: makeId(skill, level, 2),
        category: "Kernwoorden",
        prompt:
          "Welke twee kernwoorden passen het best bij: 'De school organiseert vrijdag een sportdag'?",
        type: "choice",
        options: ["school – sportdag", "vrijdag – blauw", "water – schrift"],
        answer: "school – sportdag",
      },
      {
        id: makeId(skill, level, 3),
        category: "Samenvatten",
        prompt:
          "Welke samenvatting is het best? 'Lina mist de bus omdat ze te laat vertrekt. Daarom belt ze haar vader.'",
        type: "choice",
        options: [
          "Lina mist de bus en belt haar vader",
          "Lina heeft een vader",
          "De bus is groot",
        ],
        answer: "Lina mist de bus en belt haar vader",
      },
      {
        id: makeId(skill, level, 4),
        category: "Structuur",
        prompt: "Welke volgorde gebruik je voor een duidelijke samenvatting?",
        type: "choice",
        options: [
          "Hoofdgedachte – kerninformatie – besluit",
          "Details – details – titel",
          "Mening – grap – herhaling",
        ],
        answer: "Hoofdgedachte – kerninformatie – besluit",
      },
    ],
    "leren-leren-plannen": [
      {
        id: makeId(skill, level, 1),
        category: "Plannen",
        prompt:
          "Je hebt vrijdag een toets met vier hoofdstukken. Wat is de beste aanpak?",
        type: "choice",
        options: [
          "De hoofdstukken over meerdere dagen verdelen",
          "Alles vrijdagochtend leren",
          "Alleen het kortste hoofdstuk leren",
        ],
        answer: "De hoofdstukken over meerdere dagen verdelen",
      },
      {
        id: makeId(skill, level, 2),
        category: "Prioriteiten",
        prompt:
          "Wat doe je eerst: een taak voor morgen of een taak voor volgende maand?",
        type: "choice",
        options: ["De taak voor morgen", "De taak voor volgende maand", "Geen van beide"],
        answer: "De taak voor morgen",
      },
      {
        id: makeId(skill, level, 3),
        category: "Zelfcontrole",
        prompt: "Welke controle doe je best vóór je een toets indient?",
        type: "choice",
        options: [
          "Nakijken of alle vragen beantwoord zijn",
          "Alle antwoorden wissen",
          "Alleen je naam lezen",
        ],
        answer: "Nakijken of alle vragen beantwoord zijn",
      },
      {
        id: makeId(skill, level, 4),
        category: "Studeren",
        prompt: "Welke studiemethode is actief?",
        type: "choice",
        options: [
          "Jezelf vragen stellen over de leerstof",
          "De tekst alleen bekijken",
          "Het boek gesloten laten",
        ],
        answer: "Jezelf vragen stellen over de leerstof",
      },
    ],
  };

  return configs[skill] || [];
}

export function generateExercisesEerste(
  skill: string,
  level: number,
  seed: number
): SecondaryExercise[] {
  let exercises: SecondaryExercise[];

  if (skill === "wiskunde-vraagstukken") {
    exercises = questionExercises(skill, level, seed);
  } else if (skill.startsWith("wiskunde-")) {
    exercises = genericMathExercises(skill, level, seed);
  } else {
    exercises = dutchExercises(skill, level, seed);
  }

  const random = seededRandom(seed + level * 19);
  return shuffle(exercises, random).map((exercise, index) => ({
    ...exercise,
    id: `${skill}-${level}-${index + 1}`,
  }));
}
