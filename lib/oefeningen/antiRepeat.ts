export type QuestionExercise = { question: string };

function normalizeQuestion(value: string): string {
  return value
    .toLocaleLowerCase("nl-BE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s*([?!.,:;])\s*/g, "$1")
    .trim();
}

/**
 * Herkent niet alleen exact dezelfde vraag, maar ook hetzelfde vraagmodel
 * met andere getallen. Zo krijgen leerlingen niet vijf keer na elkaar
 * dezelfde soort oefening met alleen andere cijfers.
 */
function templateQuestion(value: string): string {
  return normalizeQuestion(value)
    .replace(/\b\d+(?:[.,]\d+)?\b/g, "#")
    .replace(/\b(een|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf)\b/g, "#")
    .replace(/\s+/g, " ")
    .trim();
}

export function chooseLeastRepeatedSet<T extends QuestionExercise>(
  createSet: (seed: number) => T[],
  baseSeed: number,
  recentQuestions: readonly string[],
  attempts = 10
): T[] {
  const recentExact = new Set(recentQuestions.map(normalizeQuestion));
  const recentTemplates = new Set(recentQuestions.map(templateQuestion));

  let best: T[] = [];
  let bestScore = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < Math.max(1, attempts); attempt += 1) {
    const candidateSeed = baseSeed + attempt * 104_729;
    const candidate = createSet(candidateSeed);
    const currentExact = new Set<string>();
    const currentTemplates = new Map<string, number>();
    let score = 0;

    for (const exercise of candidate) {
      const exact = normalizeQuestion(exercise.question);
      const template = templateQuestion(exercise.question);

      if (recentExact.has(exact)) score += 12;
      if (recentTemplates.has(template)) score += 3;
      if (currentExact.has(exact)) score += 30;

      const templateCount = currentTemplates.get(template) ?? 0;
      if (templateCount >= 2) score += (templateCount - 1) * 4;

      currentExact.add(exact);
      currentTemplates.set(template, templateCount + 1);
    }

    // Een grotere, volledige reeks krijgt voorrang wanneer twee kandidaten
    // ongeveer even afwisselend zijn.
    score -= Math.min(candidate.length, 100) * 0.01;

    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}

export function extendQuestionHistory<T extends QuestionExercise>(
  recentQuestions: readonly string[],
  exercises: readonly T[],
  maximum = 320
): string[] {
  const combined = [...recentQuestions, ...exercises.map((exercise) => exercise.question)];
  const seen = new Set<string>();
  const uniqueReversed: string[] = [];

  for (let index = combined.length - 1; index >= 0; index -= 1) {
    const question = combined[index];
    const key = normalizeQuestion(question);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    uniqueReversed.push(question);
    if (uniqueReversed.length >= maximum) break;
  }

  return uniqueReversed.reverse();
}
