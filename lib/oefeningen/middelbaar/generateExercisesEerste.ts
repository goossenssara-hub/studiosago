import type { SecondaryExercise } from "./types";

type Random = () => number;
type ExerciseInput = Omit<SecondaryExercise, "id">;

const clampLevel = (level: number) =>
  Math.max(1, Math.min(10, Math.round(level || 1)));

function createRandom(seed: number): Random {
  let state = Math.abs(Math.floor(seed)) || 1;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function randomInt(random: Random, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick<T>(random: Random, values: readonly T[]): T {
  return values[Math.floor(random() * values.length)];
}

function shuffle<T>(random: Random, values: readonly T[]): T[] {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }

  return result;
}

function makeExercises(
  skill: string,
  level: number,
  seed: number,
  inputs: ExerciseInput[]
): SecondaryExercise[] {
  return inputs.map((exercise, index) => ({
    ...exercise,
    id: `${skill}-niveau-${level}-${seed}-${index + 1}`,
  }));
}

const skillAliases: Record<string, string> = {
  "begrijpend-lezen": "begrijpend-lezen",
  begrijpendlezen: "begrijpend-lezen",
  lezen: "begrijpend-lezen",
  spelling: "spelling",
  werkwoorden: "spelling",
  taal: "spelling",
  wiskunde: "wiskunde",
  rekenen: "wiskunde",
  frans: "frans",
  french: "frans",
};

function normalizeSkill(skill: string) {
  const normalized = skill
    .trim()
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");

  return skillAliases[normalized] ?? normalized;
}

function generateReading(level: number, random: Random): ExerciseInput[] {
  const texts = [
    {
      easy:
        "Mila fietst elke woensdag naar de bibliotheek. Ze kiest meestal een avonturenboek. Vandaag leent ze ook een boek over vulkanen, omdat de klas daar volgende week over leert.",
      hard:
        "Hoewel Mila doorgaans avonturenromans kiest, neemt ze deze woensdag ook een informatief werk over vulkanen mee. De komende lessen behandelen namelijk natuurverschijnselen, waardoor ze zich vooraf beter wil informeren.",
      topic: "Mila bereidt zich voor op een les over vulkanen.",
      detail: "op woensdag",
      reason: "omdat haar klas over vulkanen zal leren",
      inference: "Mila is nieuwsgierig en bereidt lessen graag voor.",
      title: "Een extra boek voor de les",
    },
    {
      easy:
        "De school wil minder afval produceren. Daarom staan er voortaan aparte bakken voor papier, plastic en restafval. Leerlingen krijgen ook een herbruikbare drinkfles.",
      hard:
        "Om de hoeveelheid afval structureel te verminderen, voert de school een nieuw sorteersysteem in. Naast afzonderlijke afvalbakken ontvangen leerlingen een herbruikbare drinkfles, zodat wegwerpverpakkingen minder nodig zijn.",
      topic: "De school neemt maatregelen om afval te verminderen.",
      detail: "papier, plastic en restafval",
      reason: "zodat er minder wegwerpverpakkingen nodig zijn",
      inference: "De school wil leerlingen duurzamer laten handelen.",
      title: "Samen voor minder afval",
    },
    {
      easy:
        "Noah traint voor een loopwedstrijd. Eerst liep hij te snel en was hij vlug moe. Zijn trainer leerde hem rustiger starten. Daardoor houdt hij het nu langer vol.",
      hard:
        "Tijdens zijn voorbereiding op een loopwedstrijd merkte Noah dat een te hoog begintempo hem snel uitputte. Nadat zijn trainer hem leerde zijn krachten beter te verdelen, kon hij aanzienlijk langer blijven lopen.",
      topic: "Noah leert zijn tempo beter verdelen.",
      detail: "hij startte te snel",
      reason: "om zijn krachten beter te verdelen",
      inference: "Een slimme aanpak kan belangrijker zijn dan meteen snel gaan.",
      title: "Rustiger starten, langer lopen",
    },
  ] as const;

  const source = pick(random, texts);
  const text = level <= 3 ? source.easy : source.hard;
  const items: ExerciseInput[] = [
    {
      category: `Begrijpend lezen · niveau ${level}`,
      question: `${text}\n\nWat is het hoofdonderwerp van de tekst?`,
      answer: source.topic,
    },
    {
      category: `Begrijpend lezen · niveau ${level}`,
      question: `${text}\n\nWelk belangrijk detail wordt in de tekst genoemd?`,
      answer: source.detail,
    },
    {
      category: `Begrijpend lezen · niveau ${level}`,
      question: `${text}\n\nWaarom gebeurt dit volgens de tekst?`,
      answer: source.reason,
    },
  ];

  if (level >= 3) {
    items.push({
      category: `Verbanden leggen · niveau ${level}`,
      question: `${text}\n\nWelke conclusie kun je uit de tekst afleiden?`,
      answer: source.inference,
    });
  }

  if (level >= 5) {
    items.push({
      category: `Tekststructuur · niveau ${level}`,
      question: `${text}\n\nGeef een passende titel.`,
      answer: source.title,
    });
  }

  if (level >= 7) {
    items.push(
      {
        category: `Kritisch lezen · niveau ${level}`,
        question:
          `${text}\n\nIs de tekst vooral informerend, overtuigend of ontspannend bedoeld?`,
        answer: "informerend",
      },
      {
        category: `Kritisch lezen · niveau ${level}`,
        question:
          `${text}\n\nLeg in één korte zin uit welk verband centraal staat.`,
        answer: ["oorzaak en gevolg", "oorzaak-gevolg", "probleem en oplossing"],
      }
    );
  }

  if (level >= 9) {
    items.push({
      category: `Analyse · niveau ${level}`,
      question:
        `${text}\n\nVat de kern van de tekst samen in maximaal één zin.`,
      answer: [source.topic, source.inference],
    });
  }

  return items;
}

const spellingLevels: readonly (readonly [string, string])[][] = [
  [["kat", "katten"], ["boom", "bomen"], ["brief", "brieven"], ["glas", "glazen"]],
  [["bed", "bedden"], ["raam", "ramen"], ["schip", "schepen"], ["druif", "druiven"]],
  [["baby", "baby's"], ["auto", "auto's"], ["idee", "ideeën"], ["menu", "menu's"]],
  [["gebeuren", "gebeurt"], ["vinden", "vindt"], ["worden", "wordt"], ["antwoorden", "antwoordt"]],
  [["reizen", "reisde"], ["verhuizen", "verhuisde"], ["werken", "werkte"], ["branden", "brandde"]],
  [["downloaden", "downloadde"], ["updaten", "updatete"], ["faxen", "faxte"], ["plannen", "plande"]],
  [["paardenbloem", "paardenbloem"], ["langeafstandsloper", "langeafstandsloper"], ["zonneschijn", "zonneschijn"], ["pannenkoek", "pannenkoek"]],
  [["zee-egel", "zee-egel"], ["na-apen", "na-apen"], ["re-integreren", "re-integreren"], ["tv-programma", "tv-programma"]],
  [["geüpdatet", "geüpdatet"], ["beïnvloed", "beïnvloed"], ["geërgerd", "geërgerd"], ["geanalyseerd", "geanalyseerd"]],
  [["Hij vindt dat zij verandert.", "Hij vindt dat zij verandert."], ["Word jij morgen verwacht?", "Word jij morgen verwacht?"], ["De leerling antwoordde correct.", "De leerling antwoordde correct."], ["Het document is geüpdatet.", "Het document is geüpdatet."]],
];

function generateSpelling(level: number, random: Random): ExerciseInput[] {
  const words = shuffle(random, spellingLevels[level - 1]);
  const category =
    level <= 3
      ? "Meervoud en woordbeeld"
      : level <= 6
        ? "Werkwoordspelling"
        : level <= 8
          ? "Samenstellingen en leestekens"
          : "Moeilijke spelling in context";

  return words.map(([prompt, answer], index) => ({
    category: `${category} · niveau ${level}`,
    question:
      level <= 3
        ? `Schrijf de juiste vorm van: ${prompt}`
        : level <= 6
          ? `Vul de correcte werkwoordsvorm in: ${prompt}`
          : level <= 9
            ? `Schrijf dit woord correct: ${prompt}`
            : `Schrijf de volledige zin foutloos over: ${prompt}`,
    answer,
  }));
}

function fraction(value: number, denominator: number) {
  return Number((value / denominator).toFixed(2)).toString();
}


function acceptedNumber(value: number, unit?: string): string[] {
  const rounded = Number(value.toFixed(2));
  const dot = String(rounded);
  const comma = dot.replace(".", ",");

  if (!unit) {
    return dot === comma ? [dot] : [dot, comma];
  }

  return Array.from(
    new Set([
      dot,
      comma,
      `${dot} ${unit}`,
      `${comma} ${unit}`,
      `${dot}${unit}`,
      `${comma}${unit}`,
    ])
  );
}

function acceptedMoney(value: number): string[] {
  const rounded = Number(value.toFixed(2));
  const dot = rounded.toFixed(2);
  const comma = dot.replace(".", ",");

  return Array.from(
    new Set([
      String(rounded),
      dot,
      comma,
      `€${dot}`,
      `€ ${dot}`,
      `€${comma}`,
      `€ ${comma}`,
      `${dot} euro`,
      `${comma} euro`,
    ])
  );
}

function generateMathWordProblems(
  level: number,
  random: Random
): ExerciseInput[] {
  const category = `Vraagstukken begrijpen · niveau ${level}`;

  if (level === 1) {
    const notebooks = randomInt(random, 6, 12);
    const notebookPrice = randomInt(random, 180, 350) / 100;
    const pens = randomInt(random, 4, 10);
    const penPrice = randomInt(random, 90, 220) / 100;
    const paid = Math.ceil(
      (notebooks * notebookPrice + pens * penPrice) / 10
    ) * 10 + 10;

    return [
      {
        category,
        question:
          `Een leerling koopt ${notebooks} schriften van €${notebookPrice
            .toFixed(2)
            .replace(".", ",")} en ${pens} pennen van €${penPrice
            .toFixed(2)
            .replace(".", ",")}. Hoeveel betaalt de leerling in totaal?`,
        answer: acceptedMoney(
          notebooks * notebookPrice + pens * penPrice
        ),
      },
      {
        category,
        question:
          `Dezelfde leerling betaalt met €${paid}. Hoeveel wisselgeld krijgt hij?`,
        answer: acceptedMoney(
          paid - (notebooks * notebookPrice + pens * penPrice)
        ),
      },
      {
        category,
        question:
          `Een bus heeft 54 zitplaatsen. Er stappen 37 leerlingen en 4 begeleiders in. ` +
          `Hoeveel plaatsen blijven vrij?`,
        answer: "13",
      },
      {
        category,
        question:
          `Een klas koopt 8 pakken papier met 250 vellen per pak. ` +
          `Na een project zijn 365 vellen gebruikt. Hoeveel vellen blijven over?`,
        answer: "1635",
      },
      {
        category,
        question:
          `Een trein vertrekt om 08:47 en komt aan om 10:19. ` +
          `Hoeveel minuten duurt de rit?`,
        answer: acceptedNumber(92, "minuten"),
      },
      {
        category,
        question:
          `Een wandelroute is 18,5 km lang. Na 7,8 km houdt de groep pauze. ` +
          `Hoeveel kilometer moet de groep daarna nog afleggen?`,
        answer: acceptedNumber(10.7, "km"),
      },
    ];
  }

  if (level === 2) {
    const boxes = randomInt(random, 6, 10);
    const items = randomInt(random, 18, 28);
    const damaged = randomInt(random, 9, 24);
    const sold = randomInt(random, 30, 60);

    return [
      {
        category,
        question:
          `Een magazijn ontvangt ${boxes} dozen met telkens ${items} producten. ` +
          `${damaged} producten zijn beschadigd en ${sold} producten worden verkocht. ` +
          `Hoeveel bruikbare producten blijven over?`,
        answer: String(boxes * items - damaged - sold),
      },
      {
        category,
        question:
          `Een klas van 28 leerlingen betaalt €7,50 per leerling voor een activiteit. ` +
          `De school betaalt daarnaast €48 vaste reservatiekosten. ` +
          `Hoeveel kost de activiteit in totaal?`,
        answer: acceptedMoney(28 * 7.5 + 48),
      },
      {
        category,
        question:
          `Een fietser rijdt 24 km in 1,5 uur. Hoeveel kilometer rijdt hij gemiddeld per uur?`,
        answer: acceptedNumber(16, "km/u"),
      },
      {
        category,
        question:
          `Een recept voor 4 personen gebruikt 300 gram rijst. ` +
          `Hoeveel gram rijst is nodig voor 10 personen?`,
        answer: acceptedNumber(750, "gram"),
      },
      {
        category,
        question:
          `Een tank bevat 120 liter. Eerst wordt 35 liter gebruikt en daarna 18 liter bijgevuld. ` +
          `Hoeveel liter zit nu in de tank?`,
        answer: acceptedNumber(103, "liter"),
      },
      {
        category,
        question:
          `Een leerling rekent 6 × 24 - 18 uit als 6 × 6. ` +
          `Is die redenering correct? Antwoord met ja of nee.`,
        answer: "nee",
      },
    ];
  }

  if (level === 3) {
    return [
      {
        category,
        question:
          `Een jas kost €96. Tijdens de solden krijg je 25% korting. ` +
          `Wat is de nieuwe prijs?`,
        answer: acceptedMoney(72),
      },
      {
        category,
        question:
          `In een klas van 32 leerlingen is 3/8 afwezig. ` +
          `Hoeveel leerlingen zijn aanwezig?`,
        answer: "20",
      },
      {
        category,
        question:
          `Een school koopt 15 boeken van €12,40. Ze krijgt €18 korting op het totaal. ` +
          `Hoeveel betaalt de school?`,
        answer: acceptedMoney(168),
      },
      {
        category,
        question:
          `Een route is 42 km lang. De eerste dag wordt 2/7 van de route afgelegd. ` +
          `De tweede dag nog 15 km. Hoeveel kilometer blijft over?`,
        answer: acceptedNumber(15, "km"),
      },
      {
        category,
        question:
          `Een rechthoekig terrein is 18 m lang en 12 m breed. ` +
          `Rondom wordt een hek geplaatst, behalve bij een poort van 3 m. ` +
          `Hoeveel meter hek is nodig?`,
        answer: acceptedNumber(57, "m"),
      },
      {
        category,
        question:
          `Een bus rijdt 180 km. De eerste 75 km rijdt hij aan 50 km/u. ` +
          `Hoeveel kilometer moet hij daarna nog afleggen?`,
        answer: acceptedNumber(105, "km"),
      },
    ];
  }

  if (level === 4) {
    return [
      {
        category,
        question:
          `Een laptop kost €720. Eerst wordt de prijs met 15% verlaagd. ` +
          `Daarna komt er €25 administratiekost bij. Wat is de eindprijs?`,
        answer: acceptedMoney(637),
      },
      {
        category,
        question:
          `Een tank is voor 3/5 gevuld en bevat dan 84 liter. ` +
          `Wat is de volledige inhoud van de tank?`,
        answer: acceptedNumber(140, "liter"),
      },
      {
        category,
        question:
          `Voor 6 personen is 450 gram bloem nodig. ` +
          `Hoeveel gram bloem is nodig voor 14 personen?`,
        answer: acceptedNumber(1050, "gram"),
      },
      {
        category,
        question:
          `Een kaart heeft schaal 1 : 50 000. Twee plaatsen liggen 7,2 cm uit elkaar. ` +
          `Hoe groot is de werkelijke afstand in kilometer?`,
        answer: acceptedNumber(3.6, "km"),
      },
      {
        category,
        question:
          `Een trein vertrekt om 13:38. De rit duurt 2 uur en 47 minuten. ` +
          `Om hoe laat komt de trein aan?`,
        answer: ["16:25", "16.25"],
      },
      {
        category,
        question:
          `Een rechthoek heeft een oppervlakte van 192 cm² en een breedte van 12 cm. ` +
          `Bereken de omtrek.`,
        answer: acceptedNumber(56, "cm"),
      },
    ];
  }

  if (level === 5) {
    return [
      {
        category,
        question:
          `Een winkel verhoogt een prijs van €160 eerst met 12%. ` +
          `Tijdens een actie wordt op de nieuwe prijs 20% korting gegeven. ` +
          `Wat betaalt de klant uiteindelijk?`,
        answer: acceptedMoney(143.36),
      },
      {
        category,
        question:
          `Een klas maakt een uitstap. De bus kost €540. ` +
          `Daarnaast betaalt elke leerling €8,50 toegang. ` +
          `Er gaan 24 leerlingen mee. De school subsidieert €150. ` +
          `Hoeveel moet de klas zelf betalen?`,
        answer: acceptedMoney(594),
      },
      {
        category,
        question:
          `Van een voorraad wordt eerst 30% verkocht. Daarna wordt 1/4 van de rest verkocht. ` +
          `Welk percentage van de oorspronkelijke voorraad blijft over?`,
        answer: acceptedNumber(52.5, "%"),
      },
      {
        category,
        question:
          `Een auto rijdt 210 km in 2,5 uur. ` +
          `Daarna rijdt hij nog 90 km aan 60 km/u. ` +
          `Hoe lang duurt de volledige rit in uren?`,
        answer: acceptedNumber(4, "uur"),
      },
      {
        category,
        question:
          `Een vloer van 8,4 m bij 6 m wordt betegeld met vierkante tegels van 30 cm bij 30 cm. ` +
          `Hoeveel tegels zijn minimaal nodig?`,
        answer: "560",
      },
      {
        category,
        question:
          `Een leerling zegt: “20% korting en daarna 20% prijsstijging heffen elkaar op.” ` +
          `Is dat correct? Antwoord met ja of nee.`,
        answer: "nee",
      },
    ];
  }

  if (level === 6) {
    return [
      {
        category,
        question:
          `Een school koopt 18 tablets van €245 per stuk. ` +
          `Ze krijgt 8% korting op het totaal en betaalt daarna nog €120 leveringskosten. ` +
          `Hoeveel betaalt de school?`,
        answer: acceptedMoney(4177.2),
      },
      {
        category,
        question:
          `Een tank is voor 7/12 gevuld. Na toevoeging van 45 liter is hij voor 5/6 gevuld. ` +
          `Wat is de volledige inhoud van de tank?`,
        answer: acceptedNumber(180, "liter"),
      },
      {
        category,
        question:
          `Een rechthoekige tuin is 24 m lang en 15 m breed. ` +
          `In het midden ligt een vijver van 6 m bij 4 m. ` +
          `Hoeveel vierkante meter blijft over voor gras?`,
        answer: acceptedNumber(336, "m²"),
      },
      {
        category,
        question:
          `Een trein legt 360 km af. De eerste 2 uur rijdt hij gemiddeld 90 km/u. ` +
          `De rest van de afstand legt hij af in 1,5 uur. ` +
          `Wat is de gemiddelde snelheid tijdens het tweede deel?`,
        answer: acceptedNumber(120, "km/u"),
      },
      {
        category,
        question:
          `De verhouding jongens : meisjes is 5 : 7. ` +
          `Er zijn 36 leerlingen in totaal. Hoeveel meisjes zijn er?`,
        answer: "21",
      },
      {
        category,
        question:
          `Een product kost na 15% korting €102. ` +
          `Wat was de oorspronkelijke prijs?`,
        answer: acceptedMoney(120),
      },
    ];
  }

  if (level === 7) {
    return [
      {
        category,
        question:
          `Een organisatie verkoopt 180 tickets aan €14. ` +
          `De kosten bedragen €1650 plus €2,50 per bezoeker. ` +
          `Hoeveel winst maakt de organisatie?`,
        answer: acceptedMoney(420),
      },
      {
        category,
        question:
          `Een vat is voor 2/3 gevuld. Na het aftappen van 36 liter is het nog voor 5/12 gevuld. ` +
          `Wat is de volledige inhoud van het vat?`,
        answer: acceptedNumber(144, "liter"),
      },
      {
        category,
        question:
          `Een fiets kost €840. De prijs stijgt eerst met 6%. ` +
          `Daarna krijgt de klant 12% korting op de verhoogde prijs. ` +
          `Wat is de uiteindelijke prijs?`,
        answer: acceptedMoney(783.55),
      },
      {
        category,
        question:
          `Een rechthoek heeft een lengte die 4 cm groter is dan de breedte. ` +
          `De omtrek is 52 cm. Wat is de oppervlakte?`,
        answer: acceptedNumber(165, "cm²"),
      },
      {
        category,
        question:
          `Een mengsel bevat water en siroop in de verhouding 7 : 3. ` +
          `Er is 4,5 liter siroop. Hoeveel liter mengsel is er in totaal?`,
        answer: acceptedNumber(15, "liter"),
      },
      {
        category,
        question:
          `Een leerling berekent bij 25% korting: prijs ÷ 4. ` +
          `Bereken je daarmee de korting of de nieuwe prijs?`,
        answer: ["de korting", "korting"],
      },
    ];
  }

  if (level === 8) {
    return [
      {
        category,
        question:
          `Een bedrijf koopt materiaal voor €2400 exclusief 21% btw. ` +
          `Het krijgt daarna 7,5% korting op het bedrag inclusief btw. ` +
          `Hoeveel betaalt het bedrijf?`,
        answer: acceptedMoney(2686.2),
      },
      {
        category,
        question:
          `Een route bestaat uit drie delen. Het eerste deel is 35% van de totale route. ` +
          `Het tweede deel is 18 km en het derde deel 21 km. ` +
          `Hoe lang is de volledige route?`,
        answer: acceptedNumber(60, "km"),
      },
      {
        category,
        question:
          `Een rechthoekig lokaal heeft een oppervlakte van 96 m². ` +
          `De lengte is 4 m groter dan de breedte. ` +
          `Wat zijn de afmetingen? Antwoord bijvoorbeeld: 8 m en 12 m.`,
        answer: [
          "8 m en 12 m",
          "12 m en 8 m",
          "8 en 12",
          "12 en 8",
        ],
      },
      {
        category,
        question:
          `Een auto rijdt 120 km aan 80 km/u en daarna 180 km aan 90 km/u. ` +
          `Wat is de gemiddelde snelheid over de volledige rit?`,
        answer: acceptedNumber(85.71, "km/u"),
      },
      {
        category,
        question:
          `In een klas is 40% van de leerlingen meisje. ` +
          `Als er 6 meisjes bijkomen, is 50% van de klas meisje. ` +
          `Hoeveel leerlingen waren er oorspronkelijk?`,
        answer: "30",
      },
      {
        category,
        question:
          `Een model is op schaal 1 : 250. ` +
          `Een oppervlakte op het model is 12 cm². ` +
          `Hoe groot is de werkelijke oppervlakte in m²?`,
        answer: acceptedNumber(750, "m²"),
      },
    ];
  }

  if (level === 9) {
    return [
      {
        category,
        question:
          `Een evenement verkoopt 240 tickets. ` +
          `60% wordt verkocht aan €18, de rest aan €22. ` +
          `De totale kosten bedragen €3650. Hoeveel winst is er?`,
        answer: acceptedMoney(946),
      },
      {
        category,
        question:
          `Een tank is eerst voor 3/8 gevuld. Na toevoeging van 70 liter is hij voor 5/6 gevuld. ` +
          `Wat is de totale inhoud van de tank?`,
        answer: acceptedNumber(152.73, "liter"),
      },
      {
        category,
        question:
          `Een product stijgt eerst 18% in prijs en daalt daarna 15%. ` +
          `De eindprijs is €100,30. Wat was de oorspronkelijke prijs?`,
        answer: acceptedMoney(100),
      },
      {
        category,
        question:
          `Een rechthoekige tuin heeft een oppervlakte van 432 m². ` +
          `De lengte is 6 m langer dan de breedte. Wat is de omtrek?`,
        answer: acceptedNumber(84, "m"),
      },
      {
        category,
        question:
          `Een trein rijdt de helft van de afstand aan 80 km/u en de andere helft aan 120 km/u. ` +
          `Wat is de gemiddelde snelheid over de volledige afstand?`,
        answer: acceptedNumber(96, "km/u"),
      },
      {
        category,
        question:
          `Een leerling berekent een gemiddelde snelheid door 80 en 120 op te tellen en door 2 te delen. ` +
          `Is die methode in dit vraagstuk correct? Antwoord met ja of nee.`,
        answer: "nee",
      },
    ];
  }

  return [
    {
      category,
      question:
        `Een school organiseert een activiteit voor 180 leerlingen. ` +
        `De vaste kosten zijn €1250. Materiaal kost €6,40 per leerling. ` +
        `De school wil 12% winst maken op de totale kosten. ` +
        `Welke prijs per leerling moet minimaal gevraagd worden?`,
      answer: acceptedMoney(14.95),
    },
    {
      category,
      question:
        `Een tank is voor 7/15 gevuld. Na toevoeging van 96 liter is hij voor 11/15 gevuld. ` +
        `Daarna wordt 18% van de volledige inhoud afgetapt. ` +
        `Hoeveel liter blijft uiteindelijk in de tank?`,
      answer: acceptedNumber(204, "liter"),
    },
    {
      category,
      question:
        `Een artikel kost €250 exclusief 21% btw. ` +
        `Eerst geldt 8% korting op de prijs exclusief btw. ` +
        `Daarna wordt de btw berekend. Wat is de eindprijs?`,
      answer: acceptedMoney(278.3),
    },
    {
      category,
      question:
        `Een rechthoek heeft een lengte die 3 keer de breedte min 4 cm is. ` +
        `De omtrek is 72 cm. Wat is de oppervlakte?`,
      answer: acceptedNumber(243, "cm²"),
    },
    {
      category,
      question:
        `Een auto rijdt 150 km aan 75 km/u, houdt 30 minuten pauze ` +
        `en rijdt daarna 210 km aan 105 km/u. ` +
        `Wat is de gemiddelde snelheid over de volledige verstreken tijd, inclusief pauze?`,
      answer: acceptedNumber(80, "km/u"),
    },
    {
      category,
      question:
        `Een voorraad wordt eerst met 20% verhoogd. ` +
        `Daarna wordt 25% van de nieuwe voorraad verkocht. ` +
        `Er blijven 360 stuks over. Hoe groot was de oorspronkelijke voorraad?`,
      answer: "400",
    },
  ];
}

function generateMath(level: number, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];
  const category = `Wiskunde · niveau ${level}`;

  for (let index = 0; index < 6; index += 1) {
    if (level <= 2) {
      const a = randomInt(random, 20, 120 + level * 80);
      const b = randomInt(random, 10, 90 + level * 40);
      const minus = index % 2 === 1;
      exercises.push({
        category,
        question: minus
          ? `${Math.max(a, b)} - ${Math.min(a, b)} =`
          : `${a} + ${b} =`,
        answer: String(minus ? Math.abs(a - b) : a + b),
      });
    } else if (level <= 4) {
      const a = randomInt(random, 4, 12 + level);
      const b = randomInt(random, 3, 12 + level);
      exercises.push({
        category,
        question:
          index % 2 === 0
            ? `${a} × ${b} =`
            : `${a * b} ÷ ${a} =`,
        answer: String(index % 2 === 0 ? a * b : b),
      });
    } else if (level <= 6) {
      const denominator = pick(random, [2, 4, 5, 10]);
      const numerator = randomInt(random, 1, denominator - 1);
      const total = randomInt(random, 40, 200);
      const roundedTotal = Math.ceil(total / denominator) * denominator;
      exercises.push({
        category,
        question:
          index % 2 === 0
            ? `Hoeveel is ${numerator}/${denominator} van ${roundedTotal}?`
            : `Schrijf ${numerator}/${denominator} als kommagetal.`,
        answer:
          index % 2 === 0
            ? String((roundedTotal / denominator) * numerator)
            : [fraction(numerator, denominator), fraction(numerator, denominator).replace(".", ",")],
      });
    } else if (level <= 8) {
      const percentage = pick(random, [10, 15, 20, 25, 30, 40]);
      const base = randomInt(random, 4, 20) * 10;
      exercises.push({
        category,
        question:
          index % 2 === 0
            ? `Bereken ${percentage}% van ${base}.`
            : `Een product van €${base} krijgt ${percentage}% korting. Wat is de nieuwe prijs?`,
        answer:
          index % 2 === 0
            ? String((base * percentage) / 100)
            : [
                String(base - (base * percentage) / 100),
                `€${base - (base * percentage) / 100}`,
              ],
      });
    } else {
      const x = randomInt(random, 3, 15);
      const factor = randomInt(random, 2, 7);
      const add = randomInt(random, 4, 20);
      const result = factor * x + add;
      exercises.push({
        category,
        question:
          index % 2 === 0
            ? `Los op: ${factor}x + ${add} = ${result}`
            : `Een rechthoek heeft lengte ${x + level} cm en breedte ${x} cm. Bereken de oppervlakte.`,
        answer:
          index % 2 === 0
            ? [String(x), `x=${x}`, `x = ${x}`]
            : [`${(x + level) * x}`, `${(x + level) * x} cm²`, `${(x + level) * x} cm2`],
      });
    }
  }

  if (level >= 5) {
    const price = randomInt(random, 8, 25);
    const amount = randomInt(random, 3, 9);
    const discount = level >= 8 ? 10 : 0;
    const total = price * amount - discount;

    exercises.push({
      category: `Vraagstukken · niveau ${level}`,
      question:
        discount > 0
          ? `Een klas koopt ${amount} pakketten van €${price} en krijgt €${discount} korting. Hoeveel betaalt de klas?`
          : `Een klas koopt ${amount} pakketten van €${price}. Hoeveel betaalt de klas?`,
      answer: [String(total), `€${total}`, `${total} euro`],
    });
  }

  return exercises;
}

