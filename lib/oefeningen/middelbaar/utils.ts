function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeTimeNotation(value: string): string | null {
  const text = stripDiacritics(value.toLowerCase())
    .replace(/\buren?\b/g, "u")
    .replace(/\bminuten?\b/g, "min")
    .replace(/\bmins?\b/g, "min")
    .replace(/\ben\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const match = text.match(/^(\d{1,2})\s*(?:u|:|\.)\s*(\d{1,2})\s*(?:min)?$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes > 59) return null;

  return `${hours}u${minutes}`;
}

function normalizeMeasurement(value: string): string {
  return value
    .replace(/\bcentimeters?\b/g, "cm")
    .replace(/\bmillimeters?\b/g, "mm")
    .replace(/\bkilometers?\b/g, "km")
    .replace(/\bmeters?\b/g, "m")
    .replace(/\bkilogrammen?\b/g, "kg")
    .replace(/\bgrammen?\b/g, "g")
    .replace(/\bliters?\b/g, "l")
    .replace(/\bprocent\b/g, "%");
}

export function normalizeSecondary(value: string | number): string {
  const raw = String(value).trim();
  const time = normalizeTimeNotation(raw);
  if (time) return time;

  return normalizeMeasurement(stripDiacritics(raw.toLowerCase()))
    .replace(/,/g, ".")
    .replace(/[€]/g, "")
    .replace(/['’]/g, " ")
    .replace(/[.!?;]+$/g, "")
    .replace(/\s*([/%:+\-×x])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAcceptedSecondaryAnswer(
  given: string | number,
  accepted: string | number | Array<string | number>,
): boolean {
  const normalizedGiven = normalizeSecondary(given);
  if (!normalizedGiven) return false;

  const acceptedValues = Array.isArray(accepted) ? accepted : [accepted];
  return acceptedValues.some((answer) => normalizeSecondary(answer) === normalizedGiven);
}

export function getSecondaryAnswerExamples(
  accepted: string | number | Array<string | number>,
  max = 3,
): string[] {
  const values = Array.isArray(accepted) ? accepted : [accepted];
  const unique = new Map<string, string>();

  for (const value of values) {
    const display = String(value).trim();
    const key = normalizeSecondary(display);
    if (display && key && !unique.has(key)) unique.set(key, display);
  }

  return [...unique.values()].slice(0, max);
}

export function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function pick<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length)];
}

export function shuffle<T>(items: T[], random: () => number) {
  return [...items].sort(() => random() - 0.5);
}
