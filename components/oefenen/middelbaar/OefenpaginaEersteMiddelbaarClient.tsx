"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MountainProgress from "@/components/oefenen/MountainProgress";
import { generateExercisesEerste } from "@/lib/oefeningen/middelbaar/generateExercisesEerste";
import { getSkillConfig } from "@/lib/oefeningen/middelbaar/skills";
import type { SecondaryExercise, SecondaryLevelProgress, SecondarySavedData } from "@/lib/oefeningen/middelbaar/types";
import { isAcceptedSecondaryAnswer } from "@/lib/oefeningen/middelbaar/utils";
import SecondaryExerciseCard from "./SecondaryExerciseCard";

type Props = { skill: string };

export default function OefenpaginaEersteMiddelbaarClient({ skill }: Props) {
  const config = getSkillConfig(skill);
  const storageKey = `sago-eerste-middelbaar-${skill}-premium-v9`;
  const [level, setLevel] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [reachedLevels, setReachedLevels] = useState<number[]>([1]);
  const [savedExercises, setSavedExercises] = useState<Record<number, SecondaryExercise[]>>({});
  const [progress, setProgress] = useState<Record<number, SecondaryLevelProgress>>({});
  const [exerciseSeeds, setExerciseSeeds] = useState<Record<number, number>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored) as SecondarySavedData;
        const savedLevel = Math.max(1, Math.min(10, data.level || 1));
        setLevel(savedLevel);
        setReachedLevels(data.reachedLevels || [1]);
        setSavedExercises(data.savedExercises || {});
        setProgress(data.progress || {});
        setExerciseSeeds(data.exerciseSeeds || {});
        setAnswers(data.progress?.[savedLevel]?.answers || {});
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded || !config) return;
    const seed = exerciseSeeds[level] || Date.now() + level;
    setExerciseSeeds((current) => ({ ...current, [level]: current[level] || seed }));
    setSavedExercises((current) =>
      current[level] ? current : { ...current, [level]: generateExercisesEerste(skill, level, seed) }
    );
  }, [config, level, loaded, skill]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKey, JSON.stringify({ level, reachedLevels, savedExercises, progress, exerciseSeeds }));
  }, [exerciseSeeds, level, loaded, progress, reachedLevels, savedExercises, storageKey]);

  useEffect(() => setActiveIndex(0), [level, skill]);

  const exercises = useMemo(() => savedExercises[level] || [], [level, savedExercises]);
  const currentExercise = exercises[activeIndex] || exercises[0];

  function isCorrect(exercise: SecondaryExercise) {
    return isAcceptedSecondaryAnswer(answers[exercise.id] || "", exercise.answer);
  }

  function updateAnswer(id: string, value: string) {
    const nextAnswers = { ...answers, [id]: value };
    setAnswers(nextAnswers);
    setCheckedIds((current) => ({ ...current, [id]: false }));
    setProgress((current) => ({
      ...current,
      [level]: {
        answers: nextAnswers,
        checked: false,
        percentage: current[level]?.percentage || 0,
        score: current[level]?.score || 0,
      },
    }));
  }

  function checkCurrentAnswer() {
    if (!currentExercise || !(answers[currentExercise.id] || "").trim()) return;
    setCheckedIds((current) => ({ ...current, [currentExercise.id]: true }));
    setAttempts((current) => ({ ...current, [currentExercise.id]: (current[currentExercise.id] || 0) + 1 }));
    const correct = exercises.filter(isCorrect).length;
    const answered = exercises.filter((item) => (answers[item.id] || "").trim()).length;
    const mastery = exercises.length ? Math.round((correct / exercises.length) * 100) : 0;
    setProgress((current) => ({
      ...current,
      [level]: { answers, checked: answered === exercises.length, percentage: mastery, score: correct },
    }));
    if (answered === exercises.length && mastery >= 75 && level < 10) {
      setReachedLevels((current) => current.includes(level + 1) ? current : [...current, level + 1]);
    }
  }

  function goToLevel(target: number) {
    if (!reachedLevels.includes(target)) return;
    setLevel(target);
    setAnswers(progress[target]?.answers || {});
    setCheckedIds({});
    setAttempts({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function newExercises() {
    if (!config) return;
    const seed = Date.now();
    setExerciseSeeds((current) => ({ ...current, [level]: seed }));
    setSavedExercises((current) => ({ ...current, [level]: generateExercisesEerste(skill, level, seed) }));
    setAnswers({});
    setCheckedIds({});
    setAttempts({});
    setActiveIndex(0);
  }

  if (!config) {
    return <main className="oefenpagina curriculum-exercise-page"><section className="oefen-hero"><h1>Deze oefenreeks bestaat niet.</h1></section></main>;
  }

  if (!loaded || !currentExercise) {
    return <main className="oefenpagina curriculum-exercise-page"><section className="oefen-hero"><h1>Oefeningen laden…</h1></section></main>;
  }

  const completedCount = exercises.filter((item) => (answers[item.id] || "").trim()).length;

  return (
    <main className="oefenpagina curriculum-exercise-page">
      <div className="exercise-back"><Link className="back-button" href="/oefenen/middelbaar/eerste">← Terug naar de vaardigheden</Link></div>

      <section className="oefen-hero refined-hero">
        <p className="eyebrow">{config.subject} · Eerste middelbaar</p>
        <h1>{config.icon} {config.title}</h1>
        <p>{config.description} Je krijgt telkens één oefening in beeld.</p>
      </section>

      <MountainProgress level={level} reachedLevels={reachedLevels} completedCount={completedCount} total={exercises.length} onGoToLevel={goToLevel} />

      <section className="subject-picker secondary-skill-summary">
        <div className="section-heading-row">
          <div><p className="eyebrow">Deze vaardigheid</p><h2>Waar werk je aan?</h2></div>
          <button type="button" className="new-exercises-button" onClick={newExercises}>Nieuwe oefenreeks</button>
        </div>
        <div className="focus-chip-row">{config.focus.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      <section className="single-exercise-workspace">
        <aside className="exercise-sidebar" aria-label="Oefeningen binnen deze vaardigheid">
          <p className="eyebrow">{config.subject}</p><h2>Oefeningen</h2>
          <div className="exercise-step-list">
            {exercises.map((item, index) => (
              <button key={item.id} type="button" className={index === activeIndex ? "active" : ""} onClick={() => setActiveIndex(index)}>
                <span>{index + 1}</span><div><strong>{item.category}</strong><small>{(answers[item.id] || "").trim() ? "Ingevuld" : "Nog te ontdekken"}</small></div>
              </button>
            ))}
          </div>
        </aside>

        <SecondaryExerciseCard
          exercise={currentExercise}
          position={activeIndex}
          total={exercises.length}
          value={answers[currentExercise.id] || ""}
          checked={Boolean(checkedIds[currentExercise.id])}
          correct={isCorrect(currentExercise)}
          attempts={attempts[currentExercise.id] || 0}
          onChange={updateAnswer}
          onCheck={checkCurrentAnswer}
          onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveIndex((index) => Math.min(exercises.length - 1, index + 1))}
        />
      </section>
    </main>
  );
}
