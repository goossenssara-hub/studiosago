"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BottomActions from "@/components/oefenen/BottomActions";
import ExerciseCard from "@/components/oefenen/ExerciseCard";
import MountainProgress from "@/components/oefenen/MountainProgress";
import { categories } from "@/lib/oefeningen/data";
import { generateExercises } from "@/lib/oefeningen/generateExercises";
import { generateExercisesVierde } from "@/lib/oefeningen/generateExercisesVierde";
import type { Exercise, LevelProgress, SavedData } from "@/lib/oefeningen/types";
import { normalize } from "@/lib/oefeningen/utils";

type OefenpaginaClientProps = {
  leerjaar: "vierde" | "zesde";
};

export default function OefenpaginaClient({ leerjaar }: OefenpaginaClientProps) {
  const router = useRouter();
  const isVierde = leerjaar === "vierde";

  const title = isVierde ? "Oefenklim 4e leerjaar" : "Oefenklim 6e leerjaar";

  const subtitle = isVierde
    ? "Oefen Nederlands, wiskunde en wereldoriëntatie op jouw niveau."
    : "Oefen taal, wiskunde en Frans op jouw niveau.";

  const storageKey = isVierde
    ? "sago-oefenklim-vierde-leerjaar-v1"
    : "sago-oefenklim-zesde-leerjaar-v1";

  const exerciseGenerator = isVierde
    ? generateExercisesVierde
    : generateExercises;

  const [level, setLevel] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [reachedLevels, setReachedLevels] = useState<number[]>([1]);
  const [savedExercises, setSavedExercises] = useState<Record<number, Exercise[]>>({});
  const [progress, setProgress] = useState<Record<number, LevelProgress>>({});
  const [exerciseSeeds, setExerciseSeeds] = useState<Record<number, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const data: SavedData = JSON.parse(stored);
        const savedLevel = data.level || 1;
        const savedProgress = data.progress?.[savedLevel];

        setLevel(savedLevel);
        setReachedLevels(data.reachedLevels || [1]);
        setSavedExercises(data.savedExercises || {});
        setProgress(data.progress || {});
        setExerciseSeeds(data.exerciseSeeds || {});

        if (savedProgress) {
          setAnswers(savedProgress.answers || {});
          setChecked(savedProgress.checked || false);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;

    const seed = exerciseSeeds[1] || Date.now();

    setExerciseSeeds((previous) => ({
      ...previous,
      1: previous[1] || seed,
    }));

    setSavedExercises((previous) => {
      if (previous[1]) return previous;

      return {
        ...previous,
        1: exerciseGenerator(1, seed),
      };
    });
  }, [loaded, exerciseSeeds, exerciseGenerator]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        level,
        reachedLevels,
        savedExercises,
        progress,
        exerciseSeeds,
      })
    );
  }, [level, reachedLevels, savedExercises, progress, exerciseSeeds, loaded, storageKey]);

  const exercises = useMemo(() => savedExercises[level] || [], [level, savedExercises]);

  const score = exercises.reduce((total, exercise) => {
    const given = normalize(answers[exercise.id] || "");
    const correctAnswers = Array.isArray(exercise.answer)
      ? exercise.answer
      : [exercise.answer];

    const correct = correctAnswers.some((answer) => normalize(answer) === given);
    return total + (correct ? 1 : 0);
  }, 0);

  const percentage =
    exercises.length > 0 ? Math.round((score / exercises.length) * 100) : 0;

  const savedProgress = progress[level];
  const displayedScore = savedProgress?.checked ? savedProgress.score : score;

  const displayedPercentage = savedProgress?.checked
    ? savedProgress.percentage
    : checked
      ? percentage
      : 0;

  function isCorrect(exercise: Exercise) {
    const given = normalize(answers[exercise.id] || "");
    const correctAnswers = Array.isArray(exercise.answer)
      ? exercise.answer
      : [exercise.answer];

    return correctAnswers.some((answer) => normalize(answer) === given);
  }

  function canOpenLevel(targetLevel: number) {
    return reachedLevels.includes(targetLevel);
  }

  function saveCurrentLevelProgress(newChecked = checked) {
    setProgress((previous) => ({
      ...previous,
      [level]: {
        answers,
        checked: newChecked,
        percentage: newChecked ? percentage : previous[level]?.percentage || 0,
        score: newChecked ? score : previous[level]?.score || 0,
      },
    }));
  }

  function goToLevel(newLevel: number) {
    if (!canOpenLevel(newLevel)) return;

    saveCurrentLevelProgress();

    const seed = exerciseSeeds[newLevel] || Date.now() + newLevel;

    setExerciseSeeds((previous) => ({
      ...previous,
      [newLevel]: previous[newLevel] || seed,
    }));

    setSavedExercises((previous) => {
      if (previous[newLevel]) return previous;

      return {
        ...previous,
        [newLevel]: exerciseGenerator(newLevel, seed),
      };
    });

    const saved = progress[newLevel];

    if (saved) {
      setAnswers(saved.answers);
      setChecked(saved.checked);
    } else {
      setAnswers({});
      setChecked(false);
    }

    setLevel(newLevel);
  }

  function improve() {
    setChecked(true);

    setProgress((previous) => ({
      ...previous,
      [level]: {
        answers,
        checked: true,
        percentage,
        score,
      },
    }));

    if (percentage >= 75 && level < 10) {
      const next = level + 1;
      const seed = exerciseSeeds[next] || Date.now() + next;

      setReachedLevels((previous) =>
        previous.includes(next) ? previous : [...previous, next]
      );

      setExerciseSeeds((previous) => ({
        ...previous,
        [next]: previous[next] || seed,
      }));

      setSavedExercises((previous) => {
        if (previous[next]) return previous;

        return {
          ...previous,
          [next]: exerciseGenerator(next, seed),
        };
      });
    }
  }

  function nextLevel() {
    if (!checked || percentage < 75 || level === 10) {
      setChecked(true);
      return;
    }

    goToLevel(level + 1);
  }

  function previousLevel() {
    goToLevel(Math.max(level - 1, 1));
  }

  function resetCurrentLevel() {
    const seed = Date.now();
    const fresh = exerciseGenerator(level, seed);

    setExerciseSeeds((previous) => ({
      ...previous,
      [level]: seed,
    }));

    setSavedExercises((previous) => ({
      ...previous,
      [level]: fresh,
    }));

    setAnswers({});
    setChecked(false);

    setProgress((previous) => ({
      ...previous,
      [level]: {
        answers: {},
        checked: false,
        percentage: 0,
        score: 0,
      },
    }));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateAnswer(id: string, value: string) {
    const nextAnswers = {
      ...answers,
      [id]: value,
    };

    setAnswers(nextAnswers);

    setProgress((previous) => ({
      ...previous,
      [level]: {
        answers: nextAnswers,
        checked,
        percentage: previous[level]?.percentage || 0,
        score: previous[level]?.score || 0,
      },
    }));
  }

  const grouped = categories
    .map((category) => ({
      category,
      items: exercises.filter((exercise) => exercise.category === category),
    }))
    .filter((group) => group.items.length > 0);

  if (!loaded || exercises.length === 0) {
    return (
      <main className="oefenpagina">
<div className="exercise-back">
  <button
  type="button"
  className="back-button"
  onClick={() => {
    window.location.href = "/dashboard/oefenen";
  }}
>
  ← Terug naar leerjaren
</button>
</div>
        <section className="oefen-hero">
          <p className="eyebrow">Studio SaGo Leerlingportaal</p>
          <h1>Oefenklim wordt geladen...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="oefenpagina">
<div className="exercise-back">
<button
  type="button"
  className="back-button"
  onClick={() => {
    window.location.href = "/dashboard/oefenen";
  }}
>
  ← Terug naar leerjaren
</button></div>
      <section className="oefen-hero">
        <p className="eyebrow">Studio SaGo Leerlingportaal</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <MountainProgress
        level={level}
        reachedLevels={reachedLevels}
        displayedPercentage={displayedPercentage}
        displayedScore={displayedScore}
        total={exercises.length}
        checked={checked}
        savedChecked={Boolean(savedProgress?.checked)}
        percentage={percentage}
        onGoToLevel={goToLevel}
        onPrevious={previousLevel}
        onImprove={improve}
        onNext={nextLevel}
        onReset={resetCurrentLevel}
      />

      {grouped.map((group) => (
        <section className="exercise-section" key={group.category}>
          <h2>{group.category}</h2>

          <div className="exercise-grid">
            {group.items.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                value={answers[exercise.id] || ""}
                checked={checked}
                correct={isCorrect(exercise)}
                onChange={updateAnswer}
              />
            ))}
          </div>
        </section>
      ))}

      <BottomActions
        level={level}
        checked={checked}
        percentage={percentage}
        onPrevious={previousLevel}
        onImprove={improve}
        onNext={nextLevel}
        onReset={resetCurrentLevel}
      />
    </main>
  );
}