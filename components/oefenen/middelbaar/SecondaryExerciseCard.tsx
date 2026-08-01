"use client";

import { useMemo } from "react";
import type { SecondaryExercise } from "@/lib/oefeningen/middelbaar/types";
import { getSecondaryAnswerExamples } from "@/lib/oefeningen/middelbaar/utils";

type Props = {
  exercise: SecondaryExercise;
  position: number;
  total: number;
  value: string;
  checked: boolean;
  correct: boolean;
  attempts: number;
  onChange: (id: string, value: string) => void;
  onCheck: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

function seed(text: string) {
  let hash = 0;
  for (const character of text) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash;
}

function shuffle<T>(values: readonly T[], text: string) {
  const result = [...values];
  let state = seed(text);

  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = Math.floor((state / 4294967296) * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export default function SecondaryExerciseCard({
  exercise,
  position,
  total,
  value,
  checked,
  correct,
  attempts,
  onChange,
  onCheck,
  onPrevious,
  onNext,
}: Props) {
  const options = useMemo(
    () =>
      exercise.options?.length
        ? shuffle(exercise.options, exercise.id + exercise.question)
        : [],
    [exercise.id, exercise.options, exercise.question],
  );

  const revealAnswer = checked && !correct && attempts >= 2;
  const examples = getSecondaryAnswerExamples(exercise.answer);

  return (
    <article className={`single-exercise-card ${checked ? (correct ? "correct" : "wrong") : ""}`}>
      <header className="single-exercise-header">
        <div>
          <span className="goal-badge">Doel {exercise.goalId || "1A-B"}</span>
          <p className="exercise-step">Oefening {position + 1} van {total}</p>
        </div>
        <span className="skill-chip">{exercise.category}</span>
      </header>

      <div className="curriculum-goal">
        <small>Ik leer</small>
        <p>{exercise.goalText || exercise.category}</p>
      </div>

      <h2>{exercise.question}</h2>

      {options.length ? (
        <div className="secondary-option-grid" role="radiogroup" aria-label="Kies een antwoord">
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              className={`secondary-option ${value === option ? "selected" : ""}`}
              onClick={() => onChange(exercise.id, option)}
              role="radio"
              aria-checked={value === option}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {option}
            </button>
          ))}
        </div>
      ) : (
        <label className="answer-field">
          <span>Mijn antwoord</span>
          <input
            value={value}
            onChange={(event) => onChange(exercise.id, event.target.value)}
            placeholder="Typ je antwoord…"
            onKeyDown={(event) => {
              if (event.key === "Enter") onCheck();
            }}
            autoFocus
          />
        </label>
      )}

      {exercise.hint ? (
        <details className="hint-box">
          <summary>Ik wil een hint</summary>
          <p>{exercise.hint}</p>
        </details>
      ) : null}

      {checked ? (
        <div
          className={`formative-feedback ${correct ? "is-correct" : "needs-growth"}`}
          role="status"
        >
          <strong>
            {correct
              ? "Goed beredeneerd!"
              : attempts < 2
                ? "Nog niet helemaal. Probeer opnieuw."
                : "We bekijken mogelijke antwoorden."}
          </strong>

          {correct ? (
            <p>Je antwoord wordt aanvaard. Een gelijkwaardige formulering of notatie mag anders geschreven zijn.</p>
          ) : revealAnswer ? (
            <div>
              <p>Een passend antwoord kan op verschillende manieren geformuleerd worden.</p>
              <p>
                <strong>{examples.length > 1 ? "Mogelijke antwoorden:" : "Een mogelijk antwoord:"}</strong>{" "}
                {examples.join(" · ")}
              </p>
            </div>
          ) : (
            <p>Herlees de opdracht, gebruik de hint en probeer een andere aanpak. De oplossing blijft nog verborgen.</p>
          )}
        </div>
      ) : null}

      <div className="exercise-navigation">
        <button type="button" onClick={onPrevious} disabled={position === 0}>
          ← Vorige
        </button>
        <button
          type="button"
          className="check-answer-button"
          onClick={onCheck}
          disabled={!value.trim()}
        >
          Kijk mijn antwoord na
        </button>
        <button type="button" onClick={onNext} disabled={position === total - 1}>
          Volgende →
        </button>
      </div>
    </article>
  );
}
