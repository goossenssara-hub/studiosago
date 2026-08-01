import type { Exercise } from "@/lib/oefeningen/types";
import { getAnswerExamples } from "@/lib/oefeningen/utils";

type Props = {
  exercise: Exercise;
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

export default function ExerciseCard({
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
  const revealAnswer = checked && !correct && attempts >= 2;
  const examples = getAnswerExamples(exercise.answer);

  return (
    <article className={`single-exercise-card ${checked ? (correct ? "correct" : "wrong") : ""}`}>
      <header className="single-exercise-header">
        <div>
          <span className="goal-badge">Doel {exercise.goalId}</span>
          <p className="exercise-step">Oefening {position + 1} van {total}</p>
        </div>
        <span className="skill-chip">{exercise.skill}</span>
      </header>

      <div className="curriculum-goal">
        <small>Ik leer</small>
        <p>{exercise.goalText}</p>
      </div>

      <h2>{exercise.question}</h2>

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
              ? "Goed gedaan!"
              : attempts < 2
                ? "Nog niet helemaal. Probeer opnieuw."
                : "We bekijken mogelijke antwoorden."}
          </strong>

          {correct ? (
            <p>Je antwoord wordt aanvaard. Hoofdletters, leestekens en gelijkwaardige notaties mogen verschillen.</p>
          ) : revealAnswer ? (
            <div>
              <p>Een passend antwoord kan op verschillende manieren geschreven worden.</p>
              <p>
                <strong>{examples.length > 1 ? "Mogelijke antwoorden:" : "Een mogelijk antwoord:"}</strong>{" "}
                {examples.join(" · ")}
              </p>
            </div>
          ) : (
            <p>Lees de vraag opnieuw, open de hint en pas één concrete stap toe. De oplossing blijft nog verborgen.</p>
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
