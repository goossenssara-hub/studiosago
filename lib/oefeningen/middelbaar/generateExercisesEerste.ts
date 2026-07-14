import type { SecondaryExercise } from "./types";
import {
  selectAdaptiveExercises,
  type AdaptiveSelectionOptions,
} from "./adaptiveSelection";
import {
  createRandom,
  type ExerciseInput,
  type Random,
} from "./generators/shared";
import { generateSupplementalExercises } from "./generators/supplemental";
import { generateHoofdrekenen } from "./generators/hoofdrekenen";
import { generateVraagstukken } from "./generators/vraagstukken";
import { generateBreuken } from "./generators/breuken";
import { generateProcenten } from "./generators/procenten";
import { generateMeetkunde } from "./generators/meetkunde";
import { generateGrafieken } from "./generators/grafieken";
import { generateBegrijpendLezen } from "./generators/begrijpendLezen";
import { generateSpelling } from "./generators/spelling";
import { generateWoordenschat } from "./generators/woordenschat";
import { generateTaalbeschouwing } from "./generators/taalbeschouwing";
import { generateSamenvatten } from "./generators/samenvatten";
import { generateOpdrachten } from "./generators/opdrachten";
import { generateLerenLeren } from "./generators/lerenLeren";

export type ExerciseGenerationOptions = AdaptiveSelectionOptions;

const clampLevel = (level: number) =>
  Math.max(1, Math.min(10, Math.round(level || 1)));

export function normalizeExerciseSkill(skill: string) {
  return skill
    .trim()
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");
}

function makeExercises(
  skill: string,
  requestedLevel: number,
  seed: number,
  inputs: ExerciseInput[]
): SecondaryExercise[] {
  return inputs.map((exercise, index) => ({
    ...exercise,
    id: `${skill}-niveau-${requestedLevel}-${seed}-${index + 1}`,
  }));
}

function generateSkillInputs(
  normalizedSkill: string,
  level: number,
  random: Random
): ExerciseInput[] {
  let inputs: ExerciseInput[];

  switch (normalizedSkill) {
    case "wiskunde-vraagstukken":
      inputs = generateVraagstukken(level, random);
      break;
    case "wiskunde-hoofdrekenen":
      inputs = generateHoofdrekenen(level, random);
      break;
    case "wiskunde-breuken-kommagetallen":
      inputs = generateBreuken(level, random);
      break;
    case "wiskunde-procenten-verhoudingen":
      inputs = generateProcenten(level, random);
      break;
    case "wiskunde-meetkunde":
      inputs = generateMeetkunde(level, random);
      break;
    case "wiskunde-tabellen-grafieken":
      inputs = generateGrafieken(level, random);
      break;
    case "nederlands-opdrachten":
      inputs = generateOpdrachten(level, random);
      break;
    case "nederlands-begrijpend-lezen":
      inputs = generateBegrijpendLezen(level, random);
      break;
    case "nederlands-woordenschat":
      inputs = generateWoordenschat(level, random);
      break;
    case "nederlands-spelling":
      inputs = generateSpelling(level, random);
      break;
    case "nederlands-taalbeschouwing":
      inputs = generateTaalbeschouwing(level, random);
      break;
    case "nederlands-samenvatten":
      inputs = generateSamenvatten(level, random);
      break;
    case "leren-leren-plannen":
      inputs = generateLerenLeren(level, random);
      break;
    default:
      return [
        {
          category: `Onbekend onderdeel · niveau ${level}`,
          question: "Dit onderdeel is nog niet correct gekoppeld.",
          options: ["Terug naar het overzicht"],
          answer: "Terug naar het overzicht",
        },
      ];
  }

  if (inputs.length >= 15) return inputs;

  return [
    ...inputs,
    ...generateSupplementalExercises(normalizedSkill, level, random),
  ];
}


export function generateExercisePoolsEerste(
  skill: string,
  requestedLevel: number,
  seed = Date.now()
): Array<{ level: number; exercises: ExerciseInput[] }> {
  const level = clampLevel(requestedLevel);
  const normalizedSkill = normalizeExerciseSkill(skill);
  const levelsToGenerate = Array.from(
    new Set([Math.max(1, level - 1), level, Math.min(10, level + 1)])
  );

  return levelsToGenerate.map((poolLevel) => ({
    level: poolLevel,
    exercises: generateSkillInputs(
      normalizedSkill,
      poolLevel,
      createRandom(seed + poolLevel * 1009 + 37)
    ),
  }));
}

export function generateExercisesEerste(
  skill: string,
  requestedLevel: number,
  seed = Date.now(),
  options: ExerciseGenerationOptions = {}
): SecondaryExercise[] {
  const level = clampLevel(requestedLevel);
  const normalizedSkill = normalizeExerciseSkill(skill);
  const random = createRandom(seed + level * 1009);

  const pools = generateExercisePoolsEerste(normalizedSkill, level, seed);

  const selectedInputs = selectAdaptiveExercises(
    random,
    level,
    pools,
    options
  );

  return makeExercises(normalizedSkill, level, seed, selectedInputs);
}
