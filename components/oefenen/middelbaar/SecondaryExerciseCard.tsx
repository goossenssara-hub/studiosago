"use client";

import type { SecondaryExercise } from "@/lib/oefeningen/middelbaar/types";

type Props = {
  exercise: SecondaryExercise;
  index: number;
  value: string;
  checked: boolean;
  correct: boolean;
  onChange: (id: string, value: string) => void;
};

export default function SecondaryExerciseCard({
  exercise,
  index,
  value,
  checked,
  correct,
  onChange,
}: Props) {
  return (
    <article
      className={[
        "exercise-card",
        checked ? (correct ? "correct" : "wrong") : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="exercise-number">Oefening {index + 1}</p>

      {exercise.instruction && (
        <p className="exercise-instruction">{exercise.instruction}</p>
      )}

      <h3>{exercise.prompt}</h3>

      {exercise.strategy && exercise.strategy.length > 0 && (
        <details className="strategy-box">
          <summary>Gebruik het stappenplan</summary>
          <ol>
            {exercise.strategy.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </details>
      )}

      {exercise.type === "choice" ? (
        <div className="choice-grid">
          {exercise.options?.map((option) => (
            <button
              className={value === option ? "choice-option selected" : "choice-option"}
              key={option}
              onClick={() => onChange(exercise.id, option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      ) : exercise.type === "multiline" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(exercise.id, event.target.value)}
          placeholder="Schrijf hier je antwoord..."
          rows={5}
        />
      ) : (
        <input
          inputMode={exercise.type === "number" ? "decimal" : "text"}
          value={value}
          onChange={(event) => onChange(exercise.id, event.target.value)}
          placeholder="Typ je antwoord..."
        />
      )}

      {checked && (
        <div className="feedback">
          <strong>{correct ? "Goed gedaan!" : "Kijk nog eens naar de vraag."}</strong>
          {exercise.explanation && <p>{exercise.explanation}</p>}
        </div>
      )}
    </article>
  );
}
