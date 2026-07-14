"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0?: {
    transcript?: string;
  };
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type FrenchSpeakingRecorderProps = {
  exerciseId: string;
  value: string;
  minimumWords?: number;
  onTranscriptChange: (transcript: string) => void;
  onCompleted: () => void;
};

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export default function FrenchSpeakingRecorder({
  exerciseId,
  value,
  minimumWords = 1,
  onTranscriptChange,
  onCompleted,
}: FrenchSpeakingRecorderProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const latestValueRef = useRef(value);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!Recognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];

        if (result.isFinal) {
          transcript += `${result[0]?.transcript ?? ""} `;
        }
      }

      const cleanedTranscript = transcript.trim();

      if (!cleanedTranscript) {
        return;
      }

      const nextValue = latestValueRef.current.trim()
        ? `${latestValueRef.current.trim()} ${cleanedTranscript}`
        : cleanedTranscript;

      latestValueRef.current = nextValue;
      onTranscriptChange(nextValue);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      setIsListening(false);

      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          setError(
            "Geef je browser toestemming om de microfoon te gebruiken."
          );
          break;
        case "no-speech":
          setError("Er werd geen spraak herkend. Probeer opnieuw.");
          break;
        case "audio-capture":
          setError("Er werd geen werkende microfoon gevonden.");
          break;
        case "aborted":
          setError(null);
          break;
        default:
          setError("De opname kon niet worden verwerkt.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);

      if (countWords(latestValueRef.current) >= minimumWords) {
        onCompleted();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;

      try {
        recognition.abort();
      } catch {
        // De opname was mogelijk al gestopt.
      }

      recognitionRef.current = null;
    };
  }, [minimumWords, onCompleted, onTranscriptChange]);

  function startRecording(): void {
    if (!recognitionRef.current || isListening) {
      return;
    }

    try {
      setError(null);
      recognitionRef.current.start();
    } catch {
      setError("De opname kon niet gestart worden. Probeer opnieuw.");
    }
  }

  function stopRecording(): void {
    if (!recognitionRef.current || !isListening) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch {
      setIsListening(false);
    }
  }

  function clearTranscript(): void {
    if (isListening) {
      stopRecording();
    }

    latestValueRef.current = "";
    onTranscriptChange("");
    setError(null);

    try {
      window.localStorage.removeItem(
        `studiosago:frans-spreken:${exerciseId}`
      );
    } catch {
      // Local storage kan uitgeschakeld zijn.
    }
  }

  const wordCount = countWords(value);
  const requirementReached = wordCount >= minimumWords;

  if (!isSupported) {
    return (
      <div>
        <p>
          Spraakherkenning wordt niet ondersteund door deze browser.
          Typ je antwoord hieronder.
        </p>

        <textarea
          value={value}
          onChange={(event) =>
            onTranscriptChange(event.target.value)
          }
          placeholder="Typ hier je Franse antwoord..."
          rows={5}
        />
      </div>
    );
  }

  return (
    <div>
      <div>
        <button
          type="button"
          onClick={isListening ? stopRecording : startRecording}
        >
          {isListening ? "⏹ Stop opname" : "🎙️ Start opname"}
        </button>

        <button
          type="button"
          onClick={clearTranscript}
          disabled={!value.trim()}
        >
          Wissen
        </button>
      </div>

      <p aria-live="polite">
        {isListening
          ? "Ik luister... Spreek rustig en duidelijk Frans."
          : "Druk op start en spreek je antwoord in."}
      </p>

      <textarea
        value={value}
        onChange={(event) =>
          onTranscriptChange(event.target.value)
        }
        placeholder="Je gesproken antwoord verschijnt hier..."
        rows={5}
      />

      <p>
        {wordCount} van minstens {minimumWords} woorden
      </p>

      {requirementReached && (
        <p role="status">✅ Voldoende woorden.</p>
      )}

      {error && <p role="alert">⚠️ {error}</p>}
    </div>
  );
}
