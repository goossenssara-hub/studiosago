export function normalizeSecondary(value: string | number) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(",", ".")
    .replace(/[.!?]$/g, "");
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
