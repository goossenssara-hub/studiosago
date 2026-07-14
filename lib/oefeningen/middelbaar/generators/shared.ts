import type { SecondaryExercise } from "../types";

export type Random = () => number;
export type ExerciseInput = Omit<SecondaryExercise, "id">;

export function createRandom(seed: number): Random {
  let state = Math.abs(Math.floor(seed)) || 1;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function randomInt(random: Random, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function pick<T>(random: Random, values: readonly T[]): T {
  return values[Math.floor(random() * values.length)];
}

export function shuffle<T>(random: Random, values: readonly T[]): T[] {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }

  return result;
}

export function acceptedNumber(value: number, unit?: string): string[] {
  const rounded = Number(value.toFixed(2));
  const dot = String(rounded);
  const comma = dot.replace(".", ",");

  if (!unit) return dot === comma ? [dot] : [dot, comma];

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

export function acceptedMoney(value: number): string[] {
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

export function mc(
  category: string,
  question: string,
  options: string[],
  answer: string
): ExerciseInput {
  return { category, question, options, answer };
}
