"use client";

import { levels } from "@/lib/oefeningen/data";

type Props = {
  level: number;
  reachedLevels: number[];

  /** Nieuwe interface: aantal reeds behandelde oefeningen. */
  completedCount?: number;
  total: number;
  onGoToLevel: (level: number) => void;

  /**
   * Tijdelijke compatibiliteit met oudere oefenpagina's.
   * Deze waarden worden bewust niet als score of percentage getoond.
   */
  displayedPercentage?: number;
  displayedScore?: number;
  checked?: boolean;
  savedChecked?: boolean;
  percentage?: number;
  onPrevious?: () => void;
  onImprove?: () => void;
  onNext?: () => void;
  onReset?: () => void;
};

export default function MountainProgress({
  level,
  reachedLevels,
  completedCount,
  displayedScore,
  total,
  onGoToLevel,
}: Props) {
  const viewedCount = Math.max(
    0,
    Math.min(total, Number(completedCount ?? displayedScore ?? 0)),
  );

  return (
    <section className="learning-route" aria-label="Jouw leerroute">
      <div className="route-copy">
        <p className="eyebrow">Jouw leerroute</p>
        <h2>Werk rustig, doel per doel</h2>
        <p>
          Je hoeft niet alles tegelijk te maken. Kies een leergebied en ontdek
          telkens één oefening.
        </p>
      </div>

      <div className="route-status">
        <span>Deze reeks</span>
        <strong>
          {viewedCount} van {total} bekeken
        </strong>
      </div>

      <div className="abstract-level-path">
        {levels.map((item) => {
          const unlocked = reachedLevels.includes(item);

          return (
            <button
              key={item}
              type="button"
              disabled={!unlocked}
              className={`${item === level ? "active" : ""} ${
                unlocked ? "unlocked" : "locked"
              }`}
              onClick={() => onGoToLevel(item)}
              aria-label={
                unlocked
                  ? `Open niveau ${item}`
                  : `Niveau ${item} is nog gesloten`
              }
            >
              <span>{item}</span>
              <small>
                {item === level ? "Hier ben je" : unlocked ? "Open" : "Later"}
              </small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
