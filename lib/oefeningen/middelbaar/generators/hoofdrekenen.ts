import {
  acceptedNumber,
  mc,
  randomInt,
  type ExerciseInput,
  type Random,
} from "./shared";

export function generateHoofdrekenen(
  level: number,
  random: Random
): ExerciseInput[] {
  const category = `Hoofdrekenen · niveau ${level}`;

  switch (level) {
    case 1: {
      const a = randomInt(random, 320, 880);
      const b = randomInt(random, 120, 390);
      return [
        { category, question: `${a} + ${b} =`, answer: String(a + b) },
        { category, question: `${a} - ${b} =`, answer: String(a - b) },
        { category, question: `24 × 18 =`, answer: "432" },
        { category, question: `864 ÷ 12 =`, answer: "72" },
        {
          category,
          question:
            `Schat ${a} + ${b} door beide getallen af te ronden op honderdtallen.`,
          answer: String(Math.round(a / 100) * 100 + Math.round(b / 100) * 100),
        },
        mc(category, "Welke uitkomst is correct voor 8 + 3 × 4?", ["44", "20", "23", "32"], "20"),
      ];
    }
    case 2:
      return [
        { category, question: `3 450 + 2 875 =`, answer: "6325" },
        { category, question: `9 000 - 4 786 =`, answer: "4214" },
        { category, question: `35 × 24 =`, answer: "840" },
        { category, question: `1 728 ÷ 24 =`, answer: "72" },
        { category, question: `48 × 25 =`, answer: "1200" },
        mc(category, "Welke strategie is handig voor 99 × 37?", ["100 × 37 - 37", "90 × 37 + 99", "37 ÷ 99", "99 + 37"], "100 × 37 - 37"),
      ];
    case 3:
      return [
        { category, question: `18,7 + 6,45 =`, answer: acceptedNumber(25.15) },
        { category, question: `42,5 - 17,86 =`, answer: acceptedNumber(24.64) },
        { category, question: `3,6 × 25 =`, answer: acceptedNumber(90) },
        { category, question: `84 ÷ 0,7 =`, answer: acceptedNumber(120) },
        { category, question: `12,5% van 320 =`, answer: acceptedNumber(40) },
        mc(category, "Welke uitkomst is correct voor 6,4 + 2 × 3,5?", ["29,4", "13,4", "19,8", "9,9"], "13,4"),
      ];
    case 4:
      return [
        { category, question: `-18 + 47 =`, answer: "29" },
        { category, question: `35 - (-16) =`, answer: "51" },
        { category, question: `-7 × 12 =`, answer: "-84" },
        { category, question: `144 ÷ (-9) =`, answer: "-16" },
        { category, question: `4² + 3³ =`, answer: "43" },
        mc(category, "Welke uitkomst is correct voor -6 + 4 × 5?", ["-10", "14", "26", "-50"], "14"),
      ];
    case 5:
      return [
        { category, question: `(48 + 72) ÷ 6 =`, answer: "20" },
        { category, question: `180 - 4 × 27 =`, answer: "72" },
        { category, question: `3 × (25 - 8) + 14 =`, answer: "65" },
        { category, question: `2,5 × (16 + 4) =`, answer: acceptedNumber(50) },
        { category, question: `15% van 480 + 28 =`, answer: acceptedNumber(100) },
        mc(category, "Welke bewerking komt eerst bij 72 ÷ 8 + 3 × 5?", ["optellen", "delen en vermenigvuldigen", "alleen delen", "alleen vermenigvuldigen"], "delen en vermenigvuldigen"),
      ];
    case 6:
      return [
        { category, question: `3/4 van 360 =`, answer: "270" },
        { category, question: `5/8 van 256 =`, answer: "160" },
        { category, question: `1,25 × 48 =`, answer: acceptedNumber(60) },
        { category, question: `37,5% van 240 =`, answer: acceptedNumber(90) },
        { category, question: `2³ × 5² =`, answer: "200" },
        mc(category, "Welke waarde is gelijk aan 0,375?", ["3/8", "3/5", "5/8", "7/20"], "3/8"),
      ];
    case 7:
      return [
        { category, question: `√196 + 3² =`, answer: "23" },
        { category, question: `2⁵ - 3³ =`, answer: "5" },
        { category, question: `(-4)² - 5 × 3 =`, answer: "1" },
        { category, question: `1/3 van 270 + 18% van 200 =`, answer: "126" },
        { category, question: `(7,5 - 2,7) × 12 =`, answer: acceptedNumber(57.6) },
        mc(category, "Welke schatting ligt het dichtst bij 49,8 × 19,7?", ["100", "500", "1 000", "2 000"], "1 000"),
      ];
    case 8:
      return [
        { category, question: `2 × 3⁴ - 5² =`, answer: "137" },
        { category, question: `(144 ÷ 12)² - 44 =`, answer: "100" },
        { category, question: `0,125 × 640 =`, answer: "80" },
        { category, question: `62,5% van 384 =`, answer: "240" },
        { category, question: `-3 × (18 - 26) + 7 =`, answer: "31" },
        mc(category, "Welke uitdrukking is gelijk aan 25% van 3 200?", ["3 200 ÷ 4", "3 200 ÷ 25", "3 200 × 25", "3 200 - 25"], "3 200 ÷ 4"),
      ];
    case 9:
      return [
        { category, question: `15² - 4³ =`, answer: "161" },
        { category, question: `√625 × 1,6 =`, answer: acceptedNumber(40) },
        { category, question: `7/12 van 432 - 35 =`, answer: "217" },
        { category, question: `(2,4³ + 5,176) ÷ 2 =`, answer: acceptedNumber(9.5) },
        { category, question: `125% van 480 - 17,5% van 400 =`, answer: "530" },
        mc(category, "Welke waarde is het grootst?", ["2⁸", "4⁴", "8²", "16 × 15"], "2⁸"),
      ];
    default:
      return [
        { category, question: `(3⁵ - 2⁷) ÷ 5 =`, answer: "23" },
        { category, question: `√1 296 + 2,5³ =`, answer: acceptedNumber(51.625) },
        { category, question: `87,5% van 640 - 3/8 van 480 =`, answer: "380" },
        { category, question: `(-12)² ÷ 9 + 7 × (-3) =`, answer: "-5" },
        { category, question: `(1,2 × 10³ + 4,8 × 10²) ÷ 24 =`, answer: "70" },
        mc(category, "Welke schatting past het best bij 198,4 × 49,7?", ["1 000", "5 000", "10 000", "20 000"], "10 000"),
      ];
  }
}
