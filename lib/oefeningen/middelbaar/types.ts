export type SecondaryExercise = {
  id: string;
  category: string;
  question: string;
  answer: string | string[];
  options?: string[];
  goalId?: string;
  goalText?: string;
  hint?: string;
};

export type SecondaryLevelProgress = {
  answers: Record<string, string>;
  checked: boolean;
  percentage: number;
  score: number;
};

export type SecondarySavedData = {
  level: number;
  reachedLevels: number[];
  savedExercises: Record<number, SecondaryExercise[]>;
  progress: Record<number, SecondaryLevelProgress>;
  exerciseSeeds: Record<number, number>;
};
