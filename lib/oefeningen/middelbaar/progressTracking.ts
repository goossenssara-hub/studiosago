"use client";

import type { DifficultyAction } from "./adaptiveDifficulty";

export type ExerciseProgress = {
  skill: string;
  currentLevel: number;
  recommendedLevel: number;
  highestLevel: number;
  totalSessions: number;
  totalExercises: number;
  totalCorrect: number;
  averageScore: number;
  lastScore: number | null;
  consecutivePasses: number;
  consecutiveStrongPasses: number;
  lastAction: DifficultyAction | null;
  lastPracticedAt: string | null;
};

export type SaveExerciseSessionInput = {
  skill: string;
  level: number;
  correctAnswers: number;
  totalExercises: number;
  durationSeconds?: number;
};

export type SaveExerciseSessionResult = {
  progress: ExerciseProgress;
  recommendation: {
    action: DifficultyAction;
    previousLevel: number;
    recommendedLevel: number;
    scorePercentage: number;
    passed: boolean;
    message: string;
    reviewRatio: number;
    currentRatio: number;
    challengeRatio: number;
  };
};

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "De oefenvoortgang kon niet worden opgeslagen.");
  }

  return payload as T;
}

export async function loadExerciseProgress(
  skill: string
): Promise<ExerciseProgress | null> {
  const payload = await requestJson<{ progress: ExerciseProgress | null }>(
    `/api/leerling/oefenvoortgang?skill=${encodeURIComponent(skill)}`,
    { method: "GET" }
  );
  return payload.progress;
}

export async function saveExerciseSession(
  input: SaveExerciseSessionInput
): Promise<SaveExerciseSessionResult> {
  return requestJson<SaveExerciseSessionResult>(
    "/api/leerling/oefenvoortgang",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}
