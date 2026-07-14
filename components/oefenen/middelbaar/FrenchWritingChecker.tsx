"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./FrenchWritingChecker.module.css";

type Props = {
  exerciseId: string;
  value: string;
  minimumWords?: number;
  onValueChange: (value: string) => void;
  onCompleted: () => void;
};

type WritingAssessment = {
  total: number;
  content: number;
  grammar: number;
  vocabulary: number;
  spelling: number;
  structure: number;
  wordCount: number;
  sentenceCount: number;
  strengths: string[];
  improvements: string[];
  correctedVersion: string;
};

type SavedWritingAssessment = {
  bestScore: number;
  lastScore: number;
  assessment: WritingAssessment;
};

type WritingCriteria = {
  requiredElements: Array<{
    label: string;
    patterns: RegExp[];
  }>;
  usefulWords: string[];
  targetWords: number;
  targetSentences: number;
};

const STORAGE_PREFIX = "studiosago:frans-schrijven:";

const criteriaByExercise: Record<string, WritingCriteria> = {
  "write-1": {
    requiredElements: [
      {
        label: "naam",
        patterns: [/\bje m['’ ]appelle\b/i, /\bmon nom est\b/i],
      },
      {
        label: "leeftijd",
        patterns: [/\bj['’ ]ai\s+\d+\s+ans\b/i],
      },
      {
        label: "woonplaats",
        patterns: [/\bj['’ ]habite\b/i],
      },
      {
        label: "gezin",
        patterns: [
          /\bj['’ ]ai\s+(un|une|deux|trois|quatre|cinq)\b/i,
          /\bma famille\b/i,
          /\bmon frère\b/i,
          /\bma sœur\b/i,
          /\bmes parents\b/i,
          /\bmes enfants\b/i,
        ],
      },
      {
        label: "hobby",
        patterns: [
          /\bj['’ ]aime\b/i,
          /\bmon hobby\b/i,
          /\bmes loisirs\b/i,
          /\bcomme hobby\b/i,
        ],
      },
    ],
    usefulWords: [
      "bonjour",
      "famille",
      "frère",
      "sœur",
      "parents",
      "enfants",
      "habite",
      "aime",
      "sport",
      "musique",
      "danse",
      "lecture",
      "écrire",
    ],
    targetWords: 25,
    targetSentences: 5,
  },
  "write-2": {
    requiredElements: [
      {
        label: "schooltas",
        patterns: [/\bdans mon sac\b/i, /\bmon sac\b/i],
      },
      {
        label: "il y a",
        patterns: [/\bil y a\b/i],
      },
      {
        label: "minstens vier schoolwoorden",
        patterns: [
          /\blivre\b/i,
          /\bcahier\b/i,
          /\btrousse\b/i,
          /\brègle\b/i,
          /\bstylo\b/i,
          /\bcrayon\b/i,
          /\bgomme\b/i,
          /\bclasse\b/i,
        ],
      },
    ],
    usefulWords: [
      "sac",
      "livre",
      "cahier",
      "trousse",
      "règle",
      "stylo",
      "crayon",
      "gomme",
      "classe",
      "école",
    ],
    targetWords: 20,
    targetSentences: 4,
  },
};

const commonCorrections: Array<{
  pattern: RegExp;
  replacement: string;
  message: string;
}> = [
  {
    pattern: /\bje m['’]?apelle\b/gi,
    replacement: "je m'appelle",
    message: "Schrijf « je m'appelle » met twee p's.",
  },
  {
    pattern: /\bj['’]?ai\s+(\d+)\s+an\b/gi,
    replacement: "j'ai $1 ans",
    message: "Na een leeftijd gebruik je « ans » in het meervoud.",
  },
  {
    pattern: /\bj['’]?habite a\b/gi,
    replacement: "j'habite à",
    message: "Gebruik « à » met een accent bij een woonplaats.",
  },
  {
    pattern: /\bj['’]?ecrit\b/gi,
    replacement: "j'écris",
    message: "Bij je gebruik je « j'écris ».",
  },
  {
    pattern: /\bj['’]?écrit\b/gi,
    replacement: "j'écris",
    message: "Bij je gebruik je « j'écris » en niet « j'écrit ».",
  },
  {
    pattern: /\bpar hobby\b/gi,
    replacement: "comme hobby",
    message: "Gebruik « comme hobby » of liever « comme loisir ».",
  },
  {
    pattern: /\bils s['’]?appelent\b/gi,
    replacement: "ils s'appellent",
    message: "Schrijf « ils s'appellent » met twee l's.",
  },
  {
    pattern: /\belle s['’]?appelent\b/gi,
    replacement: "elles s'appellent",
    message: "Gebruik « elles s'appellent » voor meerdere meisjes/vrouwen.",
  },
  {
    pattern: /\bj['’]?aime de\b/gi,
    replacement: "j'aime",
    message: "Na « j'aime » komt geen « de » voor een activiteit.",
  },
  {
    pattern: /\bil ya\b/gi,
    replacement: "il y a",
    message: "Schrijf « il y a » als drie woorden.",
  },
];

function countSentences(value: string) {
  return value
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function normalizeWord(value: string) {
  return value
    .toLocaleLowerCase("fr")
    .replace(/[.,!?;:()[\]"“”]/g, "")
    .trim();
}

function capitalizeSentences(value: string) {
  return value
    .split(/([.!?]\s*)/)
    .map((part, index) => {
      if (index % 2 === 1 || !part.trim()) {
        return part;
      }

      const leadingWhitespace = part.match(/^\s*/)?.[0] ?? "";
      const content = part.trimStart();

      return `${leadingWhitespace}${content.charAt(0).toLocaleUpperCase("fr")}${content.slice(1)}`;
    })
    .join("");
}

function ensureFinalPunctuation(value: string) {
  const trimmed = value.trim();

  if (!trimmed || /[.!?]$/.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}.`;
}

function assessWriting(
  exerciseId: string,
  value: string,
  minimumWords = 1
): WritingAssessment {
  const criteria = criteriaByExercise[exerciseId] ?? {
    requiredElements: [],
    usefulWords: [],
    targetWords: Math.max(minimumWords, 15),
    targetSentences: 3,
  };

  const words = value
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);

  const wordCount = words.length;
  const sentenceCount = countSentences(value);

  const presentElements = criteria.requiredElements.filter((element) =>
    element.patterns.some((pattern) => pattern.test(value))
  );

  const content =
    criteria.requiredElements.length === 0
      ? Math.min(100, Math.round((wordCount / criteria.targetWords) * 100))
      : Math.round(
          (presentElements.length / criteria.requiredElements.length) * 100
        );

  const usefulWordCount = new Set(
    criteria.usefulWords.filter((word) =>
      words.includes(normalizeWord(word))
    )
  ).size;

  const vocabulary = Math.min(
    100,
    Math.round(
      (wordCount / criteria.targetWords) * 65 +
        (usefulWordCount / Math.max(criteria.usefulWords.length, 1)) * 35
    )
  );

  let correctedVersion = value.trim();
  const correctionsFound: string[] = [];

  commonCorrections.forEach((correction) => {
    correction.pattern.lastIndex = 0;

    if (correction.pattern.test(correctedVersion)) {
      correctionsFound.push(correction.message);
      correction.pattern.lastIndex = 0;
      correctedVersion = correctedVersion.replace(
        correction.pattern,
        correction.replacement
      );
    }
  });

  correctedVersion = capitalizeSentences(
    ensureFinalPunctuation(correctedVersion)
  );

  const apostropheIssues = (
    value.match(/\b(j|m|s|n|l)\s+(ai|aime|habite|appelle|est)\b/gi) ?? []
  ).length;

  const accentIssues = (value.match(/\ba\s+[A-ZÀ-ÖØ-Ý]/g) ?? []).length;
  const lowercaseSentenceStarts = (
    value.match(/(?:^|[.!?]\s+)[a-zà-ÿ]/g) ?? []
  ).length;
  const missingPunctuation = value.trim() && !/[.!?]$/.test(value.trim()) ? 1 : 0;

  const spellingIssueCount =
    correctionsFound.length +
    apostropheIssues +
    accentIssues +
    lowercaseSentenceStarts +
    missingPunctuation;

  const spelling = Math.max(35, 100 - spellingIssueCount * 11);

  const hasCoreStructures = [
    /\bje m['’ ]appelle\b/i,
    /\bj['’ ]ai\b/i,
    /\bj['’ ]habite\b/i,
    /\bj['’ ]aime\b/i,
    /\bil y a\b/i,
  ].filter((pattern) => pattern.test(value)).length;

  const verbMistakes =
    (value.match(/\bj['’ ](?:suis|ai|habite|aime)\s+(?:est|sont)\b/gi) ?? [])
      .length +
    (value.match(/\bje\s+(?:a|ont|sommes)\b/gi) ?? []).length;

  const grammar = Math.max(
    30,
    Math.min(
      100,
      62 + hasCoreStructures * 9 - verbMistakes * 18 - correctionsFound.length * 4
    )
  );

  const sentenceTargetScore = Math.min(
    100,
    Math.round((sentenceCount / criteria.targetSentences) * 100)
  );
  const wordTargetScore = Math.min(
    100,
    Math.round((wordCount / criteria.targetWords) * 100)
  );

  const structure = Math.round(
    sentenceTargetScore * 0.65 + wordTargetScore * 0.35
  );

  const total = Math.round(
    content * 0.3 +
      grammar * 0.25 +
      vocabulary * 0.15 +
      spelling * 0.15 +
      structure * 0.15
  );

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (content >= 75) {
    strengths.push("Je tekst bevat de belangrijkste gevraagde informatie.");
  } else {
    const missing = criteria.requiredElements
      .filter((element) => !presentElements.includes(element))
      .map((element) => element.label);

    if (missing.length > 0) {
      improvements.push(`Voeg nog toe: ${missing.join(", ")}.`);
    }
  }

  if (grammar >= 75) {
    strengths.push("Je gebruikt meerdere correcte Franse basisstructuren.");
  } else {
    improvements.push(
      "Controleer de werkwoordsvormen en de vaste zinnen met je, j'ai en j'habite."
    );
  }

  if (vocabulary >= 75) {
    strengths.push("Je gebruikt passende woordenschat voor het onderwerp.");
  } else {
    improvements.push("Gebruik meer Franse woorden die bij het onderwerp passen.");
  }

  if (sentenceCount < criteria.targetSentences) {
    improvements.push(
      `Schrijf minstens ${criteria.targetSentences} duidelijke zinnen. Je hebt er nu ${sentenceCount}.`
    );
  }

  if (wordCount < minimumWords) {
    improvements.push(
      `Schrijf minstens ${minimumWords} woorden. Je hebt er nu ${wordCount}.`
    );
  }

  improvements.push(...correctionsFound);

  if (spelling >= 85) {
    strengths.push("Je spelling en leestekens zijn grotendeels verzorgd.");
  }

  if (strengths.length === 0) {
    strengths.push("Je hebt een eerste Franse tekst geschreven en kunt die nu verbeteren.");
  }

  if (improvements.length === 0) {
    improvements.push("Lees je tekst nog één keer hardop na voor je hem afrondt.");
  }

  return {
    total,
    content,
    grammar,
    vocabulary,
    spelling,
    structure,
    wordCount,
    sentenceCount,
    strengths,
    improvements: Array.from(new Set(improvements)).slice(0, 6),
    correctedVersion,
  };
}

export default function FrenchWritingChecker({
  exerciseId,
  value,
  minimumWords = 1,
  onValueChange,
  onCompleted,
}: Props) {
  const [assessment, setAssessment] = useState<WritingAssessment | null>(null);
  const [bestScore, setBestScore] = useState(0);

  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}${exerciseId}`,
    [exerciseId]
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);

      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as SavedWritingAssessment;

      if (typeof parsed.bestScore === "number") {
        setBestScore(parsed.bestScore);
      }

      if (parsed.assessment) {
        setAssessment(parsed.assessment);
      }
    } catch (error) {
      console.error("Schrijfbeoordeling kon niet geladen worden:", error);
    }
  }, [storageKey]);

  function checkText() {
    if (!value.trim()) {
      window.alert("Schrijf eerst je Franse tekst.");
      return;
    }

    const result = assessWriting(exerciseId, value, minimumWords);
    const nextBestScore = Math.max(bestScore, result.total);

    setAssessment(result);
    setBestScore(nextBestScore);

    const saved: SavedWritingAssessment = {
      bestScore: nextBestScore,
      lastScore: result.total,
      assessment: result,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(saved));

    if (result.total >= 75) {
      onCompleted();
    }
  }

  function useCorrectedVersion() {
    if (!assessment) {
      return;
    }

    onValueChange(assessment.correctedVersion);
    setAssessment(null);
  }

  return (
    <section className={styles.checker}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Digitale schrijfcoach</span>
          <h3>Laat je Franse tekst nakijken</h3>
          <p>
            Je tekst wordt beoordeeld op inhoud, grammaticale basisstructuren,
            woordenschat, spelling en zinsbouw.
          </p>
        </div>

        {bestScore > 0 && (
          <div className={styles.bestScore}>
            <span>Beste score</span>
            <strong>{bestScore}%</strong>
          </div>
        )}
      </div>

      <button
        type="button"
        className={styles.checkButton}
        onClick={checkText}
        disabled={!value.trim()}
      >
        <span aria-hidden="true">✓</span> Controleer mijn tekst
      </button>

      {assessment && (
        <div
          className={
            assessment.total >= 75
              ? styles.resultPassed
              : styles.resultFailed
          }
          aria-live="polite"
        >
          <div className={styles.resultHeader}>
            <div>
              <span>
                {assessment.total >= 75 ? "Behaald" : "Verbeter je tekst"}
              </span>
              <strong>{assessment.total}%</strong>
            </div>

            <p>
              {assessment.wordCount} woorden · {assessment.sentenceCount} zinnen
            </p>
          </div>

          <div className={styles.scoreGrid}>
            <div>
              <span>Inhoud</span>
              <strong>{assessment.content}%</strong>
            </div>
            <div>
              <span>Grammatica</span>
              <strong>{assessment.grammar}%</strong>
            </div>
            <div>
              <span>Woordenschat</span>
              <strong>{assessment.vocabulary}%</strong>
            </div>
            <div>
              <span>Spelling</span>
              <strong>{assessment.spelling}%</strong>
            </div>
            <div>
              <span>Zinsbouw</span>
              <strong>{assessment.structure}%</strong>
            </div>
          </div>

          <div className={styles.feedbackColumns}>
            <div className={styles.strengths}>
              <strong>Goed gedaan</strong>
              <ul>
                {assessment.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.improvements}>
              <strong>Verbeterpunten</strong>
              <ul>
                {assessment.improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.correctedBox}>
            <strong>Digitaal verbeterde versie</strong>
            <p>{assessment.correctedVersion}</p>

            {assessment.correctedVersion !== value.trim() && (
              <button
                type="button"
                className={styles.useVersionButton}
                onClick={useCorrectedVersion}
              >
                Gebruik deze verbeterde versie
              </button>
            )}
          </div>

          <small>
            Deze automatische controle is bedoeld als oefenhulp. Ze herkent
            veelvoorkomende basisfouten, maar vervangt geen volledige correctie
            door een leerkracht.
          </small>
        </div>
      )}
    </section>
  );
}
