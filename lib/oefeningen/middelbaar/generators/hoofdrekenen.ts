import {
  acceptedNumber,
  mc,
  randomInt,
  shuffle,
  type ExerciseInput,
  type Random,
} from "./shared";

function categoryFor(level: number) {
  return `Hoofdrekenen · niveau ${level}`;
}

function decimal(value: number) {
  return acceptedNumber(value);
}

function createLevelOne(category: string, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];

  for (let index = 0; index < 12; index += 1) {
    const a = randomInt(random, 120, 950);
    const b = randomInt(random, 40, 390);
    exercises.push({ category, question: `${a} + ${b} =`, answer: String(a + b) });
    exercises.push({ category, question: `${a + b} - ${b} =`, answer: String(a) });
  }

  for (let index = 0; index < 10; index += 1) {
    const a = randomInt(random, 12, 48);
    const b = randomInt(random, 3, 15);
    exercises.push({ category, question: `${a} × ${b} =`, answer: String(a * b) });
    exercises.push({ category, question: `${a * b} ÷ ${b} =`, answer: String(a) });
  }

  exercises.push(
    mc(category, "Welke uitkomst is correct voor 8 + 3 × 4?", ["44", "20", "23", "32"], "20"),
    mc(category, "Welke bewerking komt eerst bij 36 - 4 × 7?", ["aftrekken", "vermenigvuldigen", "beide tegelijk", "delen"], "vermenigvuldigen"),
    { category, question: "Rond 647 af op het dichtstbijzijnde honderdtal.", answer: "600" },
    { category, question: "Rond 2 748 af op het dichtstbijzijnde duizendtal.", answer: "3000" },
    { category, question: "Schat 487 + 326 door af te ronden op honderdtallen.", answer: "800" },
    { category, question: "De helft van 860 =", answer: "430" }
  );

  return exercises;
}

function createLevelTwo(category: string, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];

  for (let index = 0; index < 12; index += 1) {
    const a = randomInt(random, 1500, 9500);
    const b = randomInt(random, 500, 4800);
    exercises.push({ category, question: `${a} + ${b} =`, answer: String(a + b) });
    exercises.push({ category, question: `${a + b} - ${b} =`, answer: String(a) });
  }

  for (let index = 0; index < 10; index += 1) {
    const a = randomInt(random, 21, 85);
    const b = randomInt(random, 12, 35);
    exercises.push({ category, question: `${a} × ${b} =`, answer: String(a * b) });
    exercises.push({ category, question: `${a * b} ÷ ${b} =`, answer: String(a) });
  }

  exercises.push(
    { category, question: "48 × 25 =", answer: "1200" },
    { category, question: "125 × 32 =", answer: "4000" },
    { category, question: "99 × 46 =", answer: "4554" },
    { category, question: "1 001 - 487 =", answer: "514" },
    mc(category, "Welke strategie is handig voor 99 × 37?", ["100 × 37 - 37", "90 × 37 + 99", "37 ÷ 99", "99 + 37"], "100 × 37 - 37"),
    mc(category, "Welke uitkomst is correct voor 240 ÷ 8 + 17?", ["47", "32", "257", "13"], "47")
  );

  return exercises;
}

function createLevelThree(category: string, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];

  for (let index = 0; index < 15; index += 1) {
    const a = randomInt(random, 50, 500) / 10;
    const b = randomInt(random, 10, 250) / 10;
    exercises.push({ category, question: `${a.toFixed(1).replace(".", ",")} + ${b.toFixed(1).replace(".", ",")} =`, answer: decimal(a + b) });
    exercises.push({ category, question: `${(a + b).toFixed(1).replace(".", ",")} - ${b.toFixed(1).replace(".", ",")} =`, answer: decimal(a) });
  }

  for (let index = 0; index < 8; index += 1) {
    const base = randomInt(random, 8, 80);
    exercises.push({ category, question: `${(base / 10).toFixed(1).replace(".", ",")} × 10 =`, answer: decimal(base) });
    exercises.push({ category, question: `${base} ÷ 10 =`, answer: decimal(base / 10) });
  }

  exercises.push(
    { category, question: "3,6 × 25 =", answer: decimal(90) },
    { category, question: "84 ÷ 0,7 =", answer: decimal(120) },
    { category, question: "12,5% van 320 =", answer: decimal(40) },
    { category, question: "0,75 van 240 =", answer: decimal(180) },
    mc(category, "Welke uitkomst is correct voor 6,4 + 2 × 3,5?", ["29,4", "13,4", "19,8", "9,9"], "13,4")
  );

  return exercises;
}

