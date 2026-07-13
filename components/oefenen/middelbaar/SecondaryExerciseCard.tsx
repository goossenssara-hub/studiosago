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

  const answers = Array.isArray(exercise.answer)
    ? exercise.answer
    : [exercise.answer];

  const hasOptions =
    Array.isArray(exercise.options) &&
    exercise.options.length > 0;

  return (
    <article
      className={`exercise-card ${
        checked ? (correct ? "correct" : "wrong") : ""
      }`}
    >
      <div className="exercise-header">
        <p className="exercise-number">
          Oefening {index + 1}
        </p>

        {hasOptions && (
          <span className="exercise-badge">
            Meerkeuze
          </span>
        )}
      </div>

      <h3 className="exercise-question">
        {exercise.question}
      </h3>

      {hasOptions ? (
        <div
          className="exercise-options"
          role="radiogroup"
          aria-label={`Antwoord op oefening ${index + 1}`}
        >
          {exercise.options!.map((option, optionIndex) => {
            const selected = value === option;
            const optionCorrect =
              answers.includes(option);

            return (
              <button
                key={option}
                type="button"
                disabled={checked}
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  onChange(exercise.id, option)
                }
                className={[
                  "exercise-option",
                  selected ? "selected" : "",
                  checked && optionCorrect
                    ? "option-correct"
                    : "",
                  checked &&
                  selected &&
                  !optionCorrect
                    ? "option-wrong"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="exercise-option-letter">
                  {String.fromCharCode(
                    65 + optionIndex
                  )}
                </span>

                <span className="exercise-option-text">
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <input
          aria-label={`Antwoord op oefening ${index + 1}`}
          autoComplete="off"
          disabled={checked}
          onChange={(event) =>
            onChange(
              exercise.id,
              event.target.value
            )
          }
          placeholder="Typ je antwoord..."
          type="text"
          value={value}
        />
      )}

      {checked && (
        <div
          className={`exercise-feedback ${
            correct
              ? "feedback-correct"
              : "feedback-wrong"
          }`}
        >
          <span className="feedback-icon">
            {correct ? "✓" : "!"}
          </span>

          <div>
            <strong>
              {correct
                ? "Juist! Goed gedaan."
                : "Nog niet juist."}
            </strong>

            {!correct && (
              <p>
                Correct antwoord:
                <br />
                <strong>
                  {correctAnswer}
                </strong>
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}