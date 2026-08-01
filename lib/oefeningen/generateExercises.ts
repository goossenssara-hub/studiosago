import type { Exercise, LearningSubject } from "./types";
import { frenchByLevel, pvByLevel, spellingByLevel } from "./data";
import { makeRandom } from "./utils";

function exercise(
  id: string,
  subject: LearningSubject,
  skill: string,
  goalId: string,
  goalText: string,
  question: string,
  answer: string | string[],
  hint?: string
): Exercise {
  return { id, category: skill, subject, skill, goalId, goalText, question, answer, hint };
}

export function generateExercises(level: number, seed = Date.now()): Exercise[] {
  const items: Exercise[] = [];
  const levelIndex = Math.max(0, Math.min(level - 1, 9));
  const random = makeRandom(seed, level);

  for (let i = 1; i <= 8; i++) {
    const a = random(4 + level * 2, 9 + level * 4);
    const b = random(3 + level, 10 + level * 2);
    items.push(exercise(
      `maal-${level}-${seed}-${i}`,
      "Wiskunde",
      "Vermenigvuldigen",
      "WIS-6-BEW-01",
      "Vermenigvuldigingen vlot, nauwkeurig en doelgericht uitvoeren.",
      `${a} × ${b} =`,
      String(a * b),
      "Splits een moeilijke factor in kleinere delen."
    ));
  }

  for (let i = 1; i <= 8; i++) {
    const divisor = random(3 + level, 8 + level * 2);
    const quotient = random(10 + level * 10, 60 + level * 35);
    items.push(exercise(
      `delen-${level}-${seed}-${i}`,
      "Wiskunde",
      "Delen",
      "WIS-6-BEW-02",
      "Delingen met natuurlijke getallen correct uitvoeren.",
      `${divisor * quotient} ÷ ${divisor} =`,
      String(quotient),
      "Controleer met de omgekeerde bewerking."
    ));
  }

  for (let i = 1; i <= 6; i++) {
    const a = random(100 * level, 400 + level * 350);
    const b = random(80 * level, 300 + level * 250);
    const useMinus = level >= 4 && i % 2 === 0;
    items.push(exercise(
      `auto-${level}-${seed}-${i}`,
      "Wiskunde",
      "Getallenkennis",
      "WIS-6-GET-01",
      "Natuurlijke getallen flexibel optellen en aftrekken.",
      useMinus ? `${Math.max(a, b)} - ${Math.min(a, b)} =` : `${a} + ${b} =`,
      useMinus ? String(Math.max(a, b) - Math.min(a, b)) : String(a + b)
    ));
  }

  spellingByLevel[levelIndex].forEach(([word, correct], index) => {
    items.push(exercise(
      `spel-${level}-${seed}-${index}`,
      "Taal",
      "Spelling",
      "TAAL-6-SCH-01",
      "Spellingstrategieën toepassen bij meervoudsvormen.",
      `Schrijf het meervoud van: ${word}`,
      correct,
      "Luister naar de klank en denk aan verenkeling of verdubbeling."
    ));
  });

  pvByLevel[levelIndex].forEach((item, index) => {
    items.push(exercise(
      `pv-${level}-${seed}-${index}`,
      "Taal",
      "Persoonsvorm",
      "TAAL-6-TAALB-01",
      "De persoonsvorm herkennen en correct vervoegen.",
      item.question,
      item.answer,
      "Verander de zin van tijd of maak er een vraagzin van."
    ));
  });

  for (let i = 1; i <= 6; i++) {
    const price = random(5 + level * 2, 15 + level * 5);
    const amount = random(3 + level, 8 + level * 3);
    const discount = level * 3;
    const total = price * amount;
    const answer = level < 5 ? total : total - discount;
    items.push(exercise(
      `vraag-${level}-${seed}-${i}`,
      "Wiskunde",
      "Probleemoplossend denken",
      "WIS-6-PRO-01",
      "Een meerstapsprobleem analyseren en met passende bewerkingen oplossen.",
      level < 5
        ? `Een leerling koopt ${amount} items van €${price}. Hoeveel betaalt hij in totaal?`
        : `Een klas koopt ${amount} pakketten van €${price}. Ze krijgen €${discount} korting. Hoeveel betalen ze?`,
      [`${answer}`, `€${answer}`, `${answer} euro`],
      "Schrijf eerst de bewerkingen op die je nodig hebt."
    ));
  }

  frenchByLevel[levelIndex].forEach(([nl, fr], index) => {
    items.push(exercise(
      `fr-${level}-${seed}-${index}`,
      "Frans",
      "Woordenschat",
      "FR-6-WOORD-01",
      "Basiswoordenschat begrijpen en correct gebruiken.",
      level < 8 ? `Vertaal naar het Frans met lidwoord: ${nl}` : `Vertaal naar het Frans: ${nl}`,
      fr,
      "Denk ook aan het juiste lidwoord."
    ));
  });

  const wo: Array<[string, string | string[], string, string, string]> = [
    ["Welk kompaspunt ligt tegenover het oosten?", "west", "Ruimte", "WO-6-RUIMTE-01", "Kaarten, windrichtingen en ruimtelijke relaties gebruiken."],
    ["Hoe heet de kringloop waarbij water verdampt, condenseert en terug neerslaat?", ["waterkringloop", "de waterkringloop"], "Natuur", "WO-6-NAT-01", "Natuurlijke kringlopen beschrijven."],
    ["Welk orgaan zorgt vooral voor de ademhaling?", ["longen", "de longen"], "Mens", "WO-6-MENS-01", "Belangrijke lichaamsstelsels en hun functie herkennen."],
    ["Welke bestuurslaag staat het dichtst bij de inwoners: gemeente, provincie of federale overheid?", "gemeente", "Maatschappij", "WO-6-MAAT-01", "Basisinzicht tonen in maatschappelijke organisatie."],
    ["Welke hernieuwbare energiebron gebruikt bewegende lucht?", ["windenergie", "wind"], "Techniek en milieu", "WO-6-TECH-01", "Duurzame energiebronnen herkennen en vergelijken."],
    ["In welke eeuw ligt het jaar 1789?", ["18e eeuw", "achttiende eeuw", "18"], "Tijd", "WO-6-TIJD-01", "Jaartallen correct op een eeuw en tijdlijn plaatsen."],
    ["Hoe heet het proces waarbij planten licht omzetten in voedingsstoffen?", "fotosynthese", "Natuur", "WO-6-NAT-02", "Eenvoudige levensprocessen bij planten verklaren."],
    ["Welke schaal gebruik je om temperatuur in België meestal uit te drukken?", ["graden celsius", "celsius", "°c"], "Natuur", "WO-6-NAT-03", "Weer- en meetgegevens correct interpreteren."],
  ];

  wo.forEach(([question, answer, skill, goalId, goalText], index) => {
    items.push(exercise(
      `wo-${level}-${seed}-${index}`,
      "Wereldoriëntatie",
      skill,
      goalId,
      goalText,
      question,
      answer
    ));
  });

  return items.sort(() => random(0, 1000) - random(0, 1000));
}
