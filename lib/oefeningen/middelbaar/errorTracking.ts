import type { SecondaryExercise } from "./types";

export type StoredCorrectAnswer = string | string[];

export type ExerciseErrorRecord = {
  id: string;
  skill: string;
  level: number;
  exerciseId: string | null;
  exerciseFingerprint: string;
  question: string;
  exerciseType: "multiple-choice" | "open";
  wrongAnswer: string | null;
  correctAnswer: StoredCorrectAnswer;
  errorCount: number;
  correctAfterErrorCount: number;
  isResolved: boolean;
  firstErrorAt: string;
  lastErrorAt: string;
  lastCorrectAt: string | null;
  resolvedAt: string | null;
  nextReviewAt: string | null;
  priority: number;
};

export type RegisterExerciseErrorInput = {
  skill: string;
  level: number;
  exercise: SecondaryExercise;
  wrongAnswer: string;
};

export type ResolveExerciseErrorInput = {
  skill: string;
  level: number;
  exercise: SecondaryExercise;
};

function normalizeFingerprintPart(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function hashString(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createExerciseFingerprint(
  skill: string,
  level: number,
  exercise: Pick<SecondaryExercise, "question" | "category">
): string {
  const source = [
    normalizeFingerprintPart(skill),
    String(level),
    normalizeFingerprintPart(exercise.category ?? ""),
    normalizeFingerprintPart(exercise.question),
  ].join("|");

  return hashString(source);
}

export function getExerciseType(
  exercise: Pick<SecondaryExercise, "options">
): "multiple-choice" | "open" {
  return Array.isArray(exercise.options) && exercise.options.length > 0
    ? "multiple-choice"
    : "open";
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "De oefenfout kon niet worden opgeslagen.");
  }

  return payload as T;
}

export async function registerExerciseError(
  input: RegisterExerciseErrorInput
): Promise<ExerciseErrorRecord> {
  const { exercise, level, skill, wrongAnswer } = input;

  const payload = await requestJson<{ errorRecord: ExerciseErrorRecord }>(
    "/api/leerling/oefenfouten",
    {
      method: "POST",
      body: JSON.stringify({
        skill,
        level,
        exerciseId: exercise.id,
        exerciseFingerprint: createExerciseFingerprint(skill, level, exercise),
        question: exercise.question,
        exerciseType: getExerciseType(exercise),
        wrongAnswer,
        correctAnswer: exercise.answer,
      }),
    }
  );

  return payload.errorRecord;
}

export async function resolveExerciseError(
  input: ResolveExerciseErrorInput
): Promise<ExerciseErrorRecord | null> {
  const { exercise, level, skill } = input;

  const payload = await requestJson<{
    errorRecord: ExerciseErrorRecord | null;
  }>("/api/leerling/oefenfouten/resolve", {
    method: "POST",
    body: JSON.stringify({
      skill,
      level,
      exerciseFingerprint: createExerciseFingerprint(skill, level, exercise),
    }),
  });

  return payload.errorRecord;
}

export async function loadActiveExerciseErrors(
  skill?: string
): Promise<ExerciseErrorRecord[]> {
  const query = skill ? `?skill=${encodeURIComponent(skill)}` : "";
  const payload = await requestJson<{ errors: ExerciseErrorRecord[] }>(
    `/api/leerling/oefenfouten${query}`,
    { method: "GET" }
  );

  return payload.errors;
}
