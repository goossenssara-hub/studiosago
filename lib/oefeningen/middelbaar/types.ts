export type SecondaryExerciseType =
  | "text"
  | "number"
  | "choice"
  | "multiline";

export type SecondaryExercise = {
  id: string;
  category: string;
  prompt: string;
  instruction?: string;
  type: SecondaryExerciseType;
  options?: string[];
  answer: string | string[];
  explanation?: string;
  strategy?: string[];
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
