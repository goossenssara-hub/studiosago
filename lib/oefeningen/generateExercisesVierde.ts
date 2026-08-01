import type { Exercise, LearningSubject } from "@/lib/oefeningen/types";

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return function random() {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  return [...items].sort(() => random() - 0.5);
}

function createExercise(
  level: number,
  id: string,
  subject: LearningSubject,
  skill: string,
  goalId: string,
  goalText: string,
  question: string,
  answer: string | string[],
  hint?: string
): Exercise {
  return {
    id: `vierde-${level}-${id}`,
    category: skill,
    subject,
    skill,
    goalId,
    goalText,
    question,
    answer,
    hint,
  };
}

export function generateExercisesVierde(level: number, seed = 1): Exercise[] {
  const random = seededRandom(seed + level * 1000);
  const exercises: Exercise[] = [];
  const maxNumber = 1000 + level * 800;

  for (let i = 1; i <= 6; i++) {
    const a = Math.floor(random() * maxNumber) + 100;
    const b = Math.floor(random() * maxNumber) + 100;
    exercises.push(
      createExercise(
        level,
        `optellen-${i}`,
        "Wiskunde",
        "Optellen",
        "WIS-4-GET-01",
        "Natuurlijke getallen doelgericht optellen.",
        `${a} + ${b} =`,
        String(a + b),
        "Werk stap voor stap: eenheden, tientallen en honderdtallen."
      )
    );
  }

  for (let i = 1; i <= 6; i++) {
    const a = Math.floor(random() * maxNumber) + 500;
    const b = Math.floor(random() * a);
    exercises.push(
      createExercise(
        level,
        `aftrekken-${i}`,
        "Wiskunde",
        "Aftrekken",
        "WIS-4-GET-02",
        "Natuurlijke getallen doelgericht aftrekken.",
        `${a} - ${b} =`,
        String(a - b),
        "Controleer je antwoord door opnieuw op te tellen."
      )
    );
  }

  for (let i = 1; i <= 6; i++) {
    const a = Math.floor(random() * 9) + 2;
    const b = Math.floor(random() * (8 + level)) + 2;
    exercises.push(
      createExercise(
        level,
        `maal-${i}`,
        "Wiskunde",
        "Vermenigvuldigen",
        "WIS-4-BEW-01",
        "Vermenigvuldigingen vlot en correct uitvoeren.",
        `${a} × ${b} =`,
        String(a * b),
        "Denk aan een gekende tafel en bouw van daaruit verder."
      )
    );
  }

  for (let i = 1; i <= 5; i++) {
    const divisor = Math.floor(random() * 9) + 2;
    const quotient = Math.floor(random() * (8 + level)) + 2;
    exercises.push(
      createExercise(
        level,
        `delen-${i}`,
        "Wiskunde",
        "Delen",
        "WIS-4-BEW-02",
        "Delingen begrijpen en correct oplossen.",
        `${divisor * quotient} : ${divisor} =`,
        String(quotient),
        "Welke vermenigvuldiging hoort bij deze deling?"
      )
    );
  }

  const meten: [string, string][] = [
    ["Hoeveel centimeter is 1 meter?", "100"],
    ["Hoeveel meter is 1 kilometer?", "1000"],
    ["Hoeveel milliliter is 1 liter?", "1000"],
    ["Hoeveel gram is 1 kilogram?", "1000"],
    ["Hoeveel minuten zitten er in 1 uur?", "60"],
    ["Hoeveel kwartieren zitten er in 1 uur?", "4"],
  ];

  shuffle(meten, random).forEach(([question, answer], index) => {
    exercises.push(
      createExercise(
        level,
        `meten-${index + 1}`,
        "Wiskunde",
        "Meten",
        "WIS-4-MET-01",
        "Courante maateenheden kennen en omzetten.",
        question,
        answer,
        "Schrijf eerst op welke eenheden je met elkaar vergelijkt."
      )
    );
  });

  const vraagstukken: [string, string | string[]][] = [
    ["Lina heeft 4 dozen met telkens 12 potloden. Hoeveel potloden heeft ze samen?", "48"],
    ["Een boek telt 96 pagina's. Noor leest elke dag 12 pagina's. Na hoeveel dagen is het boek uit?", "8"],
    ["Er zitten 125 stickers in een doos. Er worden 38 stickers uitgedeeld. Hoeveel blijven er over?", "87"],
    ["Een treinrit duurt 45 minuten. De rit start om 10:00. Hoe laat kom je aan?", ["10:45", "10u45"]],
  ];

  shuffle(vraagstukken, random).forEach(([question, answer], index) => {
    exercises.push(
      createExercise(
        level,
        `vraagstuk-${index + 1}`,
        "Wiskunde",
        "Probleemoplossend denken",
        "WIS-4-PRO-01",
        "Een passende bewerking kiezen bij een eenvoudig probleem.",
        question,
        answer,
        "Markeer wat je weet en wat je precies moet zoeken."
      )
    );
  });

  const werkwoorden: [string, string][] = [
    ["Ik ___ naar school. Kies: fiets / fietst", "fiets"],
    ["Hij ___ een brief. Kies: schrijf / schrijft", "schrijft"],
    ["Wij ___ buiten. Kies: spelen / speelt", "spelen"],
    ["Jij ___ goed mee. Kies: werk / werkt", "werkt"],
    ["De kinderen ___ naar huis. Kies: wandelen / wandelt", "wandelen"],
    ["Mama ___ soep. Kies: maak / maakt", "maakt"],
  ];

  shuffle(werkwoorden, random).forEach(([question, answer], index) => {
    exercises.push(
      createExercise(
        level,
        `werkwoorden-${index + 1}`,
        "Taal",
        "Werkwoorden",
        "TAAL-4-SCH-01",
        "Werkwoordsvormen in een zin correct gebruiken.",
        question,
        answer,
        "Zoek eerst wie of wat iets doet."
      )
    );
  });

  const woordsoorten: [string, string][] = [
    ["Duid het zelfstandig naamwoord aan: De juf schrijft op het bord.", "juf"],
    ["Duid het werkwoord aan: De jongen loopt snel.", "loopt"],
    ["Duid het bijvoeglijk naamwoord aan: De groene jas hangt aan de kapstok.", "groene"],
    ["Duid het zelfstandig naamwoord aan: De hond slaapt in de mand.", "hond"],
    ["Duid het werkwoord aan: Sara leest een spannend boek.", "leest"],
  ];

  shuffle(woordsoorten, random).forEach(([question, answer], index) => {
    exercises.push(
      createExercise(
        level,
        `woordsoorten-${index + 1}`,
        "Taal",
        "Woordsoorten",
        "TAAL-4-TAALB-01",
        "Veelgebruikte woordsoorten in een zin herkennen.",
        question,
        answer,
        "Vraag jezelf af: is het een persoon, dier, ding, eigenschap of handeling?"
      )
    );
  });

  const begrijpendLezen: [string, string[]][] = [
    [
      "Lotte neemt haar regenjas mee, want de lucht is donker. Waarom neemt Lotte haar regenjas mee?",
      ["omdat het waarschijnlijk gaat regenen", "omdat het gaat regenen", "het gaat regenen"],
    ],
    [
      "Milan zet zijn wekker vroeger, want hij wil rustig ontbijten. Waarom zet Milan zijn wekker vroeger?",
      ["omdat hij rustig wil ontbijten", "rustig ontbijten"],
    ],
    [
      "De klas is stil, want de toets begint. Waarom is de klas stil?",
      ["omdat de toets begint", "de toets begint"],
    ],
  ];

  begrijpendLezen.forEach(([question, answer], index) => {
    exercises.push(
      createExercise(
        level,
        `begrijpend-lezen-${index + 1}`,
        "Taal",
        "Begrijpend lezen",
        "TAAL-4-LEZ-01",
        "Expliciete informatie en eenvoudige verbanden uit een tekst halen.",
        question,
        answer,
        "Lees de zin opnieuw en zoek het woord ‘want’."
      )
    );
  });

  const woItems: Array<{
    question: string;
    answer: string | string[];
    skill: string;
    goalId: string;
    goalText: string;
  }> = [
    { question: "Hoeveel seizoenen zijn er?", answer: "4", skill: "Tijd", goalId: "WO-4-TIJD-01", goalText: "Tijd cyclisch ordenen met maanden en seizoenen." },
    { question: "Op welke planeet leven wij?", answer: ["aarde", "de aarde"], skill: "Natuur", goalId: "WO-4-NAT-01", goalText: "Basiskennis over aarde en natuur gebruiken." },
    { question: "Hoe heet water in vaste vorm?", answer: "ijs", skill: "Natuur", goalId: "WO-4-NAT-02", goalText: "Toestanden van water herkennen." },
    { question: "Welk kompaspunt ligt bovenaan een kaart?", answer: "noord", skill: "Ruimte", goalId: "WO-4-RUIMTE-01", goalText: "Zich oriënteren met kaart en windrichtingen." },
    { question: "Welk orgaan pompt bloed rond?", answer: "hart", skill: "Mens", goalId: "WO-4-MENS-01", goalText: "Belangrijke organen en hun functie herkennen." },
    { question: "Welke energiebron komt van de zon?", answer: ["zonne-energie", "zonneenergie"], skill: "Techniek en milieu", goalId: "WO-4-TECH-01", goalText: "Voorbeelden van duurzame energie herkennen." },
    { question: "Wat gebruik je om het noorden te vinden?", answer: "kompas", skill: "Ruimte", goalId: "WO-4-RUIMTE-01", goalText: "Zich oriënteren met kaart en windrichtingen." },
    { question: "Wat hebben planten nodig om te groeien? Noem één ding.", answer: ["water", "zonlicht", "licht", "lucht", "grond"], skill: "Natuur", goalId: "WO-4-NAT-03", goalText: "Voorwaarden voor groei van planten herkennen." },
  ];

  shuffle(woItems, random).forEach((item, index) => {
    exercises.push(
      createExercise(
        level,
        `wereldorientatie-${index + 1}`,
        "Wereldoriëntatie",
        item.skill,
        item.goalId,
        item.goalText,
        item.question,
        item.answer
      )
    );
  });

  return shuffle(exercises, random);
}
