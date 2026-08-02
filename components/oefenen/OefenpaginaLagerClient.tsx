"use client";

import { useEffect, useMemo, useState } from "react";
import ExerciseCard from "@/components/oefenen/ExerciseCard";
import MountainProgress from "@/components/oefenen/MountainProgress";
import SubjectIcon from "@/components/oefenen/SubjectIcon";
import { generateExercisesLager } from "@/lib/oefeningen/generateExercisesLager";
import type { Exercise, LearningSubject, LevelProgress } from "@/lib/oefeningen/types";
import { normalize } from "@/lib/oefeningen/utils";

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
type StoredData = {
  level: number;
  reached: number[];
  seeds: Record<number, number>;
  exercises: Record<number, Exercise[]>;
  progress: Record<number, LevelProgress>;
};

const SUBJECT_META: Record<LearningSubject, { intro: string; accent: string }> = {
  Wiskunde: { intro: "Getallen, bewerkingen, meten en probleemoplossend denken.", accent: "math" },
  Taal: { intro: "Lezen, spelling, schrijven, woordenschat en taalbeschouwing.", accent: "language" },
  Wereldoriëntatie: { intro: "Mens, natuur, tijd, ruimte, techniek en maatschappij.", accent: "world" },
  Frans: { intro: "Woordenschat en functionele taal in herkenbare situaties.", accent: "french" },
};

