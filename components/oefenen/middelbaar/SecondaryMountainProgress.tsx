"use client";

type Props = {
  level: number;
  reachedLevels: number[];
  displayedPercentage: number;
  displayedScore: number;
  total: number;
  percentage: number;
  checked: boolean;
  onGoToLevel: (level: number) => void;
  onPrevious: () => void;
  onImprove: () => void;
  onNext: () => void;
  onReset: () => void;
};

export default function SecondaryMountainProgress({
  level,
  reachedLevels,
  displayedPercentage,
  displayedScore,
  total,
  percentage,
  checked,
  onGoToLevel,
  onPrevious,
  onImprove,
  onNext,
  onReset,
}: Props) {
  return (
    <section className="learning-journey-card">
      <div className="journey-header">
        <div>
          <p className="eyebrow">Jouw oefenklim</p>
          <h2>Niveau {level}</h2>
          <p>Behaal minstens 75% om de volgende top te bereiken.</p>
        </div>

        <div className="journey-goal">
          {displayedScore}/{total} juist · {displayedPercentage}%
        </div>
      </div>

      <div className="journey-mountain">
        {Array.from({ length: 10 }, (_, index) => index + 1).map((item) => {
          const reached = reachedLevels.includes(item);
          const active = item === level;

          return (
            <button
              aria-label={`Niveau ${item}`}
              className={[
                "journey-flag",
                reached ? "reached" : "",
                active ? "active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={!reached}
              key={item}
              onClick={() => onGoToLevel(item)}
              type="button"
            >
              {reached ? item : "🔒"}
            </button>
          );
        })}
      </div>

      <div className="journey-bottom">
        <div className="journey-box">
          <small>Huidig niveau</small>
          <strong>{level}/10</strong>
          <p>Blijf oefenen en klim naar de top.</p>
        </div>

        <div className="journey-box">
          <small>Vooruitgang</small>
          <strong>{displayedPercentage}%</strong>
          <div className="progress-track">
            <span style={{ width: `${displayedPercentage}%` }} />
          </div>
        </div>

        <div className="journey-actions">
          <button disabled={level === 1} onClick={onPrevious} type="button">
            Vorig niveau
          </button>
          <button className="primary" onClick={onImprove} type="button">
            Verbeter
          </button>
          <button
            disabled={!checked || percentage < 75 || level === 10}
            onClick={onNext}
            type="button"
          >
            Volgend niveau
          </button>
          <button onClick={onReset} type="button">
            Nieuwe oefeningen
          </button>
        </div>
      </div>
    </section>
  );
}
