import { createHash } from "node:crypto";
import path from "node:path";
import * as XLSX from "xlsx";
import type { NormalizedGoal, SourceProfile } from "./types";

const EMPTY_VALUES = new Set(["", "0", "null", "undefined", "n/a", "-"]);

function clean(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  let result = String(value).trim();
  if (result.startsWith("'")) result = result.slice(1).trim();
  if (EMPTY_VALUES.has(result.toLowerCase())) return null;
  return result.replace(/\r\n/g, "\n");
}

function excelDate(value: unknown): string | null {
  const text = clean(value);
  if (!text) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const serial = Number(text);
  if (!Number.isFinite(serial) || serial < 20000 || serial > 80000) return null;

  const parsed = XLSX.SSF.parse_date_code(serial);
  if (!parsed) return null;
  return `${parsed.y.toString().padStart(4, "0")}-${parsed.m
    .toString()
    .padStart(2, "0")}-${parsed.d.toString().padStart(2, "0")}`;
}

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function mapSchoolYear(level: string | null, year: string | null): string | null {
  if (!year) return null;
  const match = year.match(/(\d+)/);
  if (!match) return null;
  const number = Number(match[1]);

  if (level?.toLowerCase().includes("basis")) return `L${number}`;
  if (level?.toLowerCase().includes("secundair")) {
    // In de bron voor het zevende leerjaar staat "3de leerjaar" binnen de 3de graad.
    if (number === 3) return "S7";
    return `S${number}`;
  }
  return null;
}

function detectProfile(headers: unknown[]): SourceProfile {
  const h = headers.map((value) => clean(value) ?? "");
  if (h.includes("Onderwijsstructuur") && h.includes("Vakdiscipline")) return "primary_v2";
  if (h.includes("Indelingstype") && h.includes("Nederlands voor nieuwkomers")) return "okan_v1";
  if (h.includes("Leerjaar") && h.includes("Wetenschapsdomein")) return "secondary_seventh_v21";
  if (h.includes("Stroom") && h.includes("Sleutelcompetentie")) return "secondary_first_grade_v21";
  if (h.includes("Wetenschapsdomein")) return "secondary_domain_v21";
  throw new Error(`Onbekend Excel-formaat. Kopteksten: ${h.slice(0, 20).join(" | ")}`);
}

function at(row: unknown[], index: number): string | null {
  return clean(row[index]);
}

function sourceVersion(sheetName: string): string | null {
  const match = sheetName.match(/versie\s+(.+)/i);
  return match?.[1]?.trim() ?? null;
}

function makeSourceKey(code: string | null, rowNumber: number, text: string): string {
  if (code) return code;
  return `ROW_${rowNumber}_${createHash("sha1").update(text).digest("hex").slice(0, 12)}`;
}