const frenchLevels: readonly (readonly [string, string | string[]])[][] = [
  [["de school", ["l'école", "l ecole"]], ["het boek", "le livre"], ["de tafel", "la table"], ["een vriend", "un ami"]],
  [["ik ben", "je suis"], ["jij hebt", "tu as"], ["wij gaan", "nous allons"], ["zij maken", "ils font"]],
  [["Ik woon in België.", ["J'habite en Belgique.", "J habite en Belgique"]], ["Wij spreken Frans.", "Nous parlons français."], ["Hij speelt voetbal.", "Il joue au football."], ["Zij leest een boek.", "Elle lit un livre."]],
  [["Ik ga niet naar school.", ["Je ne vais pas à l'école.", "Je ne vais pas a l ecole"]], ["Hij eet geen brood.", "Il ne mange pas de pain."], ["Wij hebben geen fiets.", "Nous n'avons pas de vélo."], ["Zij kijkt niet naar tv.", "Elle ne regarde pas la télé."]],
  [["Waar woon je?", ["Où habites-tu ?", "Ou habites-tu ?"]], ["Hoe laat is het?", ["Quelle heure est-il ?", "Quelle heure est il ?"]], ["Wat doe je?", ["Qu'est-ce que tu fais ?", "Qu est ce que tu fais ?"]], ["Waarom lach je?", ["Pourquoi ris-tu ?", "Pourquoi tu ris ?"]]],
  [["Gisteren speelde ik voetbal.", ["Hier, j'ai joué au football.", "Hier j ai joue au football"]], ["Wij hebben gegeten.", ["Nous avons mangé.", "Nous avons mange"]], ["Zij is vertrokken.", ["Elle est partie.", "Elle est partie"]], ["Hij heeft gewerkt.", ["Il a travaillé.", "Il a travaille"]]],
  [["Morgen zal ik studeren.", ["Demain, je vais étudier.", "Demain je vais etudier"]], ["Wij gaan een film bekijken.", ["Nous allons regarder un film.", "Nous allons regarder un film"]], ["Zij gaat haar kamer opruimen.", ["Elle va ranger sa chambre.", "Elle va ranger sa chambre"]], ["Jullie gaan vertrekken.", ["Vous allez partir.", "Vous allez partir"]]],
  [["Hoewel het regent, ga ik wandelen.", ["Bien qu'il pleuve, je vais me promener.", "Bien qu il pleuve je vais me promener"]], ["Omdat ik moe ben, slaap ik vroeg.", ["Parce que je suis fatigué, je dors tôt.", "Parce que je suis fatigue je dors tot"]], ["Ik denk dat hij gelijk heeft.", ["Je pense qu'il a raison.", "Je pense qu il a raison"]], ["We moeten ons haasten.", ["Nous devons nous dépêcher.", "Nous devons nous depecher"]]],
  [["Als ik tijd had, zou ik meer lezen.", ["Si j'avais le temps, je lirais davantage.", "Si j avais le temps je lirais davantage"]], ["Het boek dat ik lees is boeiend.", ["Le livre que je lis est passionnant.", "Le livre que je lis est passionnant"]], ["Ze zei dat ze later kwam.", ["Elle a dit qu'elle viendrait plus tard.", "Elle a dit qu elle viendrait plus tard"]], ["Hoewel hij studeerde, was de toets moeilijk.", ["Bien qu'il ait étudié, le test était difficile.", "Bien qu il ait etudie le test etait difficile"]]],
  [["Vat samen: de leerling wil duurzamer reizen.", ["L'élève veut voyager de manière plus durable.", "L eleve veut voyager de maniere plus durable"]], ["Geef je mening: sociale media kunnen nuttig zijn.", ["Les réseaux sociaux peuvent être utiles.", "Les reseaux sociaux peuvent etre utiles"]], ["Formuleer beleefd: kunt u mij helpen?", ["Pourriez-vous m'aider ?", "Pourriez vous m aider ?"]], ["Vertaal: ondanks de moeilijkheden gaf zij niet op.", ["Malgré les difficultés, elle n'a pas abandonné.", "Malgre les difficultes elle n a pas abandonne"]]],
];

