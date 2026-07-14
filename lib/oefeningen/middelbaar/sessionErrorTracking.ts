import type { SecondaryExercise } from "./types";
import {
  registerExerciseError,
  resolveExerciseError,
  type ExerciseErrorRecord,
} from "./errorTracking";

export type CheckedExerciseResult = {
  exercise: SecondaryExercise;
  answer: string;
  correct: boolean;
};

export type TrackSessionResult = {
  savedErrors: ExerciseErrorRecord[];
  updatedCorrectAnswers: ExerciseErrorRecord[];
  failedRequests: number;
};

export async function trackCheckedExerciseSession(
  skill: string,
  level: number,
  results: CheckedExerciseResult[]
): Promise<TrackSessionResult> {
  const outcomes = await Promise.allSettled(
    results.map(async (result) => {
      if (result.correct) {
        const resolved = await resolveExerciseError({
          skill,
          level,
          exercise: result.exercise,
        });

        return { kind: "correct" as const, record: resolved };
      }

      const saved = await registerExerciseError({
        skill,
        level,
        exercise: result.exercise,
        wrongAnswer: result.answer,
      });

      return { kind: "error" as const, record: saved };
    })
  );

  const savedErrors: ExerciseErrorRecord[] = [];
  const updatedCorrectAnswers: ExerciseErrorRecord[] = [];
  let failedRequests = 0;

  for (const outcome of outcomes) {
    if (outcome.status === "rejected") {
      failedRequests += 1;
      continue;
    }

    if (outcome.value.kind === "error") {
      savedErrors.push(outcome.value.record);
    } else if (outcome.value.record) {
      updatedCorrectAnswers.push(outcome.value.record);
    }
  }

  return { savedErrors, updatedCorrectAnswers, failedRequests };
}
