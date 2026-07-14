import type { SecondaryExercise } from "./types";
import type { ExerciseErrorRecord } from "./errorTracking";
import {
  shuffle,
  type ExerciseInput,
  type Random,
} from "./generators/shared";
import { EXERCISES_PER_SESSION } from "./adaptiveSelection";

export type ErrorAwareSelectionOptions = {
  /** Maximum aantal oefeningen dat rechtstreeks uit actieve fouten komt. */
  errorCount?: number;
};

type LevelPool = {
  level: number;
  exercises: ExerciseInput[];
};

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function deduplicate(exercises: ExerciseInput[]) {
  return Array.from(
    new Map(
      exercises.map((exercise) => [normalize(exercise.question), exercise])
    ).values()
  );
}

function clampErrorCount(value: number | undefined) {
  if (!Number.isFinite(value)) return 5;
  return Math.max(0, Math.min(8, Math.floor(value ?? 5)));
}

function similarity(question: string, errorQuestion: string) {
  const left = new Set(normalize(question).split(" ").filter(Boolean));
  const right = new Set(normalize(errorQuestion).split(" ").filter(Boolean));

  if (left.size === 0 || right.size === 0) return 0;

  let overlap = 0;
  left.forEach((word) => {
    if (right.has(word)) overlap += 1;
  });

  return overlap / Math.max(left.size, right.size);
}

function findBestExercise(
  error: ExerciseErrorRecord,
  pools: LevelPool[],
  usedQuestions: Set<string>
): ExerciseInput | null {
  const candidates = pools
    .flatMap((pool) =>
      pool.exercises.map((exercise) => ({
        exercise,
        levelDistance: Math.abs(pool.level - error.level),
        score:
          similarity(exercise.question, error.question) * 100 -
          Math.abs(pool.level - error.level) * 8,
      }))
    )
    .filter(
      ({ exercise }) => !usedQuestions.has(normalize(exercise.question))
    )
    .sort((a, b) => b.score - a.score);

  const exact = candidates.find(
    ({ exercise }) => normalize(exercise.question) === normalize(error.question)
  );

  if (exact) return exact.exercise;

  const related = candidates.find(
    ({ score, levelDistance }) => score >= 20 && levelDistance <= 1
  );

  return related?.exercise ?? null;
}

export function selectErrorFocusedExercises(
  random: Random,
  pools: LevelPool[],
  errors: ExerciseErrorRecord[],
  baseExercises: ExerciseInput[],
  options: ErrorAwareSelectionOptions = {}
): ExerciseInput[] {
  const maximumErrors = clampErrorCount(options.errorCount);
  const activeErrors = [...errors]
    .filter((error) => !error.isResolved)
    .sort((a, b) => b.priority - a.priority);

  const usedQuestions = new Set<string>();
  const selected: ExerciseInput[] = [];

  for (const error of activeErrors) {
    if (selected.length >= maximumErrors) break;

    const exercise = findBestExercise(error, pools, usedQuestions);
    if (!exercise) continue;

    selected.push(exercise);
    usedQuestions.add(normalize(exercise.question));
  }

  const remainder = shuffle(random, deduplicate(baseExercises)).filter(
    (exercise) => !usedQuestions.has(normalize(exercise.question))
  );

  selected.push(
    ...remainder.slice(0, EXERCISES_PER_SESSION - selected.length)
  );

  if (selected.length < EXERCISES_PER_SESSION) {
    const fallback = shuffle(
      random,
      deduplicate(pools.flatMap((pool) => pool.exercises))
    ).filter((exercise) => !usedQuestions.has(normalize(exercise.question)));

    selected.push(
      ...fallback.slice(0, EXERCISES_PER_SESSION - selected.length)
    );
  }

  return shuffle(random, selected).slice(0, EXERCISES_PER_SESSION);
}

export function attachExerciseIds(
  skill: string,
  level: number,
  seed: number,
  exercises: ExerciseInput[]
): SecondaryExercise[] {
  return exercises.map((exercise, index) => ({
    ...exercise,
    id: `${skill}-niveau-${level}-${seed}-${index + 1}`,
  }));
}
