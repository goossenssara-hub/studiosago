import { shuffle, type ExerciseInput, type Random } from "./generators/shared";

export const EXERCISES_PER_SESSION = 15;

export type AdaptiveSelectionOptions = {
  /** Zet adaptieve selectie uit en kies gewoon 15 oefeningen op het huidige niveau. */
  adaptive?: boolean;
  /** Aantal herhalingsoefeningen uit het vorige niveau. Standaard 5. */
  reviewCount?: number;
  /** Aantal oefeningen uit het huidige niveau. Standaard 5. */
  currentCount?: number;
  /** Aantal uitdagendere oefeningen uit het volgende niveau. Standaard 5. */
  challengeCount?: number;
};

type LevelPool = {
  level: number;
  exercises: ExerciseInput[];
};

function clampCount(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.floor(value ?? fallback));
}

function deduplicate(exercises: ExerciseInput[]) {
  return Array.from(
    new Map(
      exercises.map((exercise) => [exercise.question.trim(), exercise])
    ).values()
  );
}

function takeUnique(
  random: Random,
  source: ExerciseInput[],
  amount: number,
  usedQuestions: Set<string>
) {
  const available = shuffle(
    random,
    deduplicate(source).filter(
      (exercise) => !usedQuestions.has(exercise.question.trim())
    )
  );

  const selected = available.slice(0, amount);
  selected.forEach((exercise) => {
    usedQuestions.add(exercise.question.trim());
  });

  return selected;
}

export function selectAdaptiveExercises(
  random: Random,
  requestedLevel: number,
  pools: LevelPool[],
  options: AdaptiveSelectionOptions = {}
): ExerciseInput[] {
  const currentPool = pools.find((pool) => pool.level === requestedLevel);

  if (!currentPool) return [];

  if (options.adaptive === false) {
    return shuffle(random, deduplicate(currentPool.exercises)).slice(
      0,
      EXERCISES_PER_SESSION
    );
  }

  let reviewCount = clampCount(options.reviewCount, 5);
  let currentCount = clampCount(options.currentCount, 5);
  let challengeCount = clampCount(options.challengeCount, 5);

  const requestedTotal = reviewCount + currentCount + challengeCount;
  if (requestedTotal !== EXERCISES_PER_SESSION) {
    currentCount += EXERCISES_PER_SESSION - requestedTotal;
    currentCount = Math.max(0, currentCount);
  }

  const previousPool = pools.find(
    (pool) => pool.level === Math.max(1, requestedLevel - 1)
  );
  const nextPool = pools.find(
    (pool) => pool.level === Math.min(10, requestedLevel + 1)
  );

  // Op niveau 1 bestaat geen lager niveau. Die vijf vragen blijven dan
  // op het huidige niveau. Op niveau 10 geldt hetzelfde voor uitdaging.
  if (requestedLevel === 1) {
    currentCount += reviewCount;
    reviewCount = 0;
  }

  if (requestedLevel === 10) {
    currentCount += challengeCount;
    challengeCount = 0;
  }

  const usedQuestions = new Set<string>();
  const selected: ExerciseInput[] = [];

  if (previousPool && reviewCount > 0) {
    selected.push(
      ...takeUnique(
        random,
        previousPool.exercises,
        reviewCount,
        usedQuestions
      )
    );
  }

  selected.push(
    ...takeUnique(
      random,
      currentPool.exercises,
      currentCount,
      usedQuestions
    )
  );

  if (nextPool && challengeCount > 0) {
    selected.push(
      ...takeUnique(
        random,
        nextPool.exercises,
        challengeCount,
        usedQuestions
      )
    );
  }

  if (selected.length < EXERCISES_PER_SESSION) {
    const fallback = pools.flatMap((pool) => pool.exercises);
    selected.push(
      ...takeUnique(
        random,
        fallback,
        EXERCISES_PER_SESSION - selected.length,
        usedQuestions
      )
    );
  }

  return shuffle(random, selected).slice(0, EXERCISES_PER_SESSION);
}
