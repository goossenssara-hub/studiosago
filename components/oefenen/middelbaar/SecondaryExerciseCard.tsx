"use client";

import { useMemo } from "react";
import type { SecondaryExercise } from "@/lib/oefeningen/middelbaar/types";

type Props = {
  exercise: SecondaryExercise;
  index: number;
  value: string;
  checked: boolean;
  correct: boolean;
  onChange: (id: string, value: string) => void;
};

function createSeed(text: string) {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function shuffleStable<T>(
  values: readonly T[],
  seedText: string
): T[] {
  const shuffled = [...values];
  let seed = createSeed(seedText);

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  for (
    let currentIndex = shuffled.length - 1;
    currentIndex > 0;
    currentIndex -= 1
  ) {
    const randomIndex = Math.floor(
      random() * (currentIndex + 1)
    );

    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  return shuffled;
}

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

  const acceptedAnswers = Array.isArray(exercise.answer)
    ? exercise.answer
    : [exercise.answer];

  const hasOptions =
    Array.isArray(exercise.options) &&
    exercise.options.length > 0;

  const shuffledOptions = useMemo(() => {
    if (!exercise.options?.length) {
      return [];
    }

    return shuffleStable(
      exercise.options,
      `${exercise.id}-${exercise.question}`
    );
  }, [
    exercise.id,
    exercise.options,
    exercise.question,
  ]);

  return (
    <article
      className={[
        "exercise-card",
        hasOptions ? "exercise-card-choice" : "",
        checked
          ? correct
            ? "correct"
            : "wrong"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
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
          aria-label={`Antwoord op oefening ${
            index + 1
          }`}
        >
          {shuffledOptions.map(
            (option, optionIndex) => {
              const selected = value === option;
              const optionCorrect =
                acceptedAnswers.includes(option);

              const optionClassName = [
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
                .join(" ");

              return (
                <button
                  key={`${exercise.id}-${option}`}
                  type="button"
                  disabled={checked}
                  role="radio"
                  aria-checked={selected}
                  aria-label={`Optie ${String.fromCharCode(
                    65 + optionIndex
                  )}: ${option}`}
                  onClick={() =>
                    onChange(
                      exercise.id,
                      option
                    )
                  }
                  className={optionClassName}
                >
                  <span
                    className="exercise-option-letter"
                    aria-hidden="true"
                  >
                    {String.fromCharCode(
                      65 + optionIndex
                    )}
                  </span>

                  <span className="exercise-option-text">
                    {option}
                  </span>

                  <span
                    className="exercise-option-status"
                    aria-hidden="true"
                  >
                    {checked && optionCorrect
                      ? "✓"
                      : checked &&
                          selected &&
                          !optionCorrect
                        ? "×"
                        : selected
                          ? "✓"
                          : ""}
                  </span>
                </button>
              );
            }
          )}
        </div>
      ) : (
        <input
          className="exercise-answer-input"
          aria-label={`Antwoord op oefening ${
            index + 1
          }`}
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
          className={[
            "exercise-feedback",
            correct
              ? "feedback-correct"
              : "feedback-wrong",
          ].join(" ")}
        >
          <span
            className="feedback-icon"
            aria-hidden="true"
          >
            {correct ? "✓" : "!"}
          </span>

          <div className="exercise-feedback-content">
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