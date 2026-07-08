export function normalize(value: string | number) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,€]/g, "")
    .replace(/['’]/g, " ")
    .replace(/\s+/g, " ");
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