function generateFrench(level: number, random: Random): ExerciseInput[] {
  return shuffle(random, frenchLevels[level - 1]).map(([dutch, french]) => ({
    category:
      level <= 2
        ? `Franse basis · niveau ${level}`
        : level <= 5
          ? `Zinnen en grammatica · niveau ${level}`
          : level <= 8
            ? `Tijden en verbanden · niveau ${level}`
            : `Franse taalvaardigheid · niveau ${level}`,
    question: `Vertaal naar het Frans: ${dutch}`,
    answer: french,
  }));
}

function generateGeneric(level: number, random: Random): ExerciseInput[] {
  const topics = [
    ["studieplanning", "Een goede planning verdeelt grote taken in kleinere stappen."],
    ["leren leren", "Actief ophalen uit het geheugen werkt beter dan alleen herlezen."],
    ["mediawijsheid", "Controleer auteur, datum en bron voordat je informatie vertrouwt."],
  ] as const;

  return shuffle(random, topics).map(([topic, answer]) => ({
    category: `Algemene vaardigheden · niveau ${level}`,
    question:
      level <= 4
        ? `Geef één belangrijke tip over ${topic}.`
        : `Leg in één zin uit waarom ${topic} belangrijk is.`,
    answer,
  }));
}

export function generateExercisesEerste(
  skill: string,
  requestedLevel: number,
  seed = Date.now()
): SecondaryExercise[] {
  const level = clampLevel(requestedLevel);
  const normalizedSkill = normalizeSkill(skill);
  const random = createRandom(seed + level * 1009);

  let inputs: ExerciseInput[];

  switch (normalizedSkill) {
    case "wiskunde-vraagstukken":
      inputs = generateMathWordProblems(level, random);
      break;
    case "begrijpend-lezen":
      inputs = generateReading(level, random);
      break;
    case "spelling":
      inputs = generateSpelling(level, random);
      break;
    case "wiskunde":
      inputs = generateMath(level, random);
      break;
    case "frans":
      inputs = generateFrench(level, random);
      break;
    default:
      inputs = generateGeneric(level, random);
      break;
  }

  return makeExercises(normalizedSkill, level, seed, inputs);
}
