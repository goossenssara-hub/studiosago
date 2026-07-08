import type { Exercise } from "@/lib/oefeningen/types";

type Props = {
  exercise: Exercise;
  index: number;
  value: string;
  checked: boolean;
  correct: boolean;
  onChange: (id: string, value: string) => void;
};

export default function ExerciseCard({
  exercise,
  index,
  value,
  checked,
  correct,
  onChange,
}: Props) {
  return (
    <article
      className={`exercise-card ${checked ? (correct ? "correct" : "wrong") : ""}`}
    >
      <p className="exercise-number">Vraag {index + 1}</p>
      <h3>{exercise.question}</h3>

      <input
        value={value}
        onChange={(event) => onChange(exercise.id, event.target.value)}
        placeholder="Typ je antwoord..."
      />

      {checked && (
        <p className="feedback">
          {correct
            ? "Juist!"
            : `Niet juist. Correct antwoord: ${
                Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer
              }`}
        </p>
      )}
    </article>
  );
}
