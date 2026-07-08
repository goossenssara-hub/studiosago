"use client";

import { useMemo, useState } from "react";

type Exercise = {
  id: string;
  category: string;
  question: string;
  answer: string | string[];
};

const categories = [
  "Persoonsvorm",
  "Verenkeling en verdubbeling",
  "Maaltafels",
  "Automatisatie",
  "Vraagstukken",
  "Frans",
];

const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function normalize(value: string | number) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[.,€]/g, "")
    .replace(/\s+/g, " ");
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateExercises(level: number): Exercise[] {
  const exercises: Exercise[] = [];

  const spellingWords = [
    ["kat", "katten"],
    ["zon", "zonnen"],
    ["man", "mannen"],
    ["bom", "bommen"],
    ["vis", "vissen"],
    ["boom", "bomen"],
    ["raam", "ramen"],
    ["school", "scholen"],
    ["droom", "dromen"],
    ["straat", "straten"],
    ["tak", "takken"],
    ["pot", "potten"],
    ["maan", "manen"],
    ["roos", "rozen"],
    ["les", "lessen"],
    ["brug", "bruggen"],
    ["jas", "jassen"],
    ["stoel", "stoelen"],
    ["muur", "muren"],
    ["bal", "ballen"],
  ];

  const pvExercises = [
    {
      question: "Duid de persoonsvorm aan: Morgen fietsen wij naar school.",
      answer: "fietsen",
    },
    {
      question: "Vul aan: Hij ___ een boek. (lezen)",
      answer: "leest",
    },
    {
      question: "Vul aan: Wij ___ gisteren naar huis. (wandelen)",
      answer: "wandelden",
    },
    {
      question: "Zet in de verleden tijd: Wij spelen buiten.",
      answer: "wij speelden buiten",
    },
    {
      question: "Duid de persoonsvorm aan: De leerlingen maakten hun taak.",
      answer: "maakten",
    },
    {
      question: "Vul aan: Jij ___ morgen naar oma. (gaan)",
      answer: "gaat",
    },
    {
      question: "Duid de persoonsvorm aan: Na school zullen we oefenen.",
      answer: "zullen",
    },
    {
      question: "Zet in de verleden tijd: Ik fiets naar de winkel.",
      answer: "ik fietste naar de winkel",
    },
    {
      question: "Vul aan: De juf ___ de opdracht uit. (leggen)",
      answer: "legt",
    },
    {
      question: "Duid de persoonsvorm aan: Omdat het regende, bleven we binnen.",
      answer: "bleven",
    },
  ];

  const frenchWords: [string, string[]][] = [
    ["boek", ["le livre"]],
    ["stoel", ["la chaise"]],
    ["tafel", ["la table"]],
    ["raam", ["la fenêtre", "la fenetre"]],
    ["deur", ["la porte"]],
    ["hond", ["le chien"]],
    ["kat", ["le chat"]],
    ["school", ["l'école", "l ecole"]],
    ["appel", ["la pomme"]],
    ["water", ["l'eau", "l eau"]],
    ["brood", ["le pain"]],
    ["fiets", ["le vélo", "le velo"]],
    ["schrift", ["le cahier"]],
    ["gom", ["la gomme"]],
    ["potlood", ["le crayon"]],
  ];

  const start = (level - 1) % 10;

  for (let i = 1; i <= 8; i++) {
    const a = rand(4 + level * 2, 9 + level * 3);
    const b = rand(4 + Math.floor(level / 2), 12 + level);

    exercises.push({
      id: `maal-${level}-${i}`,
      category: "Maaltafels",
      question: `${a} × ${b} =`,
      answer: String(a * b),
    });
  }

  for (let i = 1; i <= 8; i++) {
    const deler = rand(3 + Math.floor(level / 3), 12 + level);
    const uitkomst = rand(15 + level * 5, 55 + level * 14);
    const getal = deler * uitkomst;

    exercises.push({
      id: `delen-${level}-${i}`,
      category: "Automatisatie",
      question: `${getal} ÷ ${deler} =`,
      answer: String(uitkomst),
    });
  }

  for (let i = 1; i <= 6; i++) {
    const a = rand(100 * level, 500 + level * 250);
    const b = rand(80 * level, 400 + level * 180);

    exercises.push({
      id: `auto-${level}-${i}`,
      category: "Automatisatie",
      question: `${a} + ${b} =`,
      answer: String(a + b),
    });
  }

  for (let i = 0; i < 8; i++) {
    const [word, correct] = spellingWords[(start + i) % spellingWords.length];

    exercises.push({
      id: `spel-${level}-${i}`,
      category: "Verenkeling en verdubbeling",
      question: `Schrijf het meervoud van: ${word}`,
      answer: correct,
    });
  }

  for (let i = 0; i < 5; i++) {
    const item = pvExercises[(start + i) % pvExercises.length];

    exercises.push({
      id: `pv-${level}-${i}`,
      category: "Persoonsvorm",
      question: item.question,
      answer: item.answer,
    });
  }

  for (let i = 1; i <= 6; i++) {
    const price = rand(6 + level, 18 + level * 3);
    const amount = rand(3 + level, 8 + level * 2);
    const total = price * amount;

    exercises.push({
      id: `vraag-${level}-${i}`,
      category: "Vraagstukken",
      question: `Een leerling koopt ${amount} items van €${price}. Hoeveel betaalt hij in totaal?`,
      answer: [`${total}`, `€${total}`, `${total} euro`],
    });
  }

  for (let i = 0; i < 8; i++) {
    const [nl, fr] = frenchWords[(start + i) % frenchWords.length];

    exercises.push({
      id: `fr-${level}-${i}`,
      category: "Frans",
      question: `Vertaal naar het Frans met lidwoord: ${nl}`,
      answer: fr,
    });
  }

  return exercises;
}

