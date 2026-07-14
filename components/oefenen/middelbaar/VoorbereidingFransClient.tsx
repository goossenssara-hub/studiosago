"use client";

import { useEffect, useMemo, useState } from "react";
import {
  frenchPreparationExercises,
  frenchPreparationSections,
  type FrenchExercise,
  type FrenchExerciseCategory,
} from "@/lib/oefeningen/middelbaar/generators/fransVoorbereiding";
import FrenchSpeakingRecorder from "./FrenchSpeakingRecorder";
import FrenchWritingChecker from "./FrenchWritingChecker";
import FrenchCertificateSync from "./FrenchCertificateSync";
import styles from "./VoorbereidingFransClient.module.css";

type Answers = Record<string, string>;
type Checked = Record<string, boolean>;
type VisibleExamples = Record<string, boolean>;

type SavedFrenchProgress = {
  activeSection: FrenchExerciseCategory;
  answers: Answers;
  checked: Checked;
  showExamples: VisibleExamples;
};

const STORAGE_KEY = "studiosago:voorbereiding-frans:progress:v2";
const DEFAULT_SECTION: FrenchExerciseCategory = "woordenschat";

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("fr")
    .replace(/[.!?]/g, "")
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ");
}

function isCorrect(exercise: FrenchExercise, value: string) {
  if (!exercise.answer) {
    return false;
  }

  const acceptedAnswers = Array.isArray(exercise.answer)
    ? exercise.answer
    : [exercise.answer];

  return acceptedAnswers.some(
    (answer) => normalize(answer) === normalize(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringRecord(value: unknown): Answers {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  );
}

function toBooleanRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, boolean] => typeof entry[1] === "boolean"
    )
  );
}

function isFrenchCategory(value: unknown): value is FrenchExerciseCategory {
  return frenchPreparationSections.some((section) => section.id === value);
}

