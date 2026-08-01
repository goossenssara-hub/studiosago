"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  frenchPreparationExercises,
  frenchPreparationSections,
  type FrenchExercise,
  type FrenchExerciseCategory,
} from "@/lib/oefeningen/middelbaar/generators/fransVoorbereiding";
import FrenchSpeakingRecorder from "./FrenchSpeakingRecorder";
import FrenchWritingChecker from "./FrenchWritingChecker";
import styles from "./VoorbereidingFransClient.module.css";

type Answers = Record<string, string>;
type Checked = Record<string, boolean>;
type Attempts = Record<string, number>;
type SavedProgress = {
  activeSection: FrenchExerciseCategory;
  activeExerciseId: string;
  answers: Answers;
  checked: Checked;
  attempts: Attempts;
};

const STORAGE_KEY = "studiosago:voorbereiding-frans:progress:v4";
const DEFAULT_SECTION: FrenchExerciseCategory = "woordenschat";

function normalize(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.!?,;:]/g, "")
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ");
}

function isCorrect(exercise: FrenchExercise, value: string): boolean {
  if (!exercise.answer) return false;
  const accepted = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer];
  return accepted.some((answer) => normalize(answer) === normalize(value));
}

type VoiceGender = "female" | "male";

const FEMALE_VOICE_HINTS = [
  "amelie",
  "amélie",
  "audrey",
  "aurelie",
  "aurélie",
  "marie",
  "lea",
  "léa",
  "celine",
  "céline",
  "julie",
  "hortense",
  "virginie",
  "sylvie",
];

const MALE_VOICE_HINTS = [
  "thomas",
  "nicolas",
  "henri",
  "paul",
  "luc",
  "louis",
  "remy",
  "rémy",
];

function normalizeVoiceName(value: string): string {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function selectFrenchVoice(gender: VoiceGender): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const frenchVoices = voices.filter((voice) =>
    voice.lang.toLocaleLowerCase().startsWith("fr")
  );
  const preferredLocales = ["fr-BE", "fr-FR", "fr-CA", "fr-CH"];
  const hints = gender === "female" ? FEMALE_VOICE_HINTS : MALE_VOICE_HINTS;

  for (const locale of preferredLocales) {
    const localeVoices = frenchVoices.filter(
      (voice) => voice.lang.toLocaleLowerCase() === locale.toLocaleLowerCase()
    );
    const namedMatch = localeVoices.find((voice) => {
      const name = normalizeVoiceName(voice.name);
      return hints.some((hint) => name.includes(normalizeVoiceName(hint)));
    });
    if (namedMatch) return namedMatch;
  }

  const namedFrenchMatch = frenchVoices.find((voice) => {
    const name = normalizeVoiceName(voice.name);
    return hints.some((hint) => name.includes(normalizeVoiceName(hint)));
  });

  return namedFrenchMatch ?? frenchVoices[0] ?? null;
}

function speakFrench(
  text: string,
  speaker: { name: string; gender: VoiceGender } = {
    name: "Madame Martin",
    gender: "female",
  }
): void {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return;

  const play = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = selectFrenchVoice(speaker.gender);

    utterance.lang = voice?.lang || "fr-BE";
    utterance.voice = voice;
    utterance.rate = 0.82;
    utterance.pitch = speaker.gender === "female" ? 1.08 : 0.94;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", play, { once: true });
    return;
  }

  play();
}

function Icon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (name === "headphones") return <svg {...common}><path d="M4 13v-2a8 8 0 0 1 16 0v2"/><path d="M4 13h3v7H5a1 1 0 0 1-1-1v-6Zm16 0h-3v7h2a1 1 0 0 0 1-1v-6Z"/></svg>;
  if (name === "pen") return <svg {...common}><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m14.5 7 3 3"/></svg>;
  if (name === "mic") return <svg {...common}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4M9 21h6"/></svg>;
  if (name === "globe") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
  if (name === "blocks") return <svg {...common}><rect x="3" y="4" width="8" height="7" rx="2"/><rect x="13" y="4" width="8" height="7" rx="2"/><rect x="8" y="13" width="8" height="7" rx="2"/></svg>;
  return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z"/></svg>;
}