export default function OefenpaginaClient() {
  const [level, setLevel] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [reachedLevels, setReachedLevels] = useState<number[]>([1]);

  const exercises = useMemo(() => generateExercises(level), [level]);

  const score = exercises.reduce((total, exercise) => {
    const given = normalize(answers[exercise.id] || "");
    const correctAnswers = Array.isArray(exercise.answer)
      ? exercise.answer
      : [exercise.answer];

    const correct = correctAnswers.some(
      (answer) => normalize(answer) === given
    );

    return total + (correct ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / exercises.length) * 100);

  function isCorrect(exercise: Exercise) {
    const given = normalize(answers[exercise.id] || "");
    const correctAnswers = Array.isArray(exercise.answer)
      ? exercise.answer
      : [exercise.answer];

    return correctAnswers.some((answer) => normalize(answer) === given);
  }

  function canOpenLevel(targetLevel: number) {
    return reachedLevels.includes(targetLevel);
  }

  function goToLevel(newLevel: number) {
    if (!canOpenLevel(newLevel)) return;

    setLevel(newLevel);
    setAnswers({});
    setChecked(false);
  }

  function improve() {
    setChecked(true);

    if (percentage >= 75 && level < 10) {
      setReachedLevels((previous) =>
        previous.includes(level + 1) ? previous : [...previous, level + 1]
      );
    }
  }

  function nextLevel() {
    if (!checked || percentage < 75) {
      setChecked(true);
      return;
    }

    const newLevel = Math.min(level + 1, 10);
    goToLevel(newLevel);
  }

  function previousLevel() {
    const newLevel = Math.max(level - 1, 1);
    setLevel(newLevel);
    setAnswers({});
    setChecked(false);
  }

  const grouped = categories
    .map((category) => ({
      category,
      items: exercises.filter((exercise) => exercise.category === category),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <main className="oefenpagina">
      <section className="oefen-hero">
        <p className="eyebrow">Studio SaGo Leerlingportaal</p>
        <h1>Oefenklim 6e leerjaar</h1>
        <p>
          Maak oefeningen, verbeter automatisch en klim telkens een niveau hoger.
          Je hebt minstens 75% nodig om het volgende niveau vrij te spelen.
        </p>
      </section>

      <section className="learning-journey-card">
        <div className="journey-header">
          <div>
            <h2>Jouw oefenreis 🏔️</h2>
            <p>Klim naar de top en word een kei in leren! 💪</p>
          </div>

          <div className="journey-goal">
            ⭐ <span>Bereik niveau 10</span>
          </div>
        </div>

        <div className="journey-mountain">
          {levels.map((item) => (
            <button
              key={item}
              type="button"
              className={`journey-flag ${
                item === level ? "active" : ""
              } ${reachedLevels.includes(item) ? "reached" : ""}`}
              onClick={() => goToLevel(item)}
              disabled={!canOpenLevel(item)}
              aria-label={`Ga naar niveau ${item}`}
            >
              {canOpenLevel(item) ? "🚩" : "🔒"} <span>{item}</span>
            </button>
          ))}
        </div>

        <div className="journey-bottom">
          <div className="journey-box">
            <small>Huidig niveau</small>
            <strong>Niveau {level}</strong>
            <p>Je staat op plek {level} van je oefenreis.</p>
          </div>

          <div className="journey-box">
            <small>Jouw voortgang</small>
            <strong>{checked ? `${percentage}%` : "0%"}</strong>
            <p>
              {checked
                ? `${score} / ${exercises.length} oefeningen juist`
                : "Nog niet verbeterd"}
            </p>

            <div className="progress-track">
              <span style={{ width: checked ? `${percentage}%` : "0%" }} />
            </div>
          </div>

          <div className="journey-actions">
            <button type="button" onClick={previousLevel} disabled={level === 1}>
              ← Vorige niveau
            </button>

            <button type="button" className="primary" onClick={improve}>
              ✓ Verbeter antwoorden
            </button>

            <button
              type="button"
              onClick={nextLevel}
              disabled={level === 10 || !checked || percentage < 75}
            >
              Volgende niveau →
            </button>

            {checked && percentage < 75 && (
              <p className="level-warning">
                Je hebt minstens 75% nodig om het volgende niveau vrij te spelen.
              </p>
            )}
          </div>
        </div>
      </section>

      {grouped.map((group) => (
        <section className="exercise-section" key={group.category}>
          <h2>{group.category}</h2>

          <div className="exercise-grid">
            {group.items.map((exercise, index) => {
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