function createLevelFour(category: string, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];

  for (let index = 0; index < 14; index += 1) {
    const a = randomInt(random, -90, 90);
    const b = randomInt(random, -60, 60);
    exercises.push({ category, question: `${a} + (${b}) =`, answer: String(a + b) });
    exercises.push({ category, question: `${a} - (${b}) =`, answer: String(a - b) });
  }

  for (let index = 0; index < 10; index += 1) {
    const a = randomInt(random, -15, 15) || 4;
    const b = randomInt(random, -12, 12) || -3;
    exercises.push({ category, question: `${a} × ${b} =`, answer: String(a * b) });
  }

  exercises.push(
    { category, question: "4² + 3³ =", answer: "43" },
    { category, question: "5³ - 7² =", answer: "76" },
    { category, question: "(-6)² =", answer: "36" },
    { category, question: "144 ÷ (-9) =", answer: "-16" },
    mc(category, "Welke uitkomst is correct voor -6 + 4 × 5?", ["-10", "14", "26", "-50"], "14"),
    mc(category, "Welke waarde is het kleinst?", ["-9", "-4", "0", "7"], "-9")
  );

  return exercises;
}

function createLevelFive(category: string, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];

  for (let index = 0; index < 18; index += 1) {
    const a = randomInt(random, 20, 160);
    const b = randomInt(random, 5, 60);
    const c = randomInt(random, 2, 12);
    exercises.push({ category, question: `(${a} + ${b}) ÷ ${c} =`, answer: decimal((a + b) / c) });
    exercises.push({ category, question: `${a} - ${c} × ${b} =`, answer: String(a - c * b) });
  }

  exercises.push(
    { category, question: "3 × (25 - 8) + 14 =", answer: "65" },
    { category, question: "2,5 × (16 + 4) =", answer: decimal(50) },
    { category, question: "15% van 480 + 28 =", answer: decimal(100) },
    { category, question: "180 ÷ (6 + 4) × 3 =", answer: "54" },
    mc(category, "Welke bewerking komt eerst bij 72 ÷ 8 + 3 × 5?", ["optellen", "delen en vermenigvuldigen", "alleen delen", "alleen vermenigvuldigen"], "delen en vermenigvuldigen"),
    mc(category, "Wat is de juiste uitkomst van 6 + 2 × (9 - 4)?", ["40", "16", "32", "13"], "16")
  );

  return exercises;
}

function createLevelSix(category: string, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];
  const fractions = [[1, 2], [1, 4], [3, 4], [2, 5], [3, 5], [5, 8], [7, 10]] as const;

  for (let index = 0; index < 28; index += 1) {
    const [numerator, denominator] = fractions[index % fractions.length];
    const factor = randomInt(random, 4, 30);
    const total = denominator * factor;
    exercises.push({ category, question: `${numerator}/${denominator} van ${total} =`, answer: String(numerator * factor) });
  }

  const percentages = [10, 12.5, 20, 25, 37.5, 50, 75];
  percentages.forEach((percentage, index) => {
    const total = 80 + index * 80;
    exercises.push({ category, question: `${String(percentage).replace(".", ",")}% van ${total} =`, answer: decimal((percentage / 100) * total) });
  });

  exercises.push(
    { category, question: "1,25 × 48 =", answer: decimal(60) },
    { category, question: "2³ × 5² =", answer: "200" },
    { category, question: "0,375 × 800 =", answer: decimal(300) },
    mc(category, "Welke waarde is gelijk aan 0,375?", ["3/8", "3/5", "5/8", "7/20"], "3/8"),
    mc(category, "Welke waarde is gelijk aan 62,5%?", ["5/8", "3/5", "2/3", "7/8"], "5/8")
  );

  return exercises;
}

function createLevelSeven(category: string, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];

  for (let index = 0; index < 15; index += 1) {
    const root = randomInt(random, 4, 18);
    const power = randomInt(random, 2, 5);
    exercises.push({ category, question: `√${root * root} + ${power}² =`, answer: String(root + power * power) });
  }

  for (let index = 0; index < 15; index += 1) {
    const a = randomInt(random, 20, 90) / 10;
    const b = randomInt(random, 5, 35) / 10;
    const c = randomInt(random, 4, 18);
    exercises.push({ category, question: `(${a.toFixed(1).replace(".", ",")} - ${b.toFixed(1).replace(".", ",")}) × ${c} =`, answer: decimal((a - b) * c) });
  }

  exercises.push(
    { category, question: "2⁵ - 3³ =", answer: "5" },
    { category, question: "(-4)² - 5 × 3 =", answer: "1" },
    { category, question: "1/3 van 270 + 18% van 200 =", answer: "126" },
    { category, question: "√196 + 3² =", answer: "23" },
    mc(category, "Welke schatting ligt het dichtst bij 49,8 × 19,7?", ["100", "500", "1 000", "2 000"], "1 000"),
    mc(category, "Welke uitkomst is correct voor 2⁴ × 3 - √81?", ["39", "21", "57", "9"], "39")
  );

  return exercises;
}

