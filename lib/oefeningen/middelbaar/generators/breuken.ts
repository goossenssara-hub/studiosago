import { acceptedNumber, mc, type ExerciseInput, type Random } from "./shared";

export function generateBreuken(level: number, _random: Random): ExerciseInput[] {
  const category = `Breuken en kommagetallen · niveau ${level}`;
  const levels: Record<number, ExerciseInput[]> = {
    1: [
      mc(category, "Welke breuk is gelijkwaardig aan 3/4?", ["6/8", "4/5", "3/8", "9/16"], "6/8"),
      { category, question: "Schrijf 7/20 als kommagetal.", answer: ["0,35", "0.35"] },
      { category, question: "Vereenvoudig 18/24.", answer: "3/4" },
      mc(category, "Welke waarde is het grootst?", ["0,7", "2/3", "3/4", "0,72"], "3/4"),
      { category, question: "Rangschik: 0,25 – 3/5 – 0,8.", answer: ["0,25 3/5 0,8", "0,25 - 3/5 - 0,8"] },
      { category, question: "Schrijf 1,75 als gemengd getal.", answer: ["1 3/4", "1¾"] },
    ],
    2: [
      { category, question: "3/8 + 2/8 =", answer: "5/8" },
      { category, question: "11/12 - 5/12 =", answer: "1/2" },
      { category, question: "2,45 + 3,8 =", answer: acceptedNumber(6.25) },
      { category, question: "7,2 - 4,675 =", answer: acceptedNumber(2.525) },
      mc(category, "Welke breuk is kleiner dan 0,4?", ["3/8", "2/5", "5/12", "7/16"], "3/8"),
      { category, question: "Schrijf 0,125 als breuk.", answer: "1/8" },
    ],
    3: [
      { category, question: "3/4 + 2/5 =", answer: ["23/20", "1 3/20"] },
      { category, question: "7/8 - 1/6 =", answer: "17/24" },
      { category, question: "2 1/3 + 1 5/6 =", answer: ["4 1/6", "25/6"] },
      { category, question: "3,75 ÷ 0,5 =", answer: acceptedNumber(7.5) },
      mc(category, "Welke berekening geeft 5/6 van 72?", ["72 ÷ 6 × 5", "72 ÷ 5 × 6", "72 × 6 × 5", "72 - 6 × 5"], "72 ÷ 6 × 5"),
      { category, question: "Zet 2,375 om in een breuk.", answer: ["19/8", "2 3/8"] },
    ],
    4: [
      { category, question: "5/6 × 9/10 =", answer: "3/4" },
      { category, question: "7/8 ÷ 14/15 =", answer: "15/16" },
      { category, question: "1 3/5 × 2 1/4 =", answer: "18/5" },
      { category, question: "4,2 ÷ 0,07 =", answer: "60" },
      mc(category, "Welke uitspraak is waar?", ["0,333… = 1/3", "0,6 = 2/5", "0,25 = 1/5", "1,2 = 6/10"], "0,333… = 1/3"),
      { category, question: "Bereken 2 1/3 - 5/8.", answer: "41/24" },
    ],
    5: [
      { category, question: "Los op: x + 3/5 = 7/4.", answer: ["23/20", "1,15"] },
      { category, question: "Los op: 2/3 x = 14.", answer: "21" },
      { category, question: "Bereken: 1 ÷ (3/8).", answer: "8/3" },
      { category, question: "Schrijf 0,0375 als breuk.", answer: "3/80" },
      mc(category, "Welke breuk ligt tussen 2/3 en 3/4?", ["7/10", "4/5", "3/5", "5/8"], "7/10"),
      { category, question: "Bereken: 5/12 + 7/18.", answer: "29/36" },
    ],
    6: [
      { category, question: "Bereken: (3/4 + 5/6) × 2.", answer: "19/6" },
      { category, question: "Bereken: 2,4 × 5/8.", answer: acceptedNumber(1.5) },
      { category, question: "Los op: x/5 + 3/10 = 9/10.", answer: "3" },
      { category, question: "Schrijf 0,272727… als breuk.", answer: "3/11" },
      mc(category, "Welke is rationaal?", ["√2", "π", "0,125", "√7"], "0,125"),
      { category, question: "Bereken: 4 2/5 ÷ 1 1/10.", answer: "4" },
    ],
    7: [
      { category, question: "Bereken: 3/5 ÷ (9/20).", answer: "4/3" },
      { category, question: "Bereken: (7/12 - 1/8) ÷ 5/6.", answer: "11/20" },
      { category, question: "Los op: 3/4 x - 2/5 = 7/10.", answer: "22/15" },
      { category, question: "Schrijf 1,1666… als breuk.", answer: "7/6" },
      mc(category, "Welke waarde is het kleinst?", ["-3/4", "-0,7", "-2/3", "-0,72"], "-3/4"),
      { category, question: "Bereken: 2,75 × 1 5/11.", answer: "4" },
    ],
    8: [
      { category, question: "Bereken: (5/6)².", answer: "25/36" },
      { category, question: "Bereken: √(49/81).", answer: "7/9" },
      { category, question: "Los op: 2/3(x - 3/4) = 5/6.", answer: "2" },
      { category, question: "Zet 0,0125 om in een breuk.", answer: "1/80" },
      mc(category, "Welke breuk benadert 0,142857…?", ["1/7", "1/6", "1/8", "2/7"], "1/7"),
      { category, question: "Bereken: 1/(3/4 + 1/2).", answer: "4/5" },
    ],
    9: [
      { category, question: "Bereken: 2/3 + 1/(3/4).", answer: "2" },
      { category, question: "Bereken: (1 1/2)³.", answer: "27/8" },
      { category, question: "Los op: (x - 1/3)/2 = 5/6.", answer: "2" },
      { category, question: "Schrijf 2,04545… als breuk.", answer: "45/22" },
      mc(category, "Welke uitspraak is juist?", ["Elke eindige decimaal is rationaal", "Elke wortel is irrationaal", "π is rationaal", "1/0 is rationaal"], "Elke eindige decimaal is rationaal"),
      { category, question: "Bereken: (7/9 ÷ 14/27) - 1/2.", answer: "1" },
    ],
    10: [
      { category, question: "Bereken: (3/4 - 2/5) ÷ (7/10).", answer: "1/2" },
      { category, question: "Los op: 5/6 x + 3/4 = 19/12.", answer: "1" },
      { category, question: "Bereken: √(121/144) + 5/12.", answer: "4/3" },
      { category, question: "Schrijf 0,08333… als breuk.", answer: "1/12" },
      mc(category, "Welke waarde is exact gelijk aan 0,875?", ["7/8", "8/9", "13/16", "17/20"], "7/8"),
      { category, question: "Bereken: 1/(1/2 + 1/3 + 1/6).", answer: "1" },
    ],
  };
  return levels[level];
}