export default function OefenpaginaLagerClient({ grade }: { grade: Grade }) {
  const storageKey = `sago-lager-${grade}-v4-een-oefening`;
  const [loaded, setLoaded] = useState(false);
  const [level, setLevel] = useState(1);
  const [reached, setReached] = useState<number[]>([1]);
  const [seeds, setSeeds] = useState<Record<number, number>>({});
  const [savedExercises, setSavedExercises] = useState<Record<number, Exercise[]>>({});
  const [progress, setProgress] = useState<Record<number, LevelProgress>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [activeSubject, setActiveSubject] = useState<LearningSubject>("Wiskunde");
  const [activeIndex, setActiveIndex] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw) as Partial<StoredData>;
        const savedLevel = Math.max(1, Math.min(10, data.level || 1));
        setLevel(savedLevel);
        setReached(data.reached || [1]);
        setSeeds(data.seeds || {});
        setSavedExercises(data.exercises || {});
        setProgress(data.progress || {});
        setAnswers(data.progress?.[savedLevel]?.answers || {});
      }
    } catch {
      localStorage.removeItem(storageKey);
    } finally {
      setLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    const seed = seeds[level] || Date.now() + grade * 100 + level;
    setSeeds((current) => ({ ...current, [level]: current[level] || seed }));
    setSavedExercises((current) =>
      current[level]
        ? current
        : { ...current, [level]: generateExercisesLager(grade, level, seed) }
    );
  }, [grade, level, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ level, reached, seeds, exercises: savedExercises, progress } satisfies StoredData)
    );
  }, [level, loaded, progress, reached, savedExercises, seeds, storageKey]);

  const exercises = useMemo(() => savedExercises[level] || [], [level, savedExercises]);
  const subjects = useMemo(
    () => Array.from(new Set(exercises.map((item) => item.subject))).filter(Boolean) as LearningSubject[],
    [exercises]
  );
  const subjectExercises = useMemo(
    () => exercises.filter((item) => item.subject === activeSubject),
    [activeSubject, exercises]
  );
  const currentExercise = subjectExercises[activeIndex] || subjectExercises[0];

  useEffect(() => {
    if (subjects.length && !subjects.includes(activeSubject)) setActiveSubject(subjects[0]);
  }, [activeSubject, subjects]);

  useEffect(() => setActiveIndex(0), [activeSubject, level]);

  function isCorrect(item: Exercise) {
    const given = normalize(answers[item.id] || "");
    const accepted = Array.isArray(item.answer) ? item.answer : [item.answer];
    return accepted.some((answer) => normalize(answer) === given);
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
    if (!currentExercise) return;
    setCheckedIds((current) => ({ ...current, [currentExercise.id]: true }));
    setAttempts((current) => ({
      ...current,
      [currentExercise.id]: (current[currentExercise.id] || 0) + 1,
    }));
    const correct = exercises.filter(isCorrect).length;
    const answered = exercises.filter((item) => (answers[item.id] || "").trim()).length;
    const mastery = exercises.length ? Math.round((correct / exercises.length) * 100) : 0;
    setProgress((current) => ({
      ...current,
      [level]: { answers, checked: answered === exercises.length, percentage: mastery, score: correct },
    }));
    if (answered === exercises.length && mastery >= 75 && level < 10) {
      setReached((current) => (current.includes(level + 1) ? current : [...current, level + 1]));
    }
  }

  function goToLevel(target: number) {
    if (!reached.includes(target)) return;
    setLevel(target);
    setAnswers(progress[target]?.answers || {});
    setCheckedIds({});
    setAttempts({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function newExercises() {
    const seed = Date.now();
    setSeeds((current) => ({ ...current, [level]: seed }));
    setSavedExercises((current) => ({
      ...current,
      [level]: generateExercisesLager(grade, level, seed),
    }));
    setAnswers({});
    setCheckedIds({});
    setAttempts({});
    setActiveIndex(0);
  }

  if (!loaded || !currentExercise) {
    return <main className="oefenpagina curriculum-exercise-page"><section className="oefen-hero"><h1>Oefeningen laden…</h1></section></main>;
  }

  const completedCount = subjectExercises.filter((item) => (answers[item.id] || "").trim()).length;
  const totalCompleted = exercises.filter((item) => (answers[item.id] || "").trim()).length;

  return (
    <main className="oefenpagina curriculum-exercise-page">
      <div className="exercise-back">
        <button type="button" className="back-button" onClick={() => { window.location.href = "/dashboard/oefenen"; }}>
          ← Terug naar leerjaren
        </button>
      </div>

      <section className="oefen-hero refined-hero">
        <p className="eyebrow">{grade}e leerjaar · doelgericht oefenen</p>
        <h1>Oefen rustig, één stap per keer</h1>
        <p>Kies een leergebied en werk door een ruime, afwisselende oefenreeks die meegroeit met elk niveau.</p>
        <div className="hero-learning-summary" aria-label="Samenvatting oefenreeks">
          <span><strong>{exercises.length}</strong> oefeningen in dit niveau</span>
          <span><strong>{totalCompleted}</strong> ingevuld</span>
          <span><strong>{subjects.length}</strong> leergebieden</span>
        </div>
      </section>

      <MountainProgress level={level} reachedLevels={reached} completedCount={completedCount} total={subjectExercises.length} onGoToLevel={goToLevel} />

      <section className="subject-picker" aria-labelledby="subject-heading">
        <div className="section-heading-row">
          <div><p className="eyebrow">Kies een onderdeel</p><h2 id="subject-heading">Wat wil je oefenen?</h2></div>
          <button type="button" className="new-exercises-button" onClick={newExercises}>Nieuwe oefenreeks</button>
        </div>
        <div className="subject-grid">
          {subjects.map((subject) => {
            const meta = SUBJECT_META[subject];
            const subjectItems = exercises.filter((item) => item.subject === subject);
            const count = subjectItems.length;
            const done = subjectItems.filter((item) => (answers[item.id] || "").trim()).length;
            const progressValue = count ? Math.round((done / count) * 100) : 0;
            return (
              <button
                key={subject}
                type="button"
                className={`subject-card subject-${meta.accent} ${activeSubject === subject ? "active" : ""}`}
                onClick={() => setActiveSubject(subject)}
                aria-pressed={activeSubject === subject}
              >
                <span className="subject-icon"><SubjectIcon subject={subject} /></span>
                <span className="subject-card-copy">
                  <span className="subject-card-title-row">
                    <strong>{subject}</strong>
                    {activeSubject === subject ? <span className="active-subject-chip">Gekozen</span> : null}
                  </span>
                  <small>{meta.intro}</small>
                </span>
                <span className="subject-card-footer">
                  <em>{count} oefeningen</em>
                  <span className="subject-mini-progress" aria-label={`${done} van ${count} ingevuld`}>
                    <span style={{ width: `${progressValue}%` }} />
                  </span>
                  <small>{done} ingevuld</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="single-exercise-workspace">
        <aside className="exercise-sidebar" aria-label="Oefeningen binnen dit onderdeel">
          <p className="eyebrow">{activeSubject}</p><h2>Oefeningen</h2>
          <div className="exercise-step-list">
            {subjectExercises.map((item, index) => (
              <button key={item.id} type="button" className={index === activeIndex ? "active" : ""} onClick={() => setActiveIndex(index)}>
                <span>{index + 1}</span><div><strong>{item.skill}</strong><small>{(answers[item.id] || "").trim() ? "Ingevuld" : "Nog te ontdekken"}</small></div>
              </button>
            ))}
          </div>
        </aside>

        <ExerciseCard
          exercise={currentExercise}
          position={activeIndex}
          total={subjectExercises.length}
          value={answers[currentExercise.id] || ""}
          checked={Boolean(checkedIds[currentExercise.id])}
          correct={isCorrect(currentExercise)}
          attempts={attempts[currentExercise.id] || 0}
          onChange={updateAnswer}
          onCheck={checkCurrentAnswer}
          onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveIndex((index) => Math.min(subjectExercises.length - 1, index + 1))}
        />
      </section>
    </main>
  );
}