function normalizeRow(
  profile: SourceProfile,
  fileName: string,
  sheetName: string,
  row: unknown[],
  rowNumber: number,
): NormalizedGoal | null {
  let level: string | null = null;
  let educationStructure: string | null = null;
  let schoolYear: string | null = null;
  let subject: string | null = null;
  let keyCompetency: string | null = null;
  let goalType: string | null = null;
  let code: string | null = null;
  let text: string | null = null;
  let minimumRequirements: string | null = null;
  let textCharacteristics: string | null = null;
  let supportingResources: string | null = null;
  let memorandum: string | null = null;
  let footnote: string | null = null;
  let validFrom: string | null = null;
  let validUntil: string | null = null;
  let programCode: string | null = null;
  const metadata: Record<string, unknown> = {};

  switch (profile) {
    case "primary_v2":
      level = at(row, 0);
      educationStructure = at(row, 1);
      schoolYear = at(row, 2);
      subject = at(row, 4);
      goalType = at(row, 5);
      metadata.topic = at(row, 6);
      metadata.subtheme = at(row, 7);
      code = at(row, 8);
      text = [at(row, 9), at(row, 10)].filter(Boolean).join("\n");
      metadata.vocabulary = at(row, 12);
      validFrom = excelDate(row[13]);
      validUntil = excelDate(row[14]);
      break;

    case "secondary_first_grade_v21":
      level = at(row, 0);
      metadata.grade = at(row, 5);
      metadata.stream = at(row, 7);
      keyCompetency = at(row, 10);
      subject = keyCompetency;
      goalType = at(row, 12);
      code = at(row, 17);
      text = at(row, 18);
      minimumRequirements = at(row, 24);
      textCharacteristics = at(row, 25);
      supportingResources = at(row, 26);
      memorandum = at(row, 28);
      footnote = at(row, 29);
      validFrom = excelDate(row[31]);
      validUntil = excelDate(row[32]);
      break;

    case "secondary_domain_v21":
      level = at(row, 0);
      metadata.grade = at(row, 5);
      metadata.educationForm = at(row, 8);
      metadata.finality = at(row, 9);
      keyCompetency = at(row, 10);
      const scienceDomain = at(row, 11);
      metadata.scienceDomain = scienceDomain;
      goalType = at(row, 12);
      metadata.componentType = at(row, 13);
      metadata.component = at(row, 14);
      subject = scienceDomain ?? keyCompetency ?? at(row, 14);
      code = at(row, 17);
      text = at(row, 18);
      minimumRequirements = at(row, 24);
      textCharacteristics = at(row, 25);
      supportingResources = at(row, 26);
      memorandum = at(row, 28);
      footnote = at(row, 29);
      validFrom = excelDate(row[31]);
      validUntil = excelDate(row[32]);
      break;

    case "secondary_seventh_v21":
      level = at(row, 0);
      metadata.grade = at(row, 5);
      schoolYear = at(row, 6);
      keyCompetency = at(row, 10);
      const domain = at(row, 11);
      metadata.scienceDomain = domain;
      goalType = at(row, 12);
      metadata.componentType = at(row, 13);
      metadata.component = at(row, 14);
      subject = domain ?? keyCompetency ?? at(row, 14);
      code = at(row, 17);
      text = at(row, 18);
      metadata.goalInformation = at(row, 19);
      minimumRequirements = at(row, 24);
      textCharacteristics = at(row, 25);
      supportingResources = at(row, 26);
      memorandum = at(row, 28);
      footnote = at(row, 29);
      validFrom = excelDate(row[31]);
      validUntil = excelDate(row[32]);
      break;

    case "okan_v1":
      level = at(row, 0);
      subject = at(row, 9) ?? "Nederlands voor nieuwkomers";
      metadata.classificationType = at(row, 10);
      goalType = at(row, 12);
      metadata.section = at(row, 13);
      code = at(row, 16);
      text = at(row, 17);
      metadata.attitudinal = at(row, 19);
      validFrom = excelDate(row[20]);
      validUntil = excelDate(row[21]);
      programCode = "OKAN";
      break;
  }

  if (!text || text.length < 8) return null;
  const academyCode = level?.toLowerCase().includes("basis") ? "LAGER" : "MIDDELBAAR";
  const subjectName = subject ?? keyCompetency ?? "Algemene competenties";
  const sourceKey = makeSourceKey(code, rowNumber, text);

  const raw: Record<string, unknown> = {};
  row.forEach((value, index) => {
    const cleaned = clean(value);
    if (cleaned !== null) raw[`column_${index + 1}`] = cleaned;
  });

  return {
    sourceFile: fileName,
    sourceVersion: sourceVersion(sheetName),
    sourceProfile: profile,
    sourceRowNumber: rowNumber,
    sourceKey,
    levelName: level,
    educationStructure,
    schoolYearCode: mapSchoolYear(level, schoolYear),
    academyCode,
    programCode,
    subjectName,
    subjectCode: slug(subjectName),
    keyCompetency,
    goalType,
    officialCode: code,
    officialText: text,
    minimumRequirements,
    textCharacteristics,
    supportingResources,
    memorandum,
    footnote,
    validFrom,
    validUntil,
    metadata: {
      ...metadata,
      originalSchoolYear: schoolYear,
      sourceProfile: profile,
    },
    raw,
  };
}

export function readWorkbook(filePath: string): {
  sheetName: string;
  profile: SourceProfile;
  goals: NormalizedGoal[];
  rowsRead: number;
} {
  const workbook = XLSX.readFile(filePath, { cellDates: false, raw: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error(`Geen werkblad gevonden in ${filePath}`);

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  });

  const headers = rows[0] ?? [];
  const profile = detectProfile(headers);
  const goals: NormalizedGoal[] = [];

  rows.slice(1).forEach((row, index) => {
    const normalized = normalizeRow(
      profile,
      path.basename(filePath),
      sheetName,
      row,
      index + 2,
    );
    if (normalized) goals.push(normalized);
  });

  return { sheetName, profile, goals, rowsRead: Math.max(0, rows.length - 1) };
}
