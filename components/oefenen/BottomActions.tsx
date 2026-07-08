type Props = {
  level: number;
  checked: boolean;
  percentage: number;
  onPrevious: () => void;
  onImprove: () => void;
  onNext: () => void;
  onReset: () => void;
};

export default function BottomActions({
  level,
  checked,
  percentage,
  onPrevious,
  onImprove,
  onNext,
  onReset,
}: Props) {
  return (
    <section className="bottom-journey-actions">
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

      <button type="button" className="refresh" onClick={onReset}>
        Nieuwe oefeningen
      </button>

      {checked && percentage < 75 && (
        <p className="level-warning">
          Je hebt minstens 75% nodig om het volgende niveau vrij te spelen.
        </p>
      )}
    </section>
  );
}
