export type SourceProfile =
  | "primary_v2"
  | "secondary_first_grade_v21"
  | "secondary_domain_v21"
  | "secondary_seventh_v21"
  | "okan_v1";

export interface NormalizedGoal {
  sourceFile: string;
  sourceVersion: string | null;
  sourceProfile: SourceProfile;
  sourceRowNumber: number;
  sourceKey: string;
  levelName: string | null;
  educationStructure: string | null;
  schoolYearCode: string | null;
  academyCode: "LAGER" | "MIDDELBAAR";
  programCode: string | null;
  subjectName: string;
  subjectCode: string;
  keyCompetency: string | null;
  goalType: string | null;
  officialCode: string | null;
  officialText: string;
  minimumRequirements: string | null;
  textCharacteristics: string | null;
  supportingResources: string | null;
  memorandum: string | null;
  footnote: string | null;
  validFrom: string | null;
  validUntil: string | null;
  metadata: Record<string, unknown>;
  raw: Record<string, unknown>;
}

export interface ImportStats {
  sourceFile: string;
  rowsRead: number;
  rowsValid: number;
  rowsInserted: number;
  rowsUpdated: number;
  rowsSkipped: number;
  warnings: string[];
}
