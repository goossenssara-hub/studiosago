import {
  acceptedNumber,
  mc,
  randomInt,
  shuffle,
  type ExerciseInput,
  type Random,
} from "./shared";

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

function fraction(numerator: number, denominator: number): string {
  if (denominator < 0) {
    numerator *= -1;
    denominator *= -1;
  }
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  return d === 1 ? String(n) : `${n}/${d}`;
}

function mixedOrImproper(numerator: number, denominator: number): string[] {
  const simple = fraction(numerator, denominator);
  const n = Number(simple.split("/")[0]);
  const d = simple.includes("/") ? Number(simple.split("/")[1]) : 1;
  if (d === 1 || Math.abs(n) < d) return [simple];

  const whole = Math.trunc(n / d);
  const rest = Math.abs(n % d);
  if (rest === 0) return [String(whole)];
  return [simple, `${whole} ${rest}/${d}`];
}

function decimal(value: number): string[] {
  return acceptedNumber(value);
}

export function generateBreuken(level: number, random: Random): ExerciseInput[] {
  const category = `Breuken en kommagetallen · niveau ${level}`;
  const exercises: ExerciseInput[] = [];

  if (level === 1) {
    const d1 = randomInt(random, 4, 12);
    const n1 = randomInt(random, 1, d1 - 1);
    const factor = randomInt(random, 2, 5);
    const twentieths = randomInt(random, 1, 19);
    const hundredths = randomInt(random, 5, 95);

    exercises.push(
      mc(category, `Welke breuk is gelijkwaardig aan ${n1}/${d1}?`, shuffle(random, [`${n1 * factor}/${d1 * factor}`, `${n1 + 1}/${d1}`, `${n1}/${d1 + 1}`, `${n1 * factor}/${d1 * (factor + 1)}`]), `${n1 * factor}/${d1 * factor}`),
      { category, question: `Vereenvoudig ${n1 * factor}/${d1 * factor}.`, answer: fraction(n1, d1) },
      { category, question: `Schrijf ${twentieths}/20 als kommagetal.`, answer: decimal(twentieths / 20) },
      { category, question: `Schrijf 0,${String(hundredths).padStart(2, "0")} als breuk en vereenvoudig.`, answer: fraction(hundredths, 100) },
      mc(category, "Welke breuk is precies gelijk aan 0,5?", ["1/2", "1/3", "2/5", "3/5"], "1/2"),
      mc(category, "Welke waarde is het grootst?", ["0,6", "5/8", "3/5", "0,58"], "5/8"),
      { category, question: "Rangschik van klein naar groot: 0,25 – 1/2 – 0,75.", answer: ["0,25 1/2 0,75", "0,25 - 1/2 - 0,75"] },
      { category, question: "Schrijf 1,5 als gemengd getal.", answer: ["1 1/2", "1½"] },
      { category, question: "Welke breuk hoort bij 3 van de 8 gelijke delen?", answer: "3/8" },
      { category, question: "Hoeveel honderdsten zijn gelijk aan 0,37?", answer: "37" },
      mc(category, "Welke uitspraak is waar?", ["3/4 = 0,75", "2/5 = 0,25", "1/8 = 0,8", "5/10 = 0,05"], "3/4 = 0,75"),
      { category, question: "Vul aan: 2/3 = ?/12.", answer: "8" },
      { category, question: "Vul aan: 5/10 = 1/?.", answer: "2" },
      mc(category, "Welke breuk is kleiner dan 1/2?", ["3/8", "5/8", "4/7", "2/3"], "3/8"),
      { category, question: "Schrijf 2,25 als gemengd getal.", answer: ["2 1/4", "2¼"] }
    );
  } else if (level === 2) {
    const d = randomInt(random, 5, 14);
    const a = randomInt(random, 1, d - 2);
    const b = randomInt(random, 1, d - a);
    exercises.push(
      { category, question: `${a}/${d} + ${b}/${d} =`, answer: fraction(a + b, d) },
      { category, question: `${a + b}/${d} - ${a}/${d} =`, answer: fraction(b, d) },
      { category, question: "3/10 + 4/10 =", answer: "7/10" },
      { category, question: "11/12 - 5/12 =", answer: "1/2" },
      { category, question: "2,45 + 3,8 =", answer: decimal(6.25) },
      { category, question: "7,2 - 4,675 =", answer: decimal(2.525) },
      { category, question: "4,8 + 0,76 =", answer: decimal(5.56) },
      { category, question: "10 - 3,875 =", answer: decimal(6.125) },
      mc(category, "Welke breuk is kleiner dan 0,4?", ["3/8", "2/5", "5/12", "7/16"], "3/8"),
      { category, question: "Schrijf 0,125 als breuk.", answer: "1/8" },
      { category, question: "Schrijf 7/8 als kommagetal.", answer: decimal(0.875) },
      { category, question: "Vul aan: 3/5 = ?/20.", answer: "12" },
      mc(category, "Welke waarde ligt tussen 0,6 en 0,7?", ["2/3", "3/5", "3/4", "7/10"], "2/3"),
      { category, question: "Rangschik van klein naar groot: 3/4 – 0,6 – 0,85.", answer: ["0,6 3/4 0,85", "0,6 - 3/4 - 0,85"] },
      { category, question: "Schrijf 1,375 als gemengd getal.", answer: ["1 3/8", "1⅜"] }
    );
  } else if (level === 3) {
    exercises.push(
      { category, question: "3/4 + 2/5 =", answer: mixedOrImproper(23, 20) },
      { category, question: "7/8 - 1/6 =", answer: "17/24" },
      { category, question: "2 1/3 + 1 5/6 =", answer: ["25/6", "4 1/6"] },
      { category, question: "3 1/4 - 1 2/3 =", answer: ["19/12", "1 7/12"] },
      { category, question: "3,75 ÷ 0,5 =", answer: decimal(7.5) },
      { category, question: "2,4 × 0,75 =", answer: decimal(1.8) },
      mc(category, "Welke berekening geeft 5/6 van 72?", ["72 ÷ 6 × 5", "72 ÷ 5 × 6", "72 × 6 × 5", "72 - 6 × 5"], "72 ÷ 6 × 5"),
      { category, question: "Bereken 3/5 van 85.", answer: "51" },
      { category, question: "Zet 2,375 om in een breuk.", answer: ["19/8", "2 3/8"] },
      { category, question: "Zet 1,625 om in een breuk.", answer: ["13/8", "1 5/8"] },
      mc(category, "Welke breuk ligt het dichtst bij 0,7?", ["7/10", "2/3", "3/4", "5/8"], "7/10"),
      { category, question: "5/12 + 7/18 =", answer: "29/36" },
      { category, question: "11/15 - 2/9 =", answer: "23/45" },
      { category, question: "1,2 + 3/5 =", answer: decimal(1.8) },
      { category, question: "2 3/5 als kommagetal =", answer: decimal(2.6) }
    );
  } else if (level === 4) {
    exercises.push(
      { category, question: "5/6 × 9/10 =", answer: "3/4" },
      { category, question: "7/8 ÷ 14/15 =", answer: "15/16" },
      { category, question: "1 3/5 × 2 1/4 =", answer: ["18/5", "3 3/5"] },
      { category, question: "3 1/2 ÷ 1 3/4 =", answer: "2" },
      { category, question: "4,2 ÷ 0,07 =", answer: "60" },
      { category, question: "0,36 × 2,5 =", answer: decimal(0.9) },
      mc(category, "Welke uitspraak is waar?", ["0,333… = 1/3", "0,6 = 2/5", "0,25 = 1/5", "1,2 = 6/10"], "0,333… = 1/3"),
      { category, question: "Bereken 2 1/3 - 5/8.", answer: ["41/24", "1 17/24"] },
      { category, question: "Bereken 3/7 × 14/15.", answer: "2/5" },
      { category, question: "Bereken 5/12 ÷ 10/9.", answer: "3/8" },
      { category, question: "Schrijf 0,045 als breuk.", answer: "9/200" },
      { category, question: "Schrijf 2,04 als breuk.", answer: ["51/25", "2 1/25"] },
      mc(category, "Welke waarde is gelijk aan 7/20?", ["0,35", "0,28", "0,7", "0,14"], "0,35"),
      { category, question: "1 - 7/12 =", answer: "5/12" },
      { category, question: "2,75 + 1 1/4 =", answer: "4" }
    );
  } else if (level === 5) {
    exercises.push(
      { category, question: "Los op: x + 3/5 = 7/4.", answer: ["23/20", "1,15"] },
      { category, question: "Los op: 2/3 x = 14.", answer: "21" },
      { category, question: "Los op: x/5 + 3/10 = 9/10.", answer: "3" },
      { category, question: "Bereken: 1 ÷ (3/8).", answer: "8/3" },
      { category, question: "Schrijf 0,0375 als breuk.", answer: "3/80" },
      mc(category, "Welke breuk ligt tussen 2/3 en 3/4?", ["7/10", "4/5", "3/5", "5/8"], "7/10"),
      { category, question: "Bereken: 5/12 + 7/18.", answer: "29/36" },
      { category, question: "Bereken: (3/4 + 5/6) × 2.", answer: "19/6" },
      { category, question: "Bereken: 2,4 × 5/8.", answer: decimal(1.5) },
      { category, question: "Schrijf 0,272727… als breuk.", answer: "3/11" },
      mc(category, "Welke is rationaal?", ["√2", "π", "0,125", "√7"], "0,125"),
      { category, question: "Bereken: 4 2/5 ÷ 1 1/10.", answer: "4" },
      { category, question: "Los op: 5/6 x = 25.", answer: "30" },
      { category, question: "Bereken: 7/9 van 126.", answer: "98" },
      { category, question: "Een getal is 3/5 van 45. Welk getal?", answer: "27" }
    );
  } else if (level === 6) {
    exercises.push(
      { category, question: "Bereken: 3/5 ÷ (9/20).", answer: "4/3" },
      { category, question: "Bereken: (7/12 - 1/8) ÷ 5/6.", answer: "11/20" },
      { category, question: "Los op: 3/4 x - 2/5 = 7/10.", answer: "22/15" },
      { category, question: "Schrijf 1,1666… als breuk.", answer: "7/6" },
      mc(category, "Welke waarde is het kleinst?", ["-3/4", "-0,7", "-2/3", "-0,72"], "-3/4"),
      { category, question: "Bereken: 2,75 × 1 5/11.", answer: "4" },
      { category, question: "Bereken: (2/3)².", answer: "4/9" },
      { category, question: "Bereken: 1 - (3/5 + 1/4).", answer: "3/20" },
      { category, question: "Los op: x/3 - 5/12 = 1/4.", answer: "2" },
      { category, question: "Schrijf 0,181818… als breuk.", answer: "2/11" },
      { category, question: "Bereken: -3/4 + 5/6.", answer: "1/12" },
      { category, question: "Bereken: (-2/5) × (15/8).", answer: "-3/4" },
      mc(category, "Welke breuk is gelijk aan -0,625?", ["-5/8", "-3/5", "5/8", "-7/10"], "-5/8"),
      { category, question: "Bereken: 1,44 ÷ 3/5.", answer: decimal(2.4) },
      { category, question: "Bereken: 7/10 van 2,5.", answer: decimal(1.75) }
    );
  } else if (level === 7) {
    exercises.push(
      { category, question: "Bereken: (5/6)².", answer: "25/36" },
      { category, question: "Bereken: √(49/81).", answer: "7/9" },
      { category, question: "Bereken: (3/4)⁻¹.", answer: "4/3" },
      { category, question: "Bereken: 2⁻³.", answer: "1/8" },
      { category, question: "Los op: 2/5 x + 1/3 = 17/15.", answer: "2" },
      { category, question: "Los op: (x - 1/2) ÷ 3/4 = 2.", answer: "2" },
      { category, question: "Schrijf 0,083333… als breuk.", answer: "1/12" },
      { category, question: "Bereken: 5/6 - (2/3)².", answer: "7/18" },
      mc(category, "Welke waarde is irrationaal?", ["√3", "0,121212…", "7/8", "-2,5"], "√3"),
      { category, question: "Bereken: (1 1/2)³.", answer: ["27/8", "3 3/8"] },
      { category, question: "Bereken: 4/9 ÷ √(16/25).", answer: "5/9" },
      { category, question: "Vereenvoudig: (6/7) × (14/15) × (5/4).", answer: "1" },
      { category, question: "Bereken: |−7/12| + 1/4.", answer: "5/6" },
      { category, question: "Schrijf 2,6666… als breuk.", answer: "8/3" },
      { category, question: "Bereken: 0,0625 als macht van 1/2.", answer: ["(1/2)^4", "1/16"] }
    );
  } else if (level === 8) {
    exercises.push(
      { category, question: "Vereenvoudig: (3/4 x) + (5/8 x).", answer: "11/8 x" },
      { category, question: "Los op: 2/3(x - 3/4) = 5/6.", answer: "2" },
      { category, question: "Bereken: (1/2 + 1/3) ÷ (5/6).", answer: "1" },
      { category, question: "Bereken: 1/(3/4 + 1/2).", answer: "4/5" },
      { category, question: "Schrijf 0,142857142857… als breuk.", answer: "1/7" },
      { category, question: "Bereken: (−3/5)² − 1/4.", answer: "11/100" },
      { category, question: "Los op: x/4 + x/6 = 5.", answer: "12" },
      { category, question: "Los op: 3/(2x) = 3/10.", answer: "5" },
      mc(category, "Welke breuk is gelijk aan 0,090909…?", ["1/11", "1/9", "9/10", "10/11"], "1/11"),
      { category, question: "Bereken: (2/3)⁻².", answer: "9/4" },
      { category, question: "Vereenvoudig: (4/9) ÷ (8/27).", answer: "3/2" },
      { category, question: "Bereken: √(121/169).", answer: "11/13" },
      { category, question: "Los op: 5/8 x - 1/4 = 2.", answer: "18/5" },
      { category, question: "Bereken: 1,2̅ als breuk (1,222…).", answer: "11/9" },
      { category, question: "Bereken: 3/4 van 2/5 van 100.", answer: "30" }
    );
  } else if (level === 9) {
    exercises.push(
      { category, question: "Vereenvoudig: (x/3 + x/4).", answer: "7x/12" },
      { category, question: "Los op: (2x - 1)/3 = 5/4.", answer: "19/8" },
      { category, question: "Los op: 1/x = 3/8.", answer: "8/3" },
      { category, question: "Bereken: (3/5)³ ÷ (9/25).", answer: "3/5" },
      { category, question: "Bereken: 1/(1/2 + 1/3 + 1/6).", answer: "1" },
      { category, question: "Schrijf 0,052631578947… als breuk.", answer: "1/19" },
      { category, question: "Los op: 2/(x - 1) = 1/3.", answer: "7" },
      { category, question: "Vereenvoudig: (x²/6) ÷ (x/9).", answer: "3x/2" },
      mc(category, "Welke waarde is gelijk aan (1/3)⁻³?", ["27", "9", "1/27", "-27"], "27"),
      { category, question: "Bereken: √(9/16) + 5/8.", answer: "11/8" },
      { category, question: "Los op: x/2 + x/3 - x/6 = 8.", answer: "12" },
      { category, question: "Bereken: (7/8 - 5/12) × 24.", answer: "11" },
      { category, question: "Vereenvoudig: (a/b) ÷ (c/d).", answer: ["ad/bc", "a*d/(b*c)"] },
      { category, question: "Bereken: 0,004 als breuk.", answer: "1/250" },
      { category, question: "Los op: 3/4 : x = 5/6.", answer: "9/10" }
    );
  } else {
    exercises.push(
      { category, question: "Los op: (x + 1)/(x - 1) = 3/2.", answer: "5" },
      { category, question: "Vereenvoudig: (1/x + 1/y).", answer: "(x+y)/xy" },
      { category, question: "Bereken: 1/(1 + 1/(1 + 1/2)).", answer: "3/5" },
      { category, question: "Los op: 2/x + 3/x = 5/4.", answer: "4" },
      { category, question: "Vereenvoudig: (x² - 1)/(x - 1).", answer: "x + 1" },
      { category, question: "Bereken: (1/2)⁻³ + (1/4)⁻¹.", answer: "12" },
      { category, question: "Schrijf 0,123123123… als breuk.", answer: "41/333" },
      { category, question: "Los op: (3x - 2)/(x + 1) = 2.", answer: "4" },
      { category, question: "Vereenvoudig: (a/b - c/d).", answer: "(ad-bc)/bd" },
      mc(category, "Welke waarde is gelijk aan 1/(√2)²?", ["1/2", "2", "√2", "1/√2"], "1/2"),
      { category, question: "Bereken: (5/6)⁰ + (2/3)⁻¹.", answer: "5/2" },
      { category, question: "Los op: x/(x + 2) = 3/5.", answer: "3" },
      { category, question: "Vereenvoudig: (x/y)⁻².", answer: "y²/x²" },
      { category, question: "Bereken: 1/3 + 1/9 + 1/27 + 1/81.", answer: "40/81" },
      { category, question: "Los op: 1/(x - 2) + 1/(x + 2) = 1/3.", answer: ["3 + √13", "3 - √13"] }
    );
  }

  return shuffle(random, exercises).slice(0, 15);
}
