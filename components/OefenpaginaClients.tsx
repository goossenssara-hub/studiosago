"use client";

import { useMemo, useState } from "react";

type Exercise = {
  id: string;
  category: string;
  question: string;
  answer: string | string[];
  placeholder?: string;
};

const exercises: Exercise[] = [
  // Spelling persoonsvorm
  {
    id: "pv1",
    category: "Spelling: persoonsvorm",
    question: "Duid de persoonsvorm aan: Morgen fietsen wij naar de zee.",
    answer: "fietsen",
  },
  {
    id: "pv2",
    category: "Spelling: persoonsvorm",
    question: "Duid de persoonsvorm aan: De hond blaft luid.",
    answer: "blaft",
  },
  {
    id: "pv3",
    category: "Spelling: persoonsvorm",
    question: "Vul aan: Ik ___ naar school. (lopen)",
    answer: "loop",
  },
  {
    id: "pv4",
    category: "Spelling: persoonsvorm",
    question: "Vul aan: Wij ___ buiten. (spelen)",
    answer: "spelen",
  },

  // Verenkeling verdubbeling
  {
    id: "vv1",
    category: "Verenkeling en verdubbeling",
    question: "Schrijf het meervoud: kat",
    answer: "katten",
  },
  {
    id: "vv2",
    category: "Verenkeling en verdubbeling",
    question: "Schrijf het meervoud: boom",
    answer: "bomen",
  },
  {
    id: "vv3",
    category: "Verenkeling en verdubbeling",
    question: "Kies de juiste vorm: lopen of loppen",
    answer: "lopen",
  },
  {
    id: "vv4",
    category: "Verenkeling en verdubbeling",
    question: "Kies de juiste vorm: katten of katen",
    answer: "katten",
  },

  // Maaltafels
  {
    id: "mt1",
    category: "Maaltafels",
    question: "8 × 7 =",
    answer: "56",
  },
  {
    id: "mt2",
    category: "Maaltafels",
    question: "9 × 6 =",
    answer: "54",
  },
  {
    id: "mt3",
    category: "Maaltafels",
    question: "12 × 8 =",
    answer: "96",
  },
  {
    id: "mt4",
    category: "Maaltafels",
    question: "7 × 9 =",
    answer: "63",
  },

  // Automatisatie
  {
    id: "auto1",
    category: "Automatisatie",
    question: "450 + 320 =",
    answer: "770",
  },
  {
    id: "auto2",
    category: "Automatisatie",
    question: "1000 - 375 =",
    answer: "625",
  },
  {
    id: "auto3",
    category: "Automatisatie",
    question: "240 ÷ 6 =",
    answer: "40",
  },
  {
    id: "auto4",
    category: "Automatisatie",
    question: "1/4 van 80 =",
    answer: "20",
  },

  // Vraagstukken
  {
    id: "vr1",
    category: "Vraagstukken",
    question: "Emma koopt 4 schriften van €3. Hoeveel betaalt ze?",
    answer: ["12", "€12", "12 euro"],
  },
  {
    id: "vr2",
    category: "Vraagstukken",
    question: "Een zwembad is 25 meter lang. Je zwemt 12 lengtes. Hoeveel meter zwem je?",
    answer: ["300", "300 meter", "300m"],
  },
  {
    id: "vr3",
    category: "Vraagstukken",
    question: "Een doos bevat 24 flessen. Er zijn 18 dozen. Hoeveel flessen zijn er?",
    answer: "432",
  },
  {
    id: "vr4",
    category: "Vraagstukken",
    question: "Een klas telt 24 leerlingen. 1/3 is afwezig. Hoeveel leerlingen zijn aanwezig?",
    answer: "16",
  },

  // Frans
  {
    id: "fr1",
    category: "Frans",
    question: "Vertaal naar het Frans: boek",
    answer: ["livre", "le livre"],
  },
  {
    id: "fr2",
    category: "Frans",
    question: "Vertaal naar het Nederlands: bonjour",
    answer: ["hallo", "goedendag"],
  },
  {
    id: "fr3",
    category: "Frans",
    question: "Schrijf in cijfers: quarante-cinq",
    answer: "45",
  },
  {
    id: "fr4",
    category: "Frans",
    question: "Vertaal naar het Frans: stoel",
    answer: ["chaise", "la chaise"],
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll(".", "")
    .replaceAll(",", "")
    .replaceAll("€", "")
    .replace(/\s+/g, " ");
}

export default function OefenpaginaClient() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const score = useMemo(() => {
    return exercises.reduce((total, exercise) => {
      const given = normalize(answers[exercise.id] || "");
      const correctAnswers = Array.isArray(exercise.answer)
        ? exercise.answer
        : [exercise.answer];

      const isCorrect = correctAnswers.some(
        (answer) => normalize(answer) === given
      );

      return total + (isCorrect ? 1 : 0);
    }, 0);
  }, [answers]);

  function isCorrect(exercise: Exercise) {
    const given = normalize(answers[exercise.id] || "");
    const correctAnswers = Array.isArray(exercise.answer)
      ? exercise.answer
      : [exercise.answer];

    return correctAnswers.some((answer) => normalize(answer) === given);
  }

  function resetExercises() {
    setAnswers({});
    setChecked(false);
  }

  const grouped = exercises.reduce<Record<string, Exercise[]>>((acc, exercise) => {
    if (!acc[exercise.category]) acc[exercise.category] = [];
    acc[exercise.category].push(exercise);
    return acc;
  }, {});

  return (
    <main className="oefenpagina">
      <section className="oefen-hero">
        <p className="eyebrow">Klantenportaal</p>
        <h1>Oefenpagina 6e leerjaar</h1>
        <p>
          Oefen spelling, maaltafels, automatisatie, vraagstukken en Frans.
          Klik op verbeteren om meteen je score te zien.
        </p>
      </section>

      <section className="score-card">
        <div>
          <strong>Score</strong>
          <span>
            {checked ? `${score} / ${exercises.length}` : "Nog niet verbeterd"}
          </span>
        </div>

        <div className="score-actions">
          <button type="button" onClick={() => setChecked(true)}>
            Verbeter
          </button>
          <button type="button" className="secondary" onClick={resetExercises}>
            Opnieuw maken
          </button>
        </div>
      </section>

      {Object.entries(grouped).map(([category, items]) => (
        <section className="exercise-section" key={category}>
          <h2>{category}</h2>

          <div className="exercise-grid">
            {items.map((exercise, index) => {
              const correct = isCorrect(exercise);

              return (
                <article
                  key={exercise.id}
                  className={`exercise-card ${
                    checked ? (correct ? "correct" : "wrong") : ""
                  }`}
                >
                  <p className="exercise-number">Vraag {index + 1}</p>
                  <h3>{exercise.question}</h3>

                  <input
                    value={answers[exercise.id] || ""}
                    onChange={(event) =>
                      setAnswers({
                        ...answers,
                        [exercise.id]: event.target.value,
                      })
                    }
                    placeholder="Typ je antwoord..."
                  />

                  {checked && (
                    <p className="feedback">
                      {correct
                        ? "Juist!"
                        : `Niet juist. Correct antwoord: ${
                            Array.isArray(exercise.answer)
                              ? exercise.answer[0]
                              : exercise.answer
                          }`}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}