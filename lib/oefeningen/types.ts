export type Exercise = {
  id: string;
  category: string;
  question: string;
  answer: string | string[];
};

export type LevelProgress = {
  answers: Record<string, string>;
  checked: boolean;
  percentage: number;
  score: number;
};

export type SavedData = {
  level?: number;
  reachedLevels?: number[];
  savedExercises?: Record<number, Exercise[]>;
  progress?: Record<number, LevelProgress>;
  exerciseSeeds?: Record<number, number>;
};
