"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./FrenchSpeakingRecorder.module.css";

type Props = {
  exerciseId: string;
  value: string;
  minimumWords?: number;
  onTranscriptChange: (value: string) => void;
  onCompleted: () => void;
};

type SpeechRecognitionAlternativeLike = {
  transcript: string;
  confidence: number;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = Event & {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeakingAssessment = {
  total: number;
  content: number;
  vocabulary: number;
  grammar: number;
  fluency: number;
  recognition: number;
  wordCount: number;
  wordsPerMinute: number;
  feedback: string[];
};

type SavedSpeakingResult = {
  bestScore: number;
  lastScore: number;
  transcript: string;
  assessment: SpeakingAssessment;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const STORAGE_PREFIX = "studiosago:frans-spreken:";

const exerciseCriteria: Record<
  string,
  {
    requiredGroups: string[][];
    usefulWords: string[];
    grammarPatterns: RegExp[];
    targetWords: number;
  }
> = {
  "speak-1": {
    requiredGroups: [
      ["je m'appelle", "je m appelle"],
      ["j'ai", "j ai"],
      ["j'habite", "j habite"],
      ["j'aime", "j aime"],
    ],
    usefulWords: [
      "bonjour",
      "ans",
      "famille",
      "frère",
      "soeur",
      "sœur",
      "football",
      "musique",
      "danse",
      "sport",
    ],
    grammarPatterns: [
      /\bje m['’ ]appelle\b/i,
      /\bj['’ ]ai\b/i,
      /\bj['’ ]habite\b/i,
      /\bj['’ ]aime\b/i,
    ],
    targetWords: 20,
  },
  "speak-2": {
    requiredGroups: [
      ["pardon", "excusez-moi", "excusez moi"],
      ["vous pouvez répéter", "pouvez-vous répéter", "pouvez vous répéter"],
      ["s'il vous plaît", "s il vous plaît", "s'il vous plait"],
      ["merci"],
    ],
    usefulWords: [
      "madame",
      "monsieur",
      "comprendre",
      "répéter",
      "encore",
      "lentement",
      "merci",
    ],
    grammarPatterns: [
      /\bvous pouvez\b/i,
      /\bpouvez[- ]vous\b/i,
      /\bs['’ ]il vous pla[iî]t\b/i,
      /\bmerci\b/i,
    ],
    targetWords: 10,
  },
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("fr")
    .replace(/[’]/g, "'")
    .replace(/[.,!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateAssessment(
  exerciseId: string,
  transcript: string,
  durationSeconds: number,
  confidence: number,
  minimumWords = 5
): SpeakingAssessment {
  const criteria = exerciseCriteria[exerciseId] ?? {
    requiredGroups: [],
    usefulWords: [],
    grammarPatterns: [],
    targetWords: Math.max(minimumWords, 10),
  };

  const normalized = normalize(transcript);
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const safeDuration = Math.max(durationSeconds, 1);
  const wordsPerMinute = Math.round((wordCount / safeDuration) * 60);

  const matchedContent = criteria.requiredGroups.filter((group) =>
    group.some((phrase) => normalized.includes(normalize(phrase)))
  ).length;

  const content =
    criteria.requiredGroups.length === 0
      ? Math.min(100, Math.round((wordCount / criteria.targetWords) * 100))
      : Math.round((matchedContent / criteria.requiredGroups.length) * 100);

  const uniqueUsefulWords = new Set(
    criteria.usefulWords.filter((word) => normalized.includes(normalize(word)))
  );

  const vocabulary = Math.min(
    100,
    Math.round(
      (wordCount / Math.max(criteria.targetWords, 1)) * 55 +
        (uniqueUsefulWords.size / Math.max(criteria.usefulWords.length, 1)) * 45
    )
  );

  const matchedGrammar = criteria.grammarPatterns.filter((pattern) =>
    pattern.test(transcript)
  ).length;

  const grammar =
    criteria.grammarPatterns.length === 0
      ? Math.min(100, Math.round((wordCount / criteria.targetWords) * 100))
      : Math.round((matchedGrammar / criteria.grammarPatterns.length) * 100);

  let fluency = 100;
  if (wordsPerMinute < 45) fluency = 55;
  else if (wordsPerMinute < 65) fluency = 75;
  else if (wordsPerMinute > 180) fluency = 65;
  else if (wordsPerMinute > 145) fluency = 82;

  if (wordCount < minimumWords) {
    fluency = Math.min(fluency, 55);
  }

  const recognition = Math.max(
    0,
    Math.min(100, Math.round((confidence || 0.65) * 100))
  );

  const total = Math.round(
    content * 0.35 +
      vocabulary * 0.2 +
      grammar * 0.2 +
      fluency * 0.15 +
      recognition * 0.1
  );

  const feedback: string[] = [];

  if (content < 75) {
    feedback.push("Vermeld nog alle gevraagde onderdelen uit de opdracht.");
  } else {
    feedback.push("Je inhoud sluit goed aan bij de opdracht.");
  }

  if (grammar < 75) {
    feedback.push("Controleer de vaste Franse zinsbouw en werkwoordsvormen.");
  } else {
    feedback.push("Je gebruikt de belangrijkste zinsstructuren correct.");
  }

  if (vocabulary < 75) {
    feedback.push("Gebruik nog enkele extra Franse woorden uit het thema.");
  } else {
    feedback.push("Je gebruikt passende woordenschat.");
  }

  if (fluency < 75) {
    feedback.push("Spreek rustig, maar probeer lange stiltes te vermijden.");
  } else {
    feedback.push("Je spreektempo is goed verstaanbaar.");
  }

  if (recognition < 65) {
    feedback.push(
      "De spraakherkenning verstond niet alles. Spreek dichter bij de microfoon en articuleer duidelijk."
    );
  }

  return {
    total,
    content,
    vocabulary,
    grammar,
    fluency,
    recognition,
    wordCount,
    wordsPerMinute,
    feedback,
  };
}

export default function FrenchSpeakingRecorder({
  exerciseId,
  value,
  minimumWords = 5,
  onTranscriptChange,
  onCompleted,
}: Props) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const finalTranscriptRef = useRef("");
  const confidenceValuesRef = useRef<number[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [assessment, setAssessment] = useState<SpeakingAssessment | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [error, setError] = useState("");

  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}${exerciseId}`,
    [exerciseId]
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;

      const parsed = JSON.parse(saved) as SavedSpeakingResult;
      if (typeof parsed.bestScore === "number") setBestScore(parsed.bestScore);
      if (parsed.assessment) setAssessment(parsed.assessment);
      if (!value && typeof parsed.transcript === "string") {
        onTranscriptChange(parsed.transcript);
      }
    } catch (loadError) {
      console.error("Spreekresultaat kon niet geladen worden:", loadError);
    }
  }, [onTranscriptChange, storageKey, value]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function startRecording() {
    setError("");
    setAssessment(null);
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    confidenceValuesRef.current = [];
    chunksRef.current = [];

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Je browser ondersteunt geen microfoonopnames.");
      return;
    }

    if (!Recognition) {
      setError(
        "Automatische transcriptie wordt niet ondersteund in deze browser. Gebruik bij voorkeur Chrome of Edge."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      const recognition = new Recognition();
      recognitionRef.current = recognition;
      recognition.lang = "fr-FR";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interim = "";
        let newFinal = "";

        for (let index = 0; index < event.results.length; index += 1) {
          const result = event.results[index];
          const alternative = result[0];

          if (result.isFinal) {
            newFinal += `${alternative.transcript} `;
            if (alternative.confidence > 0) {
              confidenceValuesRef.current.push(alternative.confidence);
            }
          } else {
            interim += alternative.transcript;
          }
        }

        if (newFinal.trim()) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${newFinal}`.trim();
          onTranscriptChange(finalTranscriptRef.current);
        }

        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        if (event.error !== "no-speech" && event.error !== "aborted") {
          setError(`Spraakherkenning mislukt: ${event.error}.`);
        }
      };

      recognition.onend = () => {
        setInterimTranscript("");
      };

      startedAtRef.current = Date.now();
      recorder.start();
      recognition.start();
      setIsRecording(true);
    } catch (recordingError) {
      console.error(recordingError);
      setError(
        "De microfoon kon niet worden gestart. Controleer de browsertoestemming."
      );
    }
  }

  function stopRecording() {
    if (!isRecording) return;

    const elapsed = Math.max(
      1,
      Math.round((Date.now() - startedAtRef.current) / 1000)
    );

    setDurationSeconds(elapsed);
    recognitionRef.current?.stop();

    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }

    setIsRecording(false);
  }

  function assessRecording() {
    const transcript = value.trim();

    if (!transcript) {
      setError("Neem eerst een Franse spreekopdracht op.");
      return;
    }

    const confidenceValues = confidenceValuesRef.current;
    const averageConfidence =
      confidenceValues.length > 0
        ? confidenceValues.reduce((total, item) => total + item, 0) /
          confidenceValues.length
        : 0.65;

    const result = calculateAssessment(
      exerciseId,
      transcript,
      durationSeconds || Math.max(5, transcript.split(/\s+/).length / 1.4),
      averageConfidence,
      minimumWords
    );

    const nextBestScore = Math.max(bestScore, result.total);
    setAssessment(result);
    setBestScore(nextBestScore);

    const savedResult: SavedSpeakingResult = {
      bestScore: nextBestScore,
      lastScore: result.total,
      transcript,
      assessment: result,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(savedResult));

    if (result.total >= 75) {
      onCompleted();
    }
  }

  function resetRecording() {
    recognitionRef.current?.abort();
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }

    if (audioUrl) URL.revokeObjectURL(audioUrl);

    setAudioUrl(null);
    setAssessment(null);
    setInterimTranscript("");
    setDurationSeconds(0);
    setError("");
    onTranscriptChange("");
  }

  return (
    <section className={styles.speakingLab}>
      <div className={styles.labHeading}>
        <div>
          <span className={styles.labEyebrow}>Digitaal spreeklabo</span>
          <h3>Spreek je antwoord in</h3>
          <p>
            Je opname wordt omgezet naar tekst en digitaal beoordeeld op inhoud,
            woordenschat, grammatica, spreektempo en verstaanbaarheid voor de
            spraakherkenning.
          </p>
        </div>

        {bestScore > 0 && (
          <div className={styles.bestScore}>
            <span>Beste score</span>
            <strong>{bestScore}%</strong>
          </div>
        )}
      </div>

      <div className={styles.recordingActions}>
        {!isRecording ? (
          <button
            type="button"
            className={styles.recordButton}
            onClick={startRecording}
          >
            <span aria-hidden="true">🎤</span> Start opname
          </button>
        ) : (
          <button
            type="button"
            className={styles.stopButton}
            onClick={stopRecording}
          >
            <span aria-hidden="true">■</span> Stop opname
          </button>
        )}

        <button
          type="button"
          className={styles.retryButton}
          onClick={resetRecording}
          disabled={isRecording}
        >
          Opnieuw opnemen
        </button>
      </div>

      {isRecording && (
        <div className={styles.recordingStatus} aria-live="polite">
          <span className={styles.recordingDot} />
          Opname bezig… Spreek Frans en klik daarna op Stop opname.
        </div>
      )}

      {(value || interimTranscript) && (
        <div className={styles.transcriptBox}>
          <strong>Automatische transcriptie</strong>
          <p>
            {value}
            {interimTranscript && (
              <span className={styles.interim}> {interimTranscript}</span>
            )}
          </p>
        </div>
      )}

      {audioUrl && (
        <div className={styles.audioBox}>
          <strong>Beluister je opname</strong>
          <audio controls src={audioUrl}>
            Je browser ondersteunt het afspelen van audio niet.
          </audio>
        </div>
      )}

      {error && (
        <p className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        className={styles.assessButton}
        onClick={assessRecording}
        disabled={isRecording || !value.trim()}
      >
        Digitaal beoordelen
      </button>

      {assessment && (
        <div
          className={
            assessment.total >= 75
              ? styles.assessmentPassed
              : styles.assessmentFailed
          }
          aria-live="polite"
        >
          <div className={styles.assessmentHeader}>
            <div>
              <span>
                {assessment.total >= 75 ? "Behaald" : "Probeer opnieuw"}
              </span>
              <strong>{assessment.total}%</strong>
            </div>
            <p>
              {assessment.wordCount} woorden · {assessment.wordsPerMinute} woorden
              per minuut
            </p>
          </div>

          <div className={styles.rubricGrid}>
            <div>
              <span>Inhoud</span>
              <strong>{assessment.content}%</strong>
            </div>
            <div>
              <span>Woordenschat</span>
              <strong>{assessment.vocabulary}%</strong>
            </div>
            <div>
              <span>Grammatica</span>
              <strong>{assessment.grammar}%</strong>
            </div>
            <div>
              <span>Vlotheid</span>
              <strong>{assessment.fluency}%</strong>
            </div>
            <div>
              <span>Verstaanbaarheid</span>
              <strong>{assessment.recognition}%</strong>
            </div>
          </div>

          <div className={styles.feedbackList}>
            <strong>Persoonlijke feedback</strong>
            <ul>
              {assessment.feedback.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <small>
            De beoordeling is een digitale oefeninschatting. Ze vervangt geen
            beoordeling door een leerkracht en meet uitspraak niet fonetisch.
          </small>
        </div>
      )}
    </section>
  );
}
