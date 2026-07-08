import type { Exercise } from "@/lib/oefeningen/types";

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
  category: string,
  question: string,
  answer: string | string[]
): Exercise {
  return {
    id: `vierde-${level}-${id}`,
    category,
    question,
    answer,
  };
}

export function generateExercisesVierde(level: number, seed = 1): Exercise[] {
  const random = seededRandom(seed + level * 1000);
  const exercises: Exercise[] = [];

  const maxNumber = 1000 + level * 800;

  for (let i = 1; i <= 8; i++) {
    const a = Math.floor(random() * maxNumber) + 100;
    const b = Math.floor(random() * maxNumber) + 100;

    exercises.push(
      createExercise(
        level,
        `optellen-${i}`,
        "Wiskunde",
        `${a} + ${b} =`,
        String(a + b)
      )
    );
  }

  for (let i = 1; i <= 8; i++) {
    const a = Math.floor(random() * maxNumber) + 500;
    const b = Math.floor(random() * a);

    exercises.push(
      createExercise(
        level,
        `aftrekken-${i}`,
        "Wiskunde",
        `${a} - ${b} =`,
        String(a - b)
      )
    );
  }

  for (let i = 1; i <= 8; i++) {
    const a = Math.floor(random() * 9) + 2;
    const b = Math.floor(random() * (8 + level)) + 2;

    exercises.push(
      createExercise(
        level,
        `maal-${i}`,
        "Wiskunde",
        `${a} × ${b} =`,
        String(a * b)
      )
    );
  }

  for (let i = 1; i <= 6; i++) {
    const divisor = Math.floor(random() * 9) + 2;
    const quotient = Math.floor(random() * (8 + level)) + 2;
    const total = divisor * quotient;

    exercises.push(
      createExercise(
        level,
        `delen-${i}`,
        "Wiskunde",
        `${total} : ${divisor} =`,
        String(quotient)
      )
    );
  }

  const breuken: [string, string][] = [
    ["1/2 van 48", "24"],
    ["1/4 van 80", "20"],
    ["1/3 van 60", "20"],
    ["1/5 van 100", "20"],
    ["1/10 van 250", "25"],
    ["1/2 van 96", "48"],
    ["1/4 van 120", "30"],
    ["1/3 van 90", "30"],
    ["3/4 van 100", "75"],
    ["2/5 van 50", "20"],
  ];

  shuffle(breuken, random)
    .slice(0, 6)
    .forEach(([vraag, antwoord], index) => {
      exercises.push(
        createExercise(
          level,
          `breuken-${index + 1}`,
          "Wiskunde",
          `Bereken: ${vraag} =`,
          antwoord
        )
      );
    });

  const meten: [string, string][] = [
    ["Hoeveel cm is 1 m?", "100"],
    ["Hoeveel m is 1 km?", "1000"],
    ["Hoeveel ml is 1 l?", "1000"],
    ["Hoeveel g is 1 kg?", "1000"],
    ["Hoeveel minuten zitten er in 1 uur?", "60"],
    ["Hoeveel seconden zitten er in 1 minuut?", "60"],
    ["Hoeveel kwartieren zitten er in 1 uur?", "4"],
    ["Hoeveel dagen zitten er in 2 weken?", "14"],
  ];

  shuffle(meten, random)
    .slice(0, 5)
    .forEach(([vraag, antwoord], index) => {
      exercises.push(
        createExercise(level, `meten-${index + 1}`, "Wiskunde", vraag, antwoord)
      );
    });

  const vraagstukken: [string, string | string[]][] = [
    [
      "Lina heeft 4 dozen met telkens 12 potloden. Hoeveel potloden heeft ze samen?",
      "48",
    ],
    [
      "Een boek telt 96 pagina's. Noor leest elke dag 12 pagina's. Na hoeveel dagen is het boek uit?",
      "8",
    ],
    [
      "Er zitten 125 stickers in een doos. Er worden 38 stickers uitgedeeld. Hoeveel blijven er over?",
      "87",
    ],
    [
      "Een klas spaart 6 weken lang telkens 15 euro. Hoeveel euro sparen ze samen?",
      "90",
    ],
    [
      "Een treinrit duurt 45 minuten. De rit start om 10:00. Hoe laat kom je aan?",
      ["10:45", "10u45"],
    ],
    ["Een brood kost €3. Je koopt 4 broden. Hoeveel betaal je?", "12"],
    [
      "In een doos zitten 8 zakjes met 6 knikkers. Hoeveel knikkers zijn dat samen?",
      "48",
    ],
  ];

  shuffle(vraagstukken, random)
    .slice(0, 5)
    .forEach(([vraag, antwoord], index) => {
      exercises.push(
        createExercise(level, `vraagstuk-${index + 1}`, "Wiskunde", vraag, antwoord)
      );
    });

  const taal: [string, string][] = [
    ["Ik ___ naar school. Kies: fiets / fietst", "fiets"],
    ["Hij ___ een brief. Kies: schrijf / schrijft", "schrijft"],
    ["Wij ___ buiten. Kies: spelen / speelt", "spelen"],
    ["Jij ___ goed mee. Kies: werk / werkt", "werkt"],
    ["De kinderen ___ naar huis. Kies: wandelen / wandelt", "wandelen"],
    ["Mama ___ soep. Kies: maak / maakt", "maakt"],
    ["De hond ___ luid. Kies: blaf / blaft", "blaft"],
    ["Ik ___ mijn boekentas. Kies: neem / neemt", "neem"],
    ["Zij ___ een lied. Kies: zing / zingt", "zingt"],
    ["Papa ___ de krant. Kies: lees / leest", "leest"],
  ];

  shuffle(taal, random)
    .slice(0, 8)
    .forEach(([vraag, antwoord], index) => {
      exercises.push(
        createExercise(level, `werkwoorden-${index + 1}`, "Taal", vraag, antwoord)
      );
    });

  const woordsoorten: [string, string][] = [
    ["Duid het zelfstandig naamwoord aan: De juf schrijft op het bord.", "juf"],
    ["Duid het werkwoord aan: De jongen loopt snel.", "loopt"],
    [
      "Duid het bijvoeglijk naamwoord aan: De groene jas hangt aan de kapstok.",
      "groene",
    ],
    ["Duid het zelfstandig naamwoord aan: De hond slaapt in de mand.", "hond"],
    ["Duid het werkwoord aan: Sara leest een spannend boek.", "leest"],
    ["Duid het bijvoeglijk naamwoord aan: Het kleine kind lacht.", "kleine"],
    ["Duid het zelfstandig naamwoord aan: De tafel staat in de keuken.", "tafel"],
    ["Duid het werkwoord aan: De vogels vliegen hoog.", "vliegen"],
  ];

  shuffle(woordsoorten, random)
    .slice(0, 6)
    .forEach(([vraag, antwoord], index) => {
      exercises.push(
        createExercise(level, `woordsoorten-${index + 1}`, "Taal", vraag, antwoord)
      );
    });

  const begrijpendLezen: [string, string[]][] = [
    [
      "Lotte neemt haar regenjas mee, want de lucht is donker. Waarom neemt Lotte haar regenjas mee?",
      [
        "Omdat het waarschijnlijk gaat regenen.",
        "omdat het gaat regenen",
        "het gaat regenen",
      ],
    ],
    [
      "Milan zet zijn wekker vroeger, want hij wil rustig ontbijten. Waarom zet Milan zijn wekker vroeger?",
      ["Omdat hij rustig wil ontbijten.", "rustig ontbijten"],
    ],
    [
      "De klas is stil, want de toets begint. Waarom is de klas stil?",
      ["Omdat de toets begint.", "de toets begint"],
    ],
    [
      "Noor doet haar jas uit, want ze heeft het warm. Waarom doet Noor haar jas uit?",
      ["Omdat ze het warm heeft.", "ze heeft het warm"],
    ],
  ];

  begrijpendLezen.forEach(([vraag, antwoord], index) => {
    exercises.push(
      createExercise(level, `begrijpend-lezen-${index + 1}`, "Taal", vraag, antwoord)
    );
  });

  const wo: [string, string | string[]][] = [
    ["Hoeveel seizoenen zijn er?", "4"],
    ["Op welke planeet leven wij?", ["Aarde", "de aarde"]],
    ["Hoe heet water in vaste vorm?", "ijs"],
    ["Welk kompaspunt ligt bovenaan een kaart?", "noord"],
    ["Hoeveel dagen telt een schrikkeljaar?", "366"],
    ["Welk orgaan pompt bloed rond?", "hart"],
    ["Welke kleur krijg je door blauw en geel te mengen?", "groen"],
    ["Hoe heet het jong van een koe?", "kalf"],
    ["Welke maand komt na maart?", "april"],
    ["Welke maand komt voor december?", "november"],
    ["Hoe noemen we iemand die in het verleden dingen onderzoekt?", "historicus"],
    ["Wat gebruik je om het noorden te vinden?", "kompas"],
    ["Welke energiebron komt van de zon?", ["zonne-energie", "zonneenergie"]],
    [
      "Wat hebben planten nodig om te groeien? Noem één ding.",
      ["water", "zonlicht", "licht", "lucht", "grond"],
    ],
  ];

  shuffle(wo, random)
    .slice(0, 8)
    .forEach(([vraag, antwoord], index) => {
      exercises.push(
        createExercise(
          level,
          `wereldorientatie-${index + 1}`,
          "Wereldoriëntatie",
          vraag,
          antwoord
        )
      );
    });

  return exercises;
}