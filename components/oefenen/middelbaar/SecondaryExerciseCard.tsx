"use client";

import { useMemo } from "react";
import type { SecondaryExercise } from "@/lib/oefeningen/middelbaar/types";

type Props = {
  exercise: SecondaryExercise;
  position?: number;
  index?: number;
  total?: number;
  value: string;
  checked: boolean;
  correct: boolean;
  onChange: (id: string, value: string) => void;
  onCheck?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
};

function createSeed(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  return hash;
}

function shuffleStable<T>(values: readonly T[], seedText: string): T[] {
  const shuffled = [...values];
  let seed = createSeed(seedText);
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let currentIndex = shuffled.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(random() * (currentIndex + 1));
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }
  return shuffled;
}

export default function SecondaryExerciseCard({
  exercise,
  position,
  index,
  total,
  value,
  checked,
  correct,
  onChange,
  onCheck,
  onPrevious,
  onNext,
}: Props) {
  const resolvedPosition = position ?? index ?? 0;
  const resolvedTotal = total ?? 1;
  const showNavigation = Boolean(onCheck || onPrevious || onNext);
  const acceptedAnswers = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer];
  const correctAnswer = acceptedAnswers[0];
  const hasOptions = Boolean(exercise.options?.length);
  const shuffledOptions = useMemo(
    () => (exercise.options?.length ? shuffleStable(exercise.options, `${exercise.id}-${exercise.question}`) : []),
    [exercise.id, exercise.options, exercise.question]
  );

  return (
    <article className={`single-exercise-card ${checked ? (correct ? "correct" : "wrong") : ""}`}>
      <header className="single-exercise-header">
        <div>
          <span className="goal-badge">Eerste middelbaar</span>
          <p className="exercise-step">Oefening {resolvedPosition + 1} van {resolvedTotal}</p>
        </div>
        <span className="skill-chip">{exercise.category}</span>
      </header>

      <div className="curriculum-goal">
        <small>Ik oefen</small>
        <p>{exercise.category}</p>
      </div>

      <h2>{exercise.question}</h2>

      {hasOptions ? (
        <div className="secondary-option-grid" role="radiogroup" aria-label="Kies een antwoord">
          {shuffledOptions.map((option, index) => (
            <button
              key={`${exercise.id}-${option}`}
              type="button"
              className={`secondary-option ${value === option ? "selected" : ""}`}
              onClick={() => onChange(exercise.id, option)}
              aria-checked={value === option}
              role="radio"
            >
              <span>{String.fromCharCode(65 + index)}</span>{option}
            </button>
          ))}
        </div>
      ) : (
        <label className="answer-field">
          <span>Mijn antwoord</span>
          <input
            value={value}
            onChange={(event) => onChange(exercise.id, event.target.value)}
            placeholder="Typ je antwoord..."
            onKeyDown={(event) => { if (event.key === "Enter") onCheck?.(); }}
            autoFocus
          />
        </label>
      )}

      {checked ? (
        <div className={`formative-feedback ${correct ? "is-correct" : "needs-growth"}`} role="status">
          <strong>{correct ? "Mooi gevonden!" : "Kijk nog eens rustig."}</strong>
          <p>{correct ? "Je antwoord past bij deze oefening." : `Een passend antwoord is: ${correctAnswer}`}</p>
        </div>
      ) : null}

      {showNavigation ? (
        <div className="exercise-navigation">
          <button type="button" onClick={onPrevious} disabled={!onPrevious || resolvedPosition === 0}>
            ← Vorige
          </button>
          <button type="button" className="check-answer-button" onClick={onCheck} disabled={!onCheck}>
            Kijk mijn antwoord na
          </button>
          <button type="button" onClick={onNext} disabled={!onNext || resolvedPosition === resolvedTotal - 1}>
            Volgende →
          </button>
        </div>
      ) : null}
    </article>
  );
}
