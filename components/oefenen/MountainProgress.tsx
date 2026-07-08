"use client";

import { useState } from "react";
import { levels } from "@/lib/oefeningen/data";

type Props = {
  level: number;
  reachedLevels: number[];
  displayedPercentage: number;
  displayedScore: number;
  total: number;
  checked: boolean;
  savedChecked: boolean;
  percentage: number;
  onGoToLevel: (level: number) => void;
  onPrevious: () => void;
  onImprove: () => void;
  onNext: () => void;
  onReset: () => void;
};

export default function MountainProgress({
  level,
  reachedLevels,
  displayedPercentage,
  displayedScore,
  total,
  checked,
  savedChecked,
  percentage,
  onGoToLevel,
  onPrevious,
  onImprove,
  onNext,
  onReset,
}: Props) {
  const [showLevels, setShowLevels] = useState(false);

  function canOpenLevel(targetLevel: number) {
    return reachedLevels.includes(targetLevel);
  }

  return (
    <section className="learning-journey-card">
      <div className="journey-header">
        <div>
          <div className="mountain-header">
            <h2>Jouw oefenreis 🏔️</h2>

            <button
              type="button"
              className="level-selector-button"
              onClick={() => setShowLevels((previous) => !previous)}
            >
              Kies niveau
            </button>
          </div>

          <p>Klim naar de top en word een kei in leren! 💪</p>
        </div>

        <div className="journey-goal">
          ⭐ <span>Bereik niveau 10</span>
        </div>
      </div>

      {showLevels && (
        <div className="level-grid">
          {Array.from({ length: 10 }, (_, i) => {
            const lvl = i + 1;
            const unlocked = reachedLevels.includes(lvl);

            return (
              <button
                key={lvl}
                type="button"
                disabled={!unlocked}
                className={`level-card ${
                  level === lvl ? "active" : unlocked ? "" : "locked"
                }`}
                onClick={() => {
                  onGoToLevel(lvl);
                  setShowLevels(false);
                }}
              >
                {unlocked ? `Niveau ${lvl}` : `🔒 Niveau ${lvl}`}
              </button>
            );
          })}
        </div>
      )}

      <div className="journey-mountain">
        {levels.map((item) => (
          <button
            key={item}
            type="button"
            className={`journey-flag ${item === level ? "active" : ""} ${
              reachedLevels.includes(item) ? "reached" : ""
            }`}
            onClick={() => onGoToLevel(item)}
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
          <strong>{displayedPercentage}%</strong>
          <p>
            {savedChecked || checked
              ? `${displayedScore} / ${total} oefeningen juist`
              : "Nog niet verbeterd"}
          </p>

          <div className="progress-track">
            <span style={{ width: `${displayedPercentage}%` }} />
          </div>
        </div>

        <div className="journey-actions">
          <button type="button" onClick={onPrevious} disabled={level === 1}>
            ← Vorige niveau
          </button>

          <button type="button" className="primary" onClick={onImprove}>
            ✓ Verbeter antwoorden
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={level === 10 || !checked || percentage < 75}
          >
            Volgende niveau →
          </button>

          <button type="button" onClick={onReset}>
            Nieuwe oefeningen voor dit niveau
          </button>

          {checked && percentage < 75 && (
            <p className="level-warning">
              Je hebt minstens 75% nodig om het volgende niveau vrij te spelen.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}