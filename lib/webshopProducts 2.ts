export const webshopProducts = {
  "10-beurtenkaart-lager": {
    name: "10-beurtenkaart Lager onderwijs",
    amount: "320.00",
    category: "pass",
    level: "lager",
  },

  "10-beurtenkaart-secundair": {
    name: "10-beurtenkaart Secundair onderwijs",
    amount: "380.00",
    category: "pass",
    level: "secundair",
  },

  "tekstcorrectie": {
    name: "Tekstcorrectie",
    amount: "20.00",
    category: "text",
    level: "algemeen",
  },

  "klaar-voor-de-sprong-middelbaar": {
    name: "Klaar voor de Sprong naar het Middelbaar",
    amount: "250.00",
    category: "workshop",
    level: "middelbaar",
  },
} as const;

export type WebshopProductKey = keyof typeof webshopProducts;

export function calculateCorrectionPrice(words: number) {
  if (words <= 2000) return 20;

  return 20 + Math.ceil((words - 2000) / 1000) * 8;
}