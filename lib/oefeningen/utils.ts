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

export function normalize(value: string | number): string {
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

export function isAcceptedAnswer(
  given: string | number,
  accepted: string | number | Array<string | number>,
): boolean {
  const normalizedGiven = normalize(given);
  if (!normalizedGiven) return false;

  const acceptedValues = Array.isArray(accepted) ? accepted : [accepted];
  return acceptedValues.some((answer) => normalize(answer) === normalizedGiven);
}

export function getAnswerExamples(
  accepted: string | number | Array<string | number>,
  max = 3,
): string[] {
  const values = Array.isArray(accepted) ? accepted : [accepted];
  const unique = new Map<string, string>();

  for (const value of values) {
    const display = String(value).trim();
    const key = normalize(display);
    if (display && key && !unique.has(key)) unique.set(key, display);
  }

  return [...unique.values()].slice(0, max);
}

export function seededRand(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.floor(r * (max - min + 1)) + min;
}

export function makeRandom(seed: number, level: number) {
  let randomCounter = 1;

  return function random(min: number, max: number) {
    randomCounter += 1;
    return seededRand(seed + level * 1000 + randomCounter * 37, min, max);
  };
}