function createLevelEight(category: string, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];

  for (let index = 0; index < 15; index += 1) {
    const base = randomInt(random, 2, 8);
    const exponent = randomInt(random, 2, 4);
    const subtract = randomInt(random, 5, 45);
    exercises.push({ category, question: `2 × ${base}^${exponent} - ${subtract} =`, answer: String(2 * base ** exponent - subtract) });
  }

  for (let index = 0; index < 15; index += 1) {
    const percentage = [12.5, 20, 25, 37.5, 62.5, 75][index % 6];
    const total = 160 + index * 40;
    exercises.push({ category, question: `${String(percentage).replace(".", ",")}% van ${total} =`, answer: decimal((percentage / 100) * total) });
  }

  exercises.push(
    { category, question: "2 × 3⁴ - 5² =", answer: "137" },
    { category, question: "(144 ÷ 12)² - 44 =", answer: "100" },
    { category, question: "0,125 × 640 =", answer: "80" },
    { category, question: "5/6 van 360 - 12,5% van 320 =", answer: "260" },
    mc(category, "Welke waarde is gelijk aan 2⁻³?", ["1/8", "-8", "8", "-1/8"], "1/8"),
    mc(category, "Welke uitkomst is correct voor √225 + 2⁵?", ["47", "49", "17", "225"], "47")
  );

  return exercises;
}

function createLevelNine(category: string, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];

  for (let index = 0; index < 16; index += 1) {
    const start = randomInt(random, 200, 1600);
    const percentage = [4, 5, 8, 10, 12, 15, 20, 25][index % 8];
    exercises.push({ category, question: `${start} stijgt met ${percentage}%. Nieuwe waarde?`, answer: decimal(start * (1 + percentage / 100)) });
    exercises.push({ category, question: `${start} daalt met ${percentage}%. Nieuwe waarde?`, answer: decimal(start * (1 - percentage / 100)) });
  }

  exercises.push(
    { category, question: "1,08 × 1,05 × 500 =", answer: decimal(567) },
    { category, question: "25% van 640 + 3/8 van 320 =", answer: "280" },
    { category, question: "(2³ + 3²)² =", answer: "289" },
    { category, question: "√0,81 × 100 =", answer: decimal(90) },
    mc(category, "Een stijging van 10% gevolgd door een daling van 10% geeft…", ["dezelfde waarde", "1% lager", "1% hoger", "10% lager"], "1% lager"),
    mc(category, "Welke groeifactor hoort bij 7,5% stijging?", ["1,075", "0,925", "1,75", "0,075"], "1,075")
  );

  return exercises;
}

function createLevelTen(category: string, random: Random): ExerciseInput[] {
  const exercises: ExerciseInput[] = [];

  for (let index = 0; index < 18; index += 1) {
    const start = randomInt(random, 500, 5000);
    const rate = [1.5, 2, 2.5, 3, 4, 5][index % 6];
    const years = 2 + (index % 4);
    exercises.push({
      category,
      question: `${start} groeit ${rate}% per periode gedurende ${years} periodes. Eindwaarde?`,
      answer: decimal(start * (1 + rate / 100) ** years),
    });
  }

  for (let index = 0; index < 12; index += 1) {
    const a = randomInt(random, 2, 9);
    const b = randomInt(random, 2, 5);
    const c = randomInt(random, 2, 8);
    exercises.push({ category, question: `(${a}² + ${b}³) ÷ ${c} =`, answer: decimal((a ** 2 + b ** 3) / c) });
  }

  exercises.push(
    { category, question: "1,025⁴ × 2 000 =", answer: decimal(2207.63) },
    { category, question: "(3/4 + 0,625) × 80 =", answer: decimal(110) },
    { category, question: "√625 ÷ 5 + 2⁶ =", answer: "69" },
    { category, question: "Een waarde daalt 20% en stijgt daarna 25%. Netto verandering?", answer: decimal(0) },
    mc(category, "Welke uitdrukking is gelijk aan 16?", ["2⁴", "4³", "√16", "2⁵"], "2⁴"),
    mc(category, "Welke factor hoort bij twee opeenvolgende stijgingen van 5%?", ["1,10", "1,1025", "1,05", "1,25"], "1,1025")
  );

  return exercises;
}

export function generateHoofdrekenen(
  level: number,
  random: Random
): ExerciseInput[] {
  const category = categoryFor(level);

  const exercises = (() => {
    switch (level) {
      case 1: return createLevelOne(category, random);
      case 2: return createLevelTwo(category, random);
      case 3: return createLevelThree(category, random);
      case 4: return createLevelFour(category, random);
      case 5: return createLevelFive(category, random);
      case 6: return createLevelSix(category, random);
      case 7: return createLevelSeven(category, random);
      case 8: return createLevelEight(category, random);
      case 9: return createLevelNine(category, random);
      case 10: return createLevelTen(category, random);
      default: return createLevelOne(category, random);
    }
  })();

  return shuffle(random, exercises).slice(0, 50);
}
