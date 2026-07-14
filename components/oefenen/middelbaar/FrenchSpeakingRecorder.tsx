"use client";

import { useEffect, useRef, useState } from "react";

type FrenchSpeakingRecorderProps = {
  title?: string;
  instruction?: string;
  expectedText?: string;
  disabled?: boolean;
  onRecordingComplete?: (audioBlob: Blob) => void;
  onComplete?: (audioBlob: Blob) => void;

  /*
   * Hierdoor blijft het component bruikbaar wanneer er vanuit
   * VoorbereidingFransClient nog andere eigenschappen worden meegegeven.
   */
  [key: string]: unknown;
};

export default function FrenchSpeakingRecorder({
  title = "Spreekoefening",
  instruction = "Neem jezelf op terwijl je de Franse tekst uitspreekt.",
  expectedText,
  disabled = false,
  onRecordingComplete,
  onComplete,
}: FrenchSpeakingRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      stopTimer();
      stopMediaStream();

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopMediaStream() {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;
  }

  async function startRecording() {
    setError(null);

    if (disabled) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Je browser ondersteunt geen microfoonopnames. Gebruik bij voorkeur Chrome, Edge of Safari."
      );
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError("Je browser ondersteunt geen audio-opnames.");
      return;
    }

    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        const mimeType =
          recorder.mimeType || chunksRef.current[0]?.type || "audio/webm";

        const audioBlob = new Blob(chunksRef.current, {
          type: mimeType,
        });

        const newAudioUrl = URL.createObjectURL(audioBlob);

        setAudioUrl(newAudioUrl);
        setIsRecording(false);

        stopTimer();
        stopMediaStream();

        onRecordingComplete?.(audioBlob);
        onComplete?.(audioBlob);
      });

      recorder.addEventListener("error", () => {
        setError("De opname kon niet worden gemaakt.");
        setIsRecording(false);

        stopTimer();
        stopMediaStream();
      });

      recorder.start();
      setSeconds(0);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setSeconds((currentSeconds) => currentSeconds + 1);
      }, 1000);
    } catch (recordingError) {
      console.error("Microfoonfout:", recordingError);

      setError(
        "De microfoon kon niet worden geopend. Controleer of je toestemming hebt gegeven."
      );

      setIsRecording(false);
      stopTimer();
      stopMediaStream();
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      return;
    }

    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  function deleteRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setSeconds(0);
    setError(null);
  }

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return (
    <section
      style={{
        display: "grid",
        gap: "14px",
        padding: "20px",
        border: "1px solid rgba(3, 54, 99, 0.14)",
        borderRadius: "18px",
        background: "rgba(255, 255, 255, 0.88)",
        boxShadow: "0 12px 30px rgba(3, 54, 99, 0.08)",
      }}
    >
      <div>
        <h3
          style={{
            margin: "0 0 6px",
            color: "#033663",
            fontSize: "1.15rem",
          }}
        >
          🎙️ {title}
        </h3>

        <p
          style={{
            margin: 0,
            color: "#41566b",
            lineHeight: 1.6,
          }}
        >
          {instruction}
        </p>
      </div>

      {expectedText ? (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "14px",
            background: "#f4f8fb",
            color: "#033663",
            fontWeight: 700,
            lineHeight: 1.6,
          }}
        >
          {expectedText}
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#fff1f0",
            color: "#9f2f2f",
            fontWeight: 700,
          }}
        >
          {error}
        </p>
      ) : null}

      {isRecording ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#b42318",
            fontWeight: 800,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#d92d20",
            }}
          />

          Opname bezig — {formatTime(seconds)}
        </div>
      ) : null}

      {audioUrl ? (
        <audio
          controls
          src={audioUrl}
          style={{
            width: "100%",
          }}
        >
          Je browser ondersteunt het afspelen van audio niet.
        </audio>
      ) : null}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            style={{
              border: 0,
              borderRadius: "12px",
              padding: "11px 16px",
              background: disabled ? "#b8c2cc" : "#28b9aa",
              color: "#ffffff",
              fontWeight: 800,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            {audioUrl ? "Opnieuw opnemen" : "Start opname"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            style={{
              border: 0,
              borderRadius: "12px",
              padding: "11px 16px",
              background: "#d92d20",
              color: "#ffffff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Stop opname
          </button>
        )}

        {audioUrl && !isRecording ? (
          <button
            type="button"
            onClick={deleteRecording}
            style={{
              border: "1px solid rgba(3, 54, 99, 0.18)",
              borderRadius: "12px",
              padding: "11px 16px",
              background: "#ffffff",
              color: "#033663",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Verwijder opname
          </button>
        ) : null}
      </div>
    </section>
  );
}