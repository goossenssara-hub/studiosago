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
  const correctAnswer = Array.isArray(exercise.answer)
    ? exercise.answer[0]
    : exercise.answer;

  return (
    <article
      className={`exercise-card ${
        checked ? (correct ? "correct" : "wrong") : ""
      }`}
    >
      <p className="exercise-number">Oefening {index + 1}</p>

      <h3 className="exercise-question">
        {exercise.question}
      </h3>

      <input
        aria-label={`Antwoord op oefening ${index + 1}`}
        autoComplete="off"
        disabled={checked}
        onChange={(event) =>
          onChange(exercise.id, event.target.value)
        }
        placeholder="Typ je antwoord..."
        type="text"
        value={value}
      />

      {checked && (
        <p
          className={`feedback ${
            correct ? "feedback-correct" : "feedback-wrong"
          }`}
        >
          {correct
            ? "Juist! Goed gedaan."
            : `Nog niet juist. Correct antwoord: ${correctAnswer}`}
        </p>
      )}
    </article>
  );
}
