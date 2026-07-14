export type DifficultyAction =
  | "advance-fast"
  | "advance"
  | "stay"
  | "practice"
  | "step-back";

export type DifficultyRecommendation = {
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

export type SessionResultInput = {
  level: number;
  correctAnswers: number;
  totalExercises: number;
  previousConsecutivePasses?: number;
};

const clampLevel = (level: number) =>
  Math.max(1, Math.min(10, Math.round(level || 1)));

export function calculateScorePercentage(
  correctAnswers: number,
  totalExercises: number
): number {
  if (!Number.isFinite(totalExercises) || totalExercises <= 0) return 0;
  const score = (Math.max(0, correctAnswers) / totalExercises) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Regels:
 * 95-100%: sneller stijgen na minstens twee opeenvolgende sterke sessies.
 * 80-94%: één niveau stijgen.
 * 75-79%: geslaagd, maar nog op hetzelfde niveau consolideren.
 * 60-74%: hetzelfde niveau met extra herhaling.
 * <60%: één niveau terug, behalve op niveau 1.
 */
export function recommendDifficulty(
  input: SessionResultInput
): DifficultyRecommendation {
  const previousLevel = clampLevel(input.level);
  const scorePercentage = calculateScorePercentage(
    input.correctAnswers,
    input.totalExercises
  );
  const previousConsecutivePasses = Math.max(
    0,
    Math.round(input.previousConsecutivePasses ?? 0)
  );

  if (scorePercentage >= 95) {
    const step = previousConsecutivePasses >= 1 ? 2 : 1;
    return {
      action: step === 2 ? "advance-fast" : "advance",
      previousLevel,
      recommendedLevel: clampLevel(previousLevel + step),
      scorePercentage,
      passed: true,
      message:
        step === 2
          ? "Uitstekend! Je mag twee niveaus hoger proberen."
          : "Uitstekend! Je gaat een niveau hoger.",
      reviewRatio: 0.2,
      currentRatio: 0.4,
      challengeRatio: 0.4,
    };
  }

  if (scorePercentage >= 80) {
    return {
      action: "advance",
      previousLevel,
      recommendedLevel: clampLevel(previousLevel + 1),
      scorePercentage,
      passed: true,
      message: "Goed gewerkt! Je gaat een niveau hoger.",
      reviewRatio: 0.25,
      currentRatio: 0.5,
      challengeRatio: 0.25,
    };
  }

  if (scorePercentage >= 75) {
    return {
      action: "stay",
      previousLevel,
      recommendedLevel: previousLevel,
      scorePercentage,
      passed: true,
      message:
        "Je bent geslaagd. Oefen dit niveau nog één keer om het stevig te beheersen.",
      reviewRatio: 0.35,
      currentRatio: 0.5,
      challengeRatio: 0.15,
    };
  }

  if (scorePercentage >= 60) {
    return {
      action: "practice",
      previousLevel,
      recommendedLevel: previousLevel,
      scorePercentage,
      passed: false,
      message:
        "Je bent dichtbij. Je krijgt extra herhaling op hetzelfde niveau.",
      reviewRatio: 0.5,
      currentRatio: 0.4,
      challengeRatio: 0.1,
    };
  }

  return {
    action: "step-back",
    previousLevel,
    recommendedLevel: clampLevel(previousLevel - 1),
    scorePercentage,
    passed: false,
    message:
      previousLevel === 1
        ? "We blijven op niveau 1 en bouwen de basis verder op."
        : "We gaan tijdelijk één niveau terug om de basis te versterken.",
    reviewRatio: 0.6,
    currentRatio: 0.4,
    challengeRatio: 0,
  };
}

export function recommendationToExerciseCounts(
  recommendation: DifficultyRecommendation,
  total = 15
): {
  reviewCount: number;
  currentCount: number;
  challengeCount: number;
} {
  const safeTotal = Math.max(1, Math.round(total));
  const reviewCount = Math.round(safeTotal * recommendation.reviewRatio);
  const challengeCount = Math.round(
    safeTotal * recommendation.challengeRatio
  );
  const currentCount = Math.max(
    0,
    safeTotal - reviewCount - challengeCount
  );

  return { reviewCount, currentCount, challengeCount };
}