function speakFrench(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    window.alert("Je browser ondersteunt voorlezen niet.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export default function VoorbereidingFransClient() {
  const [activeSection, setActiveSection] =
    useState<FrenchExerciseCategory>(DEFAULT_SECTION);
  const [answers, setAnswers] = useState<Answers>({});
  const [checked, setChecked] = useState<Checked>({});
  const [showExamples, setShowExamples] = useState<VisibleExamples>({});
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProgress = window.localStorage.getItem(STORAGE_KEY);

      if (!savedProgress) {
        return;
      }

      const parsed: unknown = JSON.parse(savedProgress);

      if (!isRecord(parsed)) {
        return;
      }

      if (isFrenchCategory(parsed.activeSection)) {
        setActiveSection(parsed.activeSection);
      }

      setAnswers(toStringRecord(parsed.answers));
      setChecked(toBooleanRecord(parsed.checked));
      setShowExamples(toBooleanRecord(parsed.showExamples));
    } catch (error) {
      console.error(
        "De bewaarde Franse voortgang kon niet geladen worden:",
        error
      );
    } finally {
      setProgressLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!progressLoaded) {
      return;
    }

    const progressToSave: SavedFrenchProgress = {
      activeSection,
      answers,
      checked,
      showExamples,
    };

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(progressToSave)
      );
    } catch (error) {
      console.error("De Franse voortgang kon niet bewaard worden:", error);
    }
  }, [activeSection, answers, checked, showExamples, progressLoaded]);

  const sectionExercises = useMemo(
    () =>
      frenchPreparationExercises.filter(
        (exercise) => exercise.category === activeSection
      ),
    [activeSection]
  );

  const scoreableExercises = useMemo(
    () =>
      frenchPreparationExercises.filter((exercise) =>
        Boolean(exercise.answer)
      ),
    []
  );

  const checkedScoreableExercises = scoreableExercises.filter(
    (exercise) => checked[exercise.id]
  );

  const correctScoreableExercises = checkedScoreableExercises.filter(
    (exercise) => isCorrect(exercise, answers[exercise.id] ?? "")
  );

  const score =
    checkedScoreableExercises.length === 0
      ? 0
      : Math.round(
          (correctScoreableExercises.length /
            checkedScoreableExercises.length) *
            100
        );

  const completed = frenchPreparationExercises.filter(
    (exercise) => checked[exercise.id]
  ).length;

  const total = frenchPreparationExercises.length;
  const progress = Math.round((completed / total) * 100);

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [id]: value,
    }));

    setChecked((current) => ({
      ...current,
      [id]: false,
    }));
  }

  function checkExercise(exercise: FrenchExercise) {
    const value = answers[exercise.id]?.trim();

    if (!value) {
      window.alert("Vul eerst een antwoord in.");
      return;
    }

    setChecked((current) => ({
      ...current,
      [exercise.id]: true,
    }));
  }

  function markOpenExercise(exercise: FrenchExercise) {
    const value = answers[exercise.id]?.trim() ?? "";
    const wordCount = value.split(/\s+/).filter(Boolean).length;

    if (!value) {
      window.alert("Schrijf eerst je antwoord of voorbereiding.");
      return;
    }

    if (
      typeof exercise.minimumWords === "number" &&
      wordCount < exercise.minimumWords
    ) {
      window.alert(
        `Schrijf nog iets meer. Je hebt ${wordCount} woorden en hebt er minstens ${exercise.minimumWords} nodig.`
      );
      return;
    }

    setChecked((current) => ({
      ...current,
      [exercise.id]: true,
    }));
  }

  function getSectionResult(sectionId: FrenchExerciseCategory) {
    const exercises = frenchPreparationExercises.filter(
      (exercise) => exercise.category === sectionId
    );

    const isFinished =
      exercises.length > 0 &&
      exercises.every((exercise) => Boolean(checked[exercise.id]));

    if (!isFinished) {
      return {
        isFinished: false,
        score: null,
        passed: false,
      };
    }

    const scoreable = exercises.filter((exercise) =>
      Boolean(exercise.answer)
    );

    if (scoreable.length === 0) {
      return {
        isFinished: true,
        score: 100,
        passed: true,
      };
    }

    const correct = scoreable.filter((exercise) =>
      isCorrect(exercise, answers[exercise.id] ?? "")
    ).length;

    const sectionScore = Math.round(
      (correct / scoreable.length) * 100
    );

    return {
      isFinished: true,
      score: sectionScore,
      passed: sectionScore >= 75,
    };
  }

  function resetAll() {
    const confirmed = window.confirm(
      "Weet je zeker dat je alle Franse antwoorden en voortgang wilt wissen?"
    );

    if (!confirmed) {
      return;
    }

    window.speechSynthesis?.cancel();
    window.localStorage.removeItem(STORAGE_KEY);

    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);

      if (
        key?.startsWith("studiosago:frans-spreken:") ||
        key?.startsWith("studiosago:frans-schrijven:")
      ) {
        window.localStorage.removeItem(key);
      }
    }

    setAnswers({});
    setChecked({});
    setShowExamples({});
    setActiveSection(DEFAULT_SECTION);
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Klaar voor de sprong</p>
          <h1>Voorbereiding Frans voor het middelbaar</h1>
          <p className={styles.intro}>
            Oefen de basis uit het vijfde en zesde leerjaar. Je werkt aan
            woordenschat, grammatica, cultuur, lezen, luisteren, schrijven
            en spreken.
          </p>
        </div>

        <div className={styles.scoreCard}>
          <span>Voortgang</span>
          <strong>{progress}%</strong>

          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="Algemene voortgang"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>

          <small>
            {completed} van {total} oefeningen afgewerkt
          </small>
        </div>
      </section>

      <section className={styles.goalGrid}>
        <article>
          <span>Doel</span>
          <strong>Minstens 75%</strong>
          <p>
            Je score wordt berekend op de oefeningen met een vast antwoord.
          </p>
        </article>

        <article>
          <span>Jouw score</span>
          <strong>{score}%</strong>
          <p>
            {checkedScoreableExercises.length} controleerbare oefeningen
            nagekeken.
          </p>
        </article>

        <article>
          <span>Niveau</span>
          <strong>5e en 6e leerjaar</strong>
          <p>
            Een rustige voorbereiding op Frans in het eerste middelbaar.
          </p>
        </article>
      </section>

      <FrenchCertificateSync
        completedExercises={completed}
        totalExercises={total}
        score={score}
      />

      <nav className={styles.tabs} aria-label="Onderwerpen Frans">
        {frenchPreparationSections.map((section) => {
          const result = getSectionResult(section.id);
          const isActive = activeSection === section.id;

          const tabClassName = [
            styles.tab,
            isActive && !result.isFinished ? styles.activeTab : "",
            result.isFinished && result.passed
              ? styles.completedPassed
              : "",
            result.isFinished && !result.passed
              ? styles.completedFailed
              : "",
            isActive && result.isFinished
              ? styles.activeCompletedTab
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={section.id}
              type="button"
              className={tabClassName}
              aria-pressed={isActive}
              onClick={() => setActiveSection(section.id)}
            >
              <span className={styles.tabTitleRow}>
                <strong>{section.title}</strong>

                {result.isFinished && (
                  <span className={styles.sectionResult}>
                    {result.score}%
                  </span>
                )}
              </span>

              <span className={styles.tabDescription}>
                {section.description}
              </span>

              {result.isFinished && (
                <span className={styles.sectionStatus}>
                  {result.passed ? "Behaald" : "Opnieuw oefenen"}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <section className={styles.exerciseList}>
        {sectionExercises.map((exercise, index) => {
          const value = answers[exercise.id] ?? "";
          const hasBeenChecked = Boolean(checked[exercise.id]);
          const correct =
            hasBeenChecked && isCorrect(exercise, value);
          const isOpen = exercise.type === "open";

          return (
            <article className={styles.exerciseCard} key={exercise.id}>
              <div className={styles.number}>{index + 1}</div>

              <div className={styles.exerciseContent}>
                <div className={styles.exerciseHeader}>
                  <div>
                    <span className={styles.category}>
                      {exercise.category}
                    </span>
                    <h2>{exercise.title}</h2>
                  </div>

                  {hasBeenChecked && (
                    <span
                      className={
                        isOpen || correct
                          ? styles.correctBadge
                          : styles.wrongBadge
                      }
                    >
                      {isOpen
                        ? "Afgewerkt"
                        : correct
                          ? "Juist"
                          : "Nog eens proberen"}
                    </span>
                  )}
                </div>

                <p className={styles.instruction}>
                  {exercise.instruction}
                </p>

                {exercise.type === "listening" &&
                  exercise.audioText && (
                    <button
                      className={styles.listenButton}
                      type="button"
                      onClick={() =>
                        speakFrench(exercise.audioText ?? "")
                      }
                    >
                      <span aria-hidden="true">🔊</span> Luisteren
                    </button>
                  )}

                {exercise.category === "spreken" ? (
                  <FrenchSpeakingRecorder
                    exerciseId={exercise.id}
                    value={value}
                    minimumWords={exercise.minimumWords}
                    onTranscriptChange={(transcript) =>
                      updateAnswer(exercise.id, transcript)
                    }
                    onCompleted={() =>
                      setChecked((current) => ({
                        ...current,
                        [exercise.id]: true,
                      }))
                    }
                  />
                ) : exercise.category === "schrijven" ? (
                  <>
                    <textarea
                      className={styles.textarea}
                      value={value}
                      onChange={(event) =>
                        updateAnswer(exercise.id, event.target.value)
                      }
                      placeholder="Schrijf hier je Franse tekst..."
                      rows={6}
                    />

                    <FrenchWritingChecker
                      exerciseId={exercise.id}
                      value={value}
                      minimumWords={exercise.minimumWords}
                      onValueChange={(nextValue) =>
                        updateAnswer(exercise.id, nextValue)
                      }
                      onCompleted={() =>
                        setChecked((current) => ({
                          ...current,
                          [exercise.id]: true,
                        }))
                      }
                    />
                  </>
                ) : exercise.options ? (
                  <div className={styles.options}>
                    {exercise.options.map((option) => (
                      <label className={styles.option} key={option}>
                        <input
                          type="radio"
                          name={exercise.id}
                          value={option}
                          checked={value === option}
                          onChange={(event) =>
                            updateAnswer(
                              exercise.id,
                              event.target.value
                            )
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : isOpen ? (
                  <textarea
                    className={styles.textarea}
                    value={value}
                    onChange={(event) =>
                      updateAnswer(exercise.id, event.target.value)
                    }
                    placeholder="Schrijf hier je voorbereiding of antwoord..."
                    rows={6}
                  />
                ) : (
                  <input
                    className={styles.textInput}
                    value={value}
                    onChange={(event) =>
                      updateAnswer(exercise.id, event.target.value)
                    }
                    placeholder="Typ je antwoord..."
                    autoComplete="off"
                  />
                )}

                <div className={styles.actions}>
                  {exercise.category !== "spreken" &&
                    exercise.category !== "schrijven" && (
                    <button
                      type="button"
                      className={styles.checkButton}
                      onClick={() =>
                        isOpen
                          ? markOpenExercise(exercise)
                          : checkExercise(exercise)
                      }
                    >
                      {isOpen
                        ? "Markeer als afgewerkt"
                        : "Controleer"}
                    </button>
                  )}

                  {exercise.example && (
                    <button
                      type="button"
                      className={styles.exampleButton}
                      onClick={() =>
                        setShowExamples((current) => ({
                          ...current,
                          [exercise.id]: !current[exercise.id],
                        }))
                      }
                    >
                      {showExamples[exercise.id]
                        ? "Verberg voorbeeld"
                        : "Toon voorbeeld"}
                    </button>
                  )}
                </div>

                {showExamples[exercise.id] &&
                  exercise.example && (
                    <div className={styles.exampleBox}>
                      <strong>Voorbeeld</strong>
                      <p>{exercise.example}</p>
                    </div>
                  )}

                {hasBeenChecked && !isOpen && (
                  <div
                    className={
                      correct
                        ? styles.feedbackCorrect
                        : styles.feedbackWrong
                    }
                    aria-live="polite"
                  >
                    <strong>
                      {correct
                        ? "Goed gedaan!"
                        : `Het juiste antwoord is: ${
                            Array.isArray(exercise.answer)
                              ? exercise.answer[0]
                              : exercise.answer
                          }`}
                    </strong>

                    {exercise.explanation && (
                      <p>{exercise.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className={styles.footerCard}>
        <div>
          <p className={styles.eyebrow}>Resultaat</p>
          <h2>
            {score >= 75
              ? "Je bent goed op weg naar het middelbaar!"
              : "Blijf rustig verder oefenen."}
          </h2>
          <p>
            Werk ook de spreek- en schrijfoefeningen af. Die tellen niet
            mee in de automatische totaalscore, maar zijn belangrijk voor
            een sterke start.
          </p>
        </div>

        <button
          type="button"
          className={styles.resetButton}
          onClick={resetAll}
        >
          Alles opnieuw starten
        </button>
      </section>
    </main>
  );
}
