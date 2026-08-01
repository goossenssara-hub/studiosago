import type { Exercise } from "@/lib/oefeningen/types";

type Props = {
  exercise: Exercise;
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

export default function ExerciseCard({
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

  return (
    <article className={`single-exercise-card ${checked ? (correct ? "correct" : "wrong") : ""}`}>
      <header className="single-exercise-header">
        <div>
          <span className="goal-badge">{exercise.goalId}</span>
          <p className="exercise-step">Oefening {resolvedPosition + 1} van {resolvedTotal}</p>
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
          placeholder="Typ je antwoord..."
          onKeyDown={(event) => {
            if (event.key === "Enter") onCheck?.();
          }}
          autoFocus
        />
      </label>

      {exercise.hint ? (
        <details className="hint-box">
          <summary>Toon een kleine hint</summary>
          <p>{exercise.hint}</p>
        </details>
      ) : null}

      {checked ? (
        <div className={`formative-feedback ${correct ? "is-correct" : "needs-growth"}`} role="status">
          <strong>{correct ? "Mooi gevonden!" : "Kijk nog eens rustig."}</strong>
          <p>
            {correct
              ? "Je antwoord past bij deze oefening."
              : `Een passend antwoord is: ${Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer}`}
          </p>
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
