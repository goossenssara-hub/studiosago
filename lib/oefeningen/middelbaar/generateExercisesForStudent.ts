"use client";

import type { SecondaryExercise } from "./types";
import {
  generateExercisePoolsEerste,
  generateExercisesEerste,
  normalizeExerciseSkill,
  type ExerciseGenerationOptions,
} from "./generateExercisesEerste";
import { loadActiveExerciseErrors } from "./errorTracking";
import {
  attachExerciseIds,
  selectErrorFocusedExercises,
  type ErrorAwareSelectionOptions,
} from "./errorAwareSelection";
import { createRandom } from "./generators/shared";

export type StudentExerciseGenerationOptions = ExerciseGenerationOptions &
  ErrorAwareSelectionOptions & {
    /** Zet foutgerichte selectie uit, maar behoud de gewone adaptieve reeks. */
    useErrorBank?: boolean;
  };

/**
 * Clientfunctie voor een aangemelde leerling.
 *
 * Bij een netwerk- of authenticatiefout valt de functie veilig terug op de
 * gewone adaptieve generator. Daardoor blokkeert de oefenpagina nooit.
 */
export async function generateExercisesForStudent(
  skill: string,
  requestedLevel: number,
  seed = Date.now(),
  options: StudentExerciseGenerationOptions = {}
): Promise<SecondaryExercise[]> {
  const normalizedSkill = normalizeExerciseSkill(skill);
  const level = Math.max(1, Math.min(10, Math.round(requestedLevel || 1)));

  const base = generateExercisesEerste(skill, level, seed, options);

  if (options.useErrorBank === false) return base;

  try {
    const errors = await loadActiveExerciseErrors(normalizedSkill);
    if (errors.length === 0) return base;

    const pools = generateExercisePoolsEerste(normalizedSkill, level, seed);
    const selected = selectErrorFocusedExercises(
      createRandom(seed + level * 1009 + 811),
      pools,
      errors,
      base.map(({ id: _id, ...exercise }) => exercise),
      options
    );

    return attachExerciseIds(normalizedSkill, level, seed, selected);
  } catch (error) {
    console.warn("Foutgerichte oefenselectie kon niet geladen worden:", error);
    return base;
  }
}
