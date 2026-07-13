"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { generateExercisesEerste } from "@/lib/oefeningen/middelbaar/generateExercisesEerste";
import { getSkillConfig } from "@/lib/oefeningen/middelbaar/skills";
import type {
  SecondaryExercise,
  SecondaryLevelProgress,
  SecondarySavedData,
} from "@/lib/oefeningen/middelbaar/types";
import { normalizeSecondary } from "@/lib/oefeningen/middelbaar/utils";
import SecondaryExerciseCard from "./SecondaryExerciseCard";
import SecondaryMountainProgress from "./SecondaryMountainProgress";

type Props = {
  skill: string;
};

export default function OefenpaginaEersteMiddelbaarClient({ skill }: Props) {
  const config = getSkillConfig(skill);

  // Nieuwe opslagversie: oude algemene oefeningen uit v2 worden niet
  // opnieuw geladen. Elk onderdeel bouwt daardoor meteen de correcte
  // oefeningen op met de huidige generator.
  const storageKey = `sago-oefenklim-eerste-middelbaar-${skill}-v3`;

  const [level, setLevel] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [reachedLevels, setReachedLevels] = useState<number[]>([1]);
  const [savedExercises, setSavedExercises] = useState<
    Record<number, SecondaryExercise[]>
  >({});
  const [progress, setProgress] = useState<
    Record<number, SecondaryLevelProgress>
  >({});
  const [exerciseSeeds, setExerciseSeeds] = useState<Record<number, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const data: SecondarySavedData = JSON.parse(stored);
        const savedLevel = Math.max(1, Math.min(10, data.level || 1));
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
    if (!loaded || !config) return;

    setSavedExercises((previous) => {
      if (previous[1]) return previous;

      const seed = Date.now();

      setExerciseSeeds((oldSeeds) => ({
        ...oldSeeds,
        1: oldSeeds[1] || seed,
      }));

      return {
        ...previous,
        1: generateExercisesEerste(skill, 1, seed),
      };
    });
  }, [config, loaded, skill]);

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
  }, [
    exerciseSeeds,
    level,
    loaded,
    progress,
    reachedLevels,
    savedExercises,
    storageKey,
  ]);

  const exercises = useMemo(
    () => savedExercises[level] || [],
    [level, savedExercises]
  );

  const grouped = useMemo(() => {
    const categories = Array.from(
      new Set(exercises.map((exercise) => exercise.category))
    );

    return categories.map((category) => ({
      category,
      items: exercises.filter((exercise) => exercise.category === category),
    }));
  }, [exercises]);

  function isCorrect(exercise: SecondaryExercise) {
    const given = normalizeSecondary(answers[exercise.id] || "");
    const accepted = Array.isArray(exercise.answer)
      ? exercise.answer
      : [exercise.answer];

    return accepted.some(
      (answer) => normalizeSecondary(answer) === given
    );
  }

  const score = exercises.reduce(
    (total, exercise) => total + (isCorrect(exercise) ? 1 : 0),
    0
  );

  const percentage =
    exercises.length > 0 ? Math.round((score / exercises.length) * 100) : 0;

  const savedProgress = progress[level];
  const displayedScore = savedProgress?.checked ? savedProgress.score : score;
  const displayedPercentage = savedProgress?.checked
    ? savedProgress.percentage
    : checked
      ? percentage
      : 0;

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
    if (!reachedLevels.includes(newLevel)) return;

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
        [newLevel]: generateExercisesEerste(skill, newLevel, seed),
      };
    });

    const saved = progress[newLevel];

    setAnswers(saved?.answers || {});
    setChecked(saved?.checked || false);
    setLevel(newLevel);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          [next]: generateExercisesEerste(skill, next, seed),
        };
      });
    }
  }

  function resetCurrentLevel() {
    const seed = Date.now();

    setExerciseSeeds((previous) => ({
      ...previous,
      [level]: seed,
    }));

    setSavedExercises((previous) => ({
      ...previous,
      [level]: generateExercisesEerste(skill, level, seed),
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

  if (!config) {
    return (
      <main className="oefenpagina">
        <div className="exercise-back">
          <Link className="back-button" href="/oefenen/middelbaar/eerste">
            ← Terug naar de vaardigheden
          </Link>
        </div>

        <section className="oefen-hero">
          <h1>Deze oefenreeks bestaat niet.</h1>
        </section>
      </main>
    );
  }

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
      <div className="exercise-back">
        <Link className="back-button" href="/oefenen/middelbaar/eerste">
          ← Terug naar de vaardigheden
        </Link>
      </div>

      <section className="oefen-hero">
        <p className="eyebrow">
          {config.subject} · Eerste middelbaar · Niveau {level}
        </p>
        <h1>
          {config.icon} {config.title}
        </h1>
        <p>{config.description}</p>
      </section>

      <SecondaryMountainProgress
        level={level}
        reachedLevels={reachedLevels}
        displayedPercentage={displayedPercentage}
        displayedScore={displayedScore}
        total={exercises.length}
        percentage={percentage}
        checked={checked}
        onGoToLevel={goToLevel}
        onPrevious={() => goToLevel(Math.max(1, level - 1))}
        onImprove={improve}
        onNext={() => {
          if (checked && percentage >= 75 && level < 10) {
            goToLevel(level + 1);
          }
        }}
        onReset={resetCurrentLevel}
      />

      {grouped.map((group) => (
        <section className="exercise-section" key={group.category}>
          <h2>{group.category}</h2>

          <div className="exercise-grid">
            {group.items.map((exercise, index) => (
              <SecondaryExerciseCard
                checked={checked}
                correct={isCorrect(exercise)}
                exercise={exercise}
                index={index}
                key={exercise.id}
                onChange={updateAnswer}
                value={answers[exercise.id] || ""}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="bottom-journey-actions">
        <button
          disabled={level === 1}
          onClick={() => goToLevel(Math.max(1, level - 1))}
          type="button"
        >
          ← Vorig niveau
        </button>

        <button className="primary" onClick={improve} type="button">
          Verbeter mijn antwoorden
        </button>

        <button
          disabled={!checked || percentage < 75 || level === 10}
          onClick={() => goToLevel(level + 1)}
          type="button"
        >
          Volgend niveau →
        </button>

        <button className="refresh" onClick={resetCurrentLevel} type="button">
          Nieuwe oefeningen
        </button>

        {checked && percentage < 75 && (
          <p className="level-warning">
            Je behaalde {percentage}%. Vanaf 75% speel je het volgende niveau vrij.
          </p>
        )}
      </div>
    </main>
  );
}