export default function VoorbereidingFransClient() {
  const [activeSection, setActiveSection] = useState<FrenchExerciseCategory>(DEFAULT_SECTION);
  const [activeExerciseId, setActiveExerciseId] = useState(frenchPreparationExercises[0]?.id ?? "");
  const [answers, setAnswers] = useState<Answers>({});
  const [checked, setChecked] = useState<Checked>({});
  const [attempts, setAttempts] = useState<Attempts>({});
  const [showHint, setShowHint] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedProgress>;
        if (saved.activeSection) setActiveSection(saved.activeSection);
        if (saved.activeExerciseId) setActiveExerciseId(saved.activeExerciseId);
        setAnswers(saved.answers ?? {});
        setChecked(saved.checked ?? {});
        setAttempts(saved.attempts ?? {});
      }
    } catch (error) {
      console.error("Franse voortgang laden mislukt:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const state: SavedProgress = { activeSection, activeExerciseId, answers, checked, attempts };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [activeSection, activeExerciseId, answers, checked, attempts, loaded]);

  const sectionExercises = useMemo(
    () => frenchPreparationExercises.filter((exercise) => exercise.category === activeSection),
    [activeSection]
  );

  useEffect(() => {
    if (!sectionExercises.some((exercise) => exercise.id === activeExerciseId)) {
      setActiveExerciseId(sectionExercises[0]?.id ?? "");
    }
  }, [sectionExercises, activeExerciseId]);

  const activeIndex = Math.max(0, sectionExercises.findIndex((exercise) => exercise.id === activeExerciseId));
  const exercise = sectionExercises[activeIndex];
  const completed = frenchPreparationExercises.filter((item) => checked[item.id]).length;
  const mastered = frenchPreparationExercises.filter(
    (item) => checked[item.id] && (!item.answer || isCorrect(item, answers[item.id] ?? ""))
  ).length;
  const readiness = completed === 0 ? "Startklaar" : completed < frenchPreparationExercises.length ? "In groei" : mastered === frenchPreparationExercises.length ? "Klaar voor de sprong" : "Nog versterken";

  function chooseSection(section: FrenchExerciseCategory) {
    const first = frenchPreparationExercises.find((item) => item.category === section);
    setActiveSection(section);
    setActiveExerciseId(first?.id ?? "");
    setShowHint(false);
  }

  function updateAnswer(value: string) {
    if (!exercise) return;
    setAnswers((current) => ({ ...current, [exercise.id]: value }));
    setChecked((current) => ({ ...current, [exercise.id]: false }));
  }

  function checkCurrent() {
    if (!exercise) return;
    const value = (answers[exercise.id] ?? "").trim();
    if (!value) return;
    setAttempts((current) => ({ ...current, [exercise.id]: (current[exercise.id] ?? 0) + 1 }));
    setChecked((current) => ({ ...current, [exercise.id]: true }));
  }

  function completeOpen() {
    if (!exercise) return;
    const value = (answers[exercise.id] ?? "").trim();
    const words = value.split(/\s+/).filter(Boolean).length;
    if (!value || (exercise.minimumWords && words < exercise.minimumWords)) return;
    setChecked((current) => ({ ...current, [exercise.id]: true }));
  }

  function go(offset: number) {
    const next = sectionExercises[activeIndex + offset];
    if (next) {
      setActiveExerciseId(next.id);
      setShowHint(false);
    }
  }

  if (!exercise) return null;

  const value = answers[exercise.id] ?? "";
  const hasBeenChecked = Boolean(checked[exercise.id]);
  const correct = hasBeenChecked && (!exercise.answer || isCorrect(exercise, value));
  const attemptCount = attempts[exercise.id] ?? 0;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Klaar voor de sprong</p>
          <h1>Frans voor de stap naar het middelbaar</h1>
          <p className={styles.intro}>Een rustige, doelgerichte voorbereiding met basiswoordenschat, grammatica, lezen, luisteren, schrijven, spreken en kennis van de Franstalige wereld.</p>
        </div>
        <aside className={styles.readinessCard}>
          <span>Jouw groeifase</span>
          <strong>{readiness}</strong>
          <small>{completed} van {frenchPreparationExercises.length} oefeningen verkend</small>
        </aside>
      </section>

      <section className={styles.overviewStrip}>
        <article><span>Focus</span><strong>Praktische basis</strong><p>Wat je nodig hebt om in het eerste middelbaar mee te kunnen.</p></article>
        <article><span>Opbouw</span><strong>Van herkennen naar toepassen</strong><p>De oefeningen worden geleidelijk complexer.</p></article>
        <article><span>Feedback</span><strong>Eerst denken, dan helpen</strong><p>Een oplossing verschijnt niet meteen bij een fout antwoord.</p></article>
      </section>

      <nav className={styles.sectionGrid} aria-label="Onderdelen Frans">
        {frenchPreparationSections.map((section) => {
          const items = frenchPreparationExercises.filter((item) => item.category === section.id);
          const done = items.filter((item) => checked[item.id]).length;
          return (
            <button key={section.id} type="button" className={activeSection === section.id ? styles.activeSection : styles.sectionCard} onClick={() => chooseSection(section.id)}>
              <span className={styles.sectionIcon}><Icon name={section.icon} /></span>
              <span className={styles.sectionCopy}><strong>{section.title}</strong><small>{section.description}</small><em>{done} van {items.length} verkend</em></span>
            </button>
          );
        })}
      </nav>

      <section className={styles.workspace}>
        <aside className={styles.exerciseRail}>
          <p className={styles.railLabel}>{frenchPreparationSections.find((item) => item.id === activeSection)?.title}</p>
          {sectionExercises.map((item, index) => (
            <button key={item.id} type="button" className={item.id === exercise.id ? styles.activeExerciseButton : styles.exerciseButton} onClick={() => { setActiveExerciseId(item.id); setShowHint(false); }}>
              <span>{index + 1}</span>
              <div><strong>{item.title}</strong><small>Niveau {item.difficulty} · {checked[item.id] ? "verkend" : "nog te ontdekken"}</small></div>
            </button>
          ))}
        </aside>

        <article className={styles.exercisePanel}>
          <header className={styles.exerciseHeader}>
            <div><span className={styles.goalBadge}>{exercise.learningGoal}</span><p>Oefening {activeIndex + 1} van {sectionExercises.length}</p></div>
            <span className={styles.difficultyBadge}>Niveau {exercise.difficulty}</span>
          </header>

          <h2>{exercise.title}</h2>
          <p className={styles.instruction}>{exercise.instruction}</p>

          {exercise.type === "listening" && exercise.audioText && (
            <button className={styles.listenButton} type="button" onClick={() => speakFrench(exercise.audioText ?? "", exercise.audioSpeaker)}><Icon name="headphones" /> Luister opnieuw</button>
          )}

          {exercise.category === "spreken" ? (
            <FrenchSpeakingRecorder exerciseId={exercise.id} value={value} minimumWords={exercise.minimumWords} onTranscriptChange={updateAnswer} onCompleted={() => setChecked((c) => ({ ...c, [exercise.id]: true }))} />
          ) : exercise.category === "schrijven" ? (
            <><textarea className={styles.textarea} value={value} onChange={(e) => updateAnswer(e.target.value)} placeholder="Schrijf hier je Franse tekst..." rows={7}/><FrenchWritingChecker exerciseId={exercise.id} value={value} minimumWords={exercise.minimumWords} onValueChange={updateAnswer} onCompleted={() => setChecked((c) => ({ ...c, [exercise.id]: true }))}/></>
          ) : exercise.options ? (
            <div className={styles.options}>{exercise.options.map((option, index) => <label className={value === option ? styles.selectedOption : styles.option} key={option}><input type="radio" name={exercise.id} value={option} checked={value === option} onChange={(e) => updateAnswer(e.target.value)}/><span className={styles.optionLetter}>{String.fromCharCode(65 + index)}</span><span>{option}</span></label>)}</div>
          ) : exercise.type === "open" ? (
            <textarea className={styles.textarea} value={value} onChange={(e) => updateAnswer(e.target.value)} placeholder="Schrijf hier je antwoord..." rows={6}/>
          ) : (
            <input className={styles.textInput} value={value} onChange={(e) => updateAnswer(e.target.value)} placeholder="Typ je antwoord..." autoComplete="off"/>
          )}

          {exercise.hint && <div className={styles.hintWrap}><button type="button" className={styles.hintButton} onClick={() => setShowHint((v) => !v)}>{showHint ? "Verberg hint" : "Ik wil een kleine hint"}</button>{showHint && <p>{exercise.hint}</p>}</div>}

          {hasBeenChecked && exercise.answer && (
            <div className={correct ? styles.feedbackCorrect : styles.feedbackWrong} aria-live="polite">
              <strong>{correct ? "Goed aangepakt." : attemptCount < 2 ? "Kijk nog eens rustig naar de opdracht." : "Deze stap vraagt nog wat oefening."}</strong>
              <p>{correct ? exercise.explanation : attemptCount < 2 ? exercise.hint : `${exercise.explanation ?? "Vergelijk je antwoord met de regel of informatie uit de opdracht."}`}</p>
              {!correct && attemptCount >= 2 && <small>Mogelijk antwoord: {Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer}</small>}
            </div>
          )}

          <footer className={styles.exerciseActions}>
            <button type="button" className={styles.secondaryButton} disabled={activeIndex === 0} onClick={() => go(-1)}>← Vorige</button>
            {exercise.category !== "spreken" && exercise.category !== "schrijven" && <button type="button" className={styles.primaryButton} disabled={!value.trim()} onClick={exercise.type === "open" ? completeOpen : checkCurrent}>{exercise.type === "open" ? "Markeer als verkend" : "Kijk mijn antwoord na"}</button>}
            <button type="button" className={styles.secondaryButton} disabled={activeIndex === sectionExercises.length - 1} onClick={() => go(1)}>Volgende →</button>
          </footer>
        </article>
      </section>

      <section className={styles.footerCard}>
        <div><p className={styles.eyebrow}>Volgende stap</p><h2>Oefen breed, niet alleen snel.</h2><p>Een sterke start in het middelbaar vraagt dat je woorden begrijpt, zinnen kunt bouwen én durft luisteren, schrijven en spreken.</p></div>
        <Link className={styles.backButton} href="/oefenen/middelbaar/eerste">Terug naar alle oefeningen</Link>
      </section>
    </main>
  );
}
