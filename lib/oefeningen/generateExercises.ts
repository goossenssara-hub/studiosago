import type { Exercise } from "./types";
import { frenchByLevel, pvByLevel, spellingByLevel } from "./data";
import { makeRandom } from "./utils";

export function generateExercises(level: number, seed = Date.now()): Exercise[] {
  const exercises: Exercise[] = [];
  const levelIndex = Math.max(0, Math.min(level - 1, 9));
  const random = makeRandom(seed, level);

  for (let i = 1; i <= 8; i++) {
    const a = random(4 + level * 2, 9 + level * 4);
    const b = random(3 + level, 10 + level * 2);

    exercises.push({
      id: `maal-${level}-${seed}-${i}`,
      category: "Maaltafels",
      question: `${a} × ${b} =`,
      answer: String(a * b),
    });
  }

  for (let i = 1; i <= 8; i++) {
    const deler = random(3 + level, 8 + level * 2);
    const uitkomst = random(10 + level * 10, 60 + level * 35);
    const getal = deler * uitkomst;

    exercises.push({
      id: `delen-${level}-${seed}-${i}`,
      category: "Automatisatie",
      question: `${getal} ÷ ${deler} =`,
      answer: String(uitkomst),
    });
  }

  for (let i = 1; i <= 6; i++) {
    const a = random(100 * level, 400 + level * 350);
    const b = random(80 * level, 300 + level * 250);
    const useMinus = level >= 4 && i % 2 === 0;

    exercises.push({
      id: `auto-${level}-${seed}-${i}`,
      category: "Automatisatie",
      question: useMinus
        ? `${Math.max(a, b)} - ${Math.min(a, b)} =`
        : `${a} + ${b} =`,
      answer: useMinus
        ? String(Math.max(a, b) - Math.min(a, b))
        : String(a + b),
    });
  }

  spellingByLevel[levelIndex].forEach(([word, correct], index) => {
    exercises.push({
      id: `spel-${level}-${seed}-${index}`,
      category: "Verenkeling en verdubbeling",
      question: `Schrijf het meervoud van: ${word}`,
      answer: correct,
    });
  });

  pvByLevel[levelIndex].forEach((item, index) => {
    exercises.push({
      id: `pv-${level}-${seed}-${index}`,
      category: "Persoonsvorm",
      question: item.question,
      answer: item.answer,
    });
  });

  for (let i = 1; i <= 6; i++) {
    const price = random(5 + level * 2, 15 + level * 5);
    const amount = random(3 + level, 8 + level * 3);
    const discount = level * 3;
    const total = price * amount;
    const answer = level < 5 ? total : total - discount;

    exercises.push({
      id: `vraag-${level}-${seed}-${i}`,
      category: "Vraagstukken",
      question:
        level < 5
          ? `Een leerling koopt ${amount} items van €${price}. Hoeveel betaalt hij in totaal?`
          : `Een klas koopt ${amount} pakketten van €${price}. Ze krijgen €${discount} korting. Hoeveel betalen ze?`,
      answer: [`${answer}`, `€${answer}`, `${answer} euro`],
    });
  }

  frenchByLevel[levelIndex].forEach(([nl, fr], index) => {
    exercises.push({
      id: `fr-${level}-${seed}-${index}`,
      category: "Frans",
      question:
        level < 8
          ? `Vertaal naar het Frans met lidwoord: ${nl}`
          : `Vertaal naar het Frans: ${nl}`,
      answer: fr,
    });
  });

  return exercises;
}
