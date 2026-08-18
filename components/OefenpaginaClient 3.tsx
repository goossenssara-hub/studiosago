"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BottomActions from "@/components/oefenen/BottomActions";
import ExerciseCard from "@/components/oefenen/ExerciseCard";
import MountainProgress from "@/components/oefenen/MountainProgress";
import { categories } from "@/lib/oefeningen/data";
import { generateExercises } from "@/lib/oefeningen/generateExercises";
import type { Exercise, LevelProgress, SavedData } from "@/lib/oefeningen/types";
import { normalize } from "@/lib/oefeningen/utils";

const supabase = createClient();

const SCHOOL_YEARS = [
  {
    label: "1e leerjaar",
    cloudLevel: "eerste-leerjaar",
    storageKey: "sago-oefenklim-1e-leerjaar",
    visible: false,
  },
  {
    label: "2e leerjaar",
    cloudLevel: "tweede-leerjaar",
    storageKey: "sago-oefenklim-2e-leerjaar",
    visible: false,
  },
  {
    label: "3e leerjaar",
    cloudLevel: "derde-leerjaar",
    storageKey: "sago-oefenklim-3e-leerjaar",
    visible: false,
  },
  {
    label: "4e leerjaar",
    cloudLevel: "vierde-leerjaar",
    storageKey: "sago-oefenklim-4e-leerjaar",
    visible: true,
  },
  {
    label: "5e leerjaar",
    cloudLevel: "vijfde-leerjaar",
    storageKey: "sago-oefenklim-5e-leerjaar",
    visible: false,
  },
  {
    label: "6e leerjaar",
    cloudLevel: "zesde-leerjaar",
    storageKey: "sago-oefenklim-6e-leerjaar",
    visible: true,
  },
] as const;

type SchoolYear = (typeof SCHOOL_YEARS)[number];

export default function OefenpaginaClient() {
  const visibleYears = SCHOOL_YEARS.filter((item) => item.visible);
  const [selectedYear, setSelectedYear] = useState<SchoolYear>(visibleYears[0]);

  const [level, setLevel] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [reachedLevels, setReachedLevels] = useState<number[]>([1]);
  const [savedExercises, setSavedExercises] = useState<Record<number, Exercise[]>>({});
  const [progress, setProgress] = useState<Record<number, LevelProgress>>({});
  const [exerciseSeeds, setExerciseSeeds] = useState<Record<number, number>>({});
  const [loaded, setLoaded] = useState(false);
  const [storageKey, setStorageKey] = useState(`${selectedYear.storageKey}-gast`);

  useEffect(() => {
    async function loadLocalProgress() {
      setLoaded(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const key = user
        ? `${selectedYear.storageKey}-${user.id}`
        : `${selectedYear.storageKey}-gast`;

      setStorageKey(key);

      const stored = localStorage.getItem(key);

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
          } else {
            setAnswers({});
            setChecked(false);
          }
        } catch {
          localStorage.removeItem(key);
          resetState();
        }
      } else {
        resetState();
      }

      setLoaded(true);
    }

    loadLocalProgress();
  }, [selectedYear]);

  function resetState() {
    setLevel(1);
    setAnswers({});
    setChecked(false);
    setReachedLevels([1]);
    setSavedExercises({});
    setProgress({});
    setExerciseSeeds({});
  }

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
        1: generateExercises(1, seed),
      };
    });
  }, [loaded, exerciseSeeds]);

  const exercises = useMemo(
    () => savedExercises[level] || [],
    [level, savedExercises]
  );

  const score = exercises.reduce((total, exercise) => {
    const given = normalize(answers[exercise.id] || "");
    const correctAnswers = Array.isArray(exercise.answer)
      ? exercise.answer
      : [exercise.answer];

    const correct = correctAnswers.some(
      (answer) => normalize(answer) === given
    );

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

  async function saveToCloud() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      if (exercises.length === 0) return;

      await fetch("/api/exercises/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level: selectedYear.cloudLevel,
          subject: "algemeen",
          exerciseSlug: `${selectedYear.cloudLevel}-level-${level}`,
          currentQuestion: Object.keys(answers).length,
          totalQuestions: exercises.length,
          correctAnswers: score,
          wrongAnswers: exercises.length - score,
          completed: checked,
        }),
      });
    } catch (err) {
      console.error("Voortgang opslaan mislukt:", err);
    }
  }

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

    const timer = window.setTimeout(() => {
      saveToCloud();
    }, 600);

    return () => window.clearTimeout(timer);
  }, [
    level,
    reachedLevels,
    savedExercises,
    progress,
    exerciseSeeds,
    storageKey,
    loaded,
    selectedYear,
  ]);

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
        [newLevel]: generateExercises(newLevel, seed),
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
          [next]: generateExercises(next, seed),
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
    const fresh = generateExercises(level, seed);

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
        <section className="oefen-hero">
          <p className="eyebrow">Studio SaGo Leerlingportaal</p>
          <h1>Oefenklim wordt geladen...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="oefenpagina">
      <section className="oefen-hero">
        <p className="eyebrow">Studio SaGo Leerlingportaal</p>
        <h1>Oefenklim</h1>
        <p>
          Kies je leerjaar, maak oefeningen, verbeter automatisch en klim telkens
          een niveau hoger. Je hebt minstens 75% nodig om het volgende niveau
          vrij te spelen.
        </p>

        <div className="year-switcher">
          {visibleYears.map((year) => (
            <button
              key={year.cloudLevel}
              type="button"
              className={
                selectedYear.cloudLevel === year.cloudLevel
                  ? "year-pill active"
                  : "year-pill"
              }
              onClick={() => setSelectedYear(year)}
            >
              {year.label}
            </button>
          ))}
        </div>
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
          <h2>
            {group.category} — {selectedYear.label}
          </h2>

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