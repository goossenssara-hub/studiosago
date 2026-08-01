import "dotenv/config";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readWorkbook } from "./lib/normalizer";
import type { NormalizedGoal } from "./lib/types";

type ChangeType = "created" | "updated" | "unchanged" | "withdrawn" | "skipped" | "warning";

interface Args {
  input: string;
  commit: boolean;
  markMissingWithdrawn: boolean;
  report: string;
}

interface FileResult {
  file: string;
  rowsRead: number;
  rowsValid: number;
  created: number;
  updated: number;
  unchanged: number;
  withdrawn: number;
  skipped: number;
  warnings: number;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const value = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };

  return {
    input: path.resolve(value("--input") ?? "./data"),
    commit: args.includes("--commit"),
    markMissingWithdrawn: args.includes("--mark-missing-withdrawn"),
    report: path.resolve(value("--report") ?? "./education-goals-3b1-report.json"),
  };
}

function sha256(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sourceFamily(goal: NormalizedGoal): string {
  return `${goal.sourceProfile}:${goal.levelName ?? "unknown"}`.toLowerCase();
}

function canonicalKey(goal: NormalizedGoal): string {
  const official = goal.officialCode?.trim();
  if (official) return `${sourceFamily(goal)}:${official}`;
  return `${sourceFamily(goal)}:${sha256(`${goal.subjectCode}|${goal.officialText}`).slice(0, 24)}`;
}

function contentHash(goal: NormalizedGoal): string {
  return sha256(stableJson({
    officialText: goal.officialText,
    goalType: goal.goalType,
    subjectCode: goal.subjectCode,
    schoolYearCode: goal.schoolYearCode,
    keyCompetency: goal.keyCompetency,
    minimumRequirements: goal.minimumRequirements,
    textCharacteristics: goal.textCharacteristics,
    supportingResources: goal.supportingResources,
    memorandum: goal.memorandum,
    footnote: goal.footnote,
    validFrom: goal.validFrom,
    validUntil: goal.validUntil,
    metadata: goal.metadata,
  }));
}

function diffFields(previous: Record<string, unknown>, next: Record<string, unknown>): string[] {
  const fields = [
    "official_text", "goal_type", "subject_id", "school_year_id", "key_competency",
    "minimum_requirements", "text_characteristics", "supporting_resources", "memorandum",
    "footnote", "valid_from", "valid_until", "metadata",
  ];
  return fields.filter((field) => stableJson(previous[field]) !== stableJson(next[field]));
}

async function refId(client: SupabaseClient, table: string, code: string): Promise<string> {
  const { data, error } = await client.from(table).select("id").eq("code", code).maybeSingle();
  if (error) throw error;
  if (!data?.id) throw new Error(`${table}.${code} ontbreekt. Voer eerst 3A.3 uit.`);
  return data.id;
}

async function optionalRefId(client: SupabaseClient, table: string, code: string | null): Promise<string | null> {
  if (!code) return null;
  const { data, error } = await client.from(table).select("id").eq("code", code).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function ensureSubject(client: SupabaseClient, code: string, name: string): Promise<string> {
  const existing = await optionalRefId(client, "subjects", code);
  if (existing) return existing;
  const { data, error } = await client.from("subjects").insert({ code, name, sequence: 900, active: true }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function createBatch(client: SupabaseClient, file: string, fileHash: string, version: string | null, commit: boolean): Promise<string> {
  const { data, error } = await client.from("education_goal_import_batches").insert({
    source_file: file,
    source_hash: fileHash,
    source_version: version,
    import_mode: commit ? "commit" : "dry-run",
    status: "started",
  }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function createSource(client: SupabaseClient, batchId: string, file: string, fileHash: string, parsed: ReturnType<typeof readWorkbook>): Promise<string> {
  const family = parsed.goals[0] ? sourceFamily(parsed.goals[0]) : parsed.profile;
  const { data: existing, error: selectError } = await client.from("official_goal_sources").select("id").eq("file_hash", fileHash).maybeSingle();
  if (selectError) throw selectError;
  if (existing?.id) return existing.id;

  const { data, error } = await client.from("official_goal_sources").insert({
    source_name: file,
    version: parsed.goals[0]?.sourceVersion ?? null,
    file_hash: fileHash,
    source_family: family,
    source_profile: parsed.profile,
    sheet_name: parsed.sheetName,
    row_count: parsed.rowsRead,
    imported_batch_id: batchId,
    metadata: { sheetName: parsed.sheetName, sourceProfile: parsed.profile },
  }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function addIssue(client: SupabaseClient, batchId: string, file: string, row: number | null, severity: "info" | "warning" | "error", code: string, message: string, payload: Record<string, unknown> = {}): Promise<void> {
  const { error } = await client.from("official_goal_import_issues").insert({
    import_batch_id: batchId,
    source_file: file,
    source_row_number: row,
    severity,
    issue_code: code,
    message,
    source_payload: payload,
  });
  if (error) throw error;
}

async function addEvent(client: SupabaseClient, values: {
  batchId: string; sourceId: string; canonicalKey: string; goalId?: string | null;
  previousGoalId?: string | null; type: ChangeType; fields?: string[]; details?: Record<string, unknown>;
}): Promise<void> {
  const { error } = await client.from("official_goal_change_events").insert({
    import_batch_id: values.batchId,
    source_id: values.sourceId,
    canonical_key: values.canonicalKey,
    official_goal_id: values.goalId ?? null,
    previous_goal_id: values.previousGoalId ?? null,
    change_type: values.type,
    changed_fields: values.fields ?? [],
    details: values.details ?? {},
  });
  if (error) throw error;
}

async function importFile(client: SupabaseClient, filePath: string, args: Args): Promise<FileResult> {
  const file = path.basename(filePath);
  const fileHash = sha256(fs.readFileSync(filePath));
  const parsed = readWorkbook(filePath);
  const batchId = await createBatch(client, file, fileHash, parsed.goals[0]?.sourceVersion ?? null, args.commit);
  const sourceId = await createSource(client, batchId, file, fileHash, parsed);

  const result: FileResult = { file, rowsRead: parsed.rowsRead, rowsValid: parsed.goals.length, created: 0, updated: 0, unchanged: 0, withdrawn: 0, skipped: parsed.rowsRead - parsed.goals.length, warnings: 0 };
  const academyIds = {
    LAGER: await refId(client, "academies", "LAGER"),
    MIDDELBAAR: await refId(client, "academies", "MIDDELBAAR"),
  };
  const subjectCache = new Map<string, string>();
  const yearCache = new Map<string, string | null>();
  const seen = new Set<string>();

  try {
    for (const goal of parsed.goals) {
      const canonical = canonicalKey(goal);
      if (seen.has(canonical)) {
        result.skipped += 1;
        result.warnings += 1;
        await addIssue(client, batchId, file, goal.sourceRowNumber, "warning", "DUPLICATE_CANONICAL_KEY", `Dubbel doel binnen hetzelfde bestand: ${canonical}`, goal.raw);
        await addEvent(client, { batchId, sourceId, canonicalKey: canonical, type: "skipped", details: { reason: "duplicate_in_file", row: goal.sourceRowNumber } });
        continue;
      }
      seen.add(canonical);

      let subjectId = subjectCache.get(goal.subjectCode);
      if (!subjectId) {
        subjectId = await ensureSubject(client, goal.subjectCode, goal.subjectName);
        subjectCache.set(goal.subjectCode, subjectId);
      }

      let schoolYearId: string | null = null;
      if (goal.schoolYearCode) {
        if (!yearCache.has(goal.schoolYearCode)) yearCache.set(goal.schoolYearCode, await optionalRefId(client, "school_years", goal.schoolYearCode));
        schoolYearId = yearCache.get(goal.schoolYearCode) ?? null;
        if (!schoolYearId) {
          result.warnings += 1;
          await addIssue(client, batchId, file, goal.sourceRowNumber, "warning", "UNKNOWN_SCHOOL_YEAR", `Schooljaar ${goal.schoolYearCode} bestaat niet; doel wordt zonder schooljaar gekoppeld.`, goal.raw);
        }
      }

      const nextRecord = {
        source_id: sourceId,
        education_level_id: null,
        school_year_id: schoolYearId,
        subject_id: subjectId,
        academy_id: academyIds[goal.academyCode],
        program_id: null,
        key_competency: goal.keyCompetency,
        goal_type: goal.goalType,
        official_code: goal.officialCode,
        official_text: goal.officialText,
        minimum_requirements: goal.minimumRequirements,
        text_characteristics: goal.textCharacteristics,
        supporting_resources: goal.supportingResources,
        memorandum: goal.memorandum,
        footnote: goal.footnote,
        valid_from: goal.validFrom,
        valid_until: goal.validUntil,
        metadata: goal.metadata,
        source_row_number: goal.sourceRowNumber,
        source_key: goal.sourceKey,
        source_payload: goal.raw,
        import_batch_id: batchId,
        canonical_key: canonical,
        content_hash: contentHash(goal),
        lifecycle_status: "current",
        is_current: true,
        last_seen_at: new Date().toISOString(),
      };

      const { data: current, error: currentError } = await client.from("official_goals").select("*").eq("canonical_key", canonical).eq("is_current", true).maybeSingle();
      if (currentError) throw currentError;

      if (!current) {
        result.created += 1;
        if (args.commit) {
          const { data, error } = await client.from("official_goals").insert(nextRecord).select("id").single();
          if (error) throw error;
          await addEvent(client, { batchId, sourceId, canonicalKey: canonical, goalId: data.id, type: "created" });
        } else {
          await addEvent(client, { batchId, sourceId, canonicalKey: canonical, type: "created", details: { dryRun: true } });
        }
        continue;
      }

      if (current.content_hash === nextRecord.content_hash) {
        result.unchanged += 1;
        if (args.commit) {
          const { error } = await client.from("official_goals").update({ last_seen_at: new Date().toISOString(), import_batch_id: batchId }).eq("id", current.id);
          if (error) throw error;
        }
        await addEvent(client, { batchId, sourceId, canonicalKey: canonical, goalId: current.id, type: "unchanged" });
        continue;
      }

      result.updated += 1;
      const changed = diffFields(current, nextRecord);
      if (args.commit) {
        const { error: closeError } = await client.from("official_goals").update({ is_current: false, lifecycle_status: "superseded", last_seen_at: new Date().toISOString() }).eq("id", current.id);
        if (closeError) throw closeError;
        const { data, error } = await client.from("official_goals").insert({ ...nextRecord, supersedes_goal_id: current.id }).select("id").single();
        if (error) throw error;
        await addEvent(client, { batchId, sourceId, canonicalKey: canonical, goalId: data.id, previousGoalId: current.id, type: "updated", fields: changed });
      } else {
        await addEvent(client, { batchId, sourceId, canonicalKey: canonical, previousGoalId: current.id, type: "updated", fields: changed, details: { dryRun: true } });
      }
    }

    if (args.markMissingWithdrawn) {
      const family = parsed.goals[0] ? sourceFamily(parsed.goals[0]) : parsed.profile;
      const { data: candidates, error } = await client.from("official_goals").select("id,canonical_key").eq("is_current", true).like("canonical_key", `${family}:%`);
      if (error) throw error;
      for (const candidate of candidates ?? []) {
        if (!candidate.canonical_key || seen.has(candidate.canonical_key)) continue;
        result.withdrawn += 1;
        if (args.commit) {
          const { error: updateError } = await client.from("official_goals").update({ is_current: false, lifecycle_status: "withdrawn", last_seen_at: new Date().toISOString() }).eq("id", candidate.id);
          if (updateError) throw updateError;
        }
        await addEvent(client, { batchId, sourceId, canonicalKey: candidate.canonical_key, goalId: candidate.id, type: "withdrawn", details: { dryRun: !args.commit } });
      }
    }

    await client.from("education_goal_import_batches").update({
      status: result.warnings ? "completed_with_warnings" : "completed",
      rows_read: result.rowsRead,
      rows_valid: result.rowsValid,
      rows_inserted: result.created,
      rows_updated: result.updated,
      rows_skipped: result.skipped,
      warnings: result.warnings ? [{ count: result.warnings, message: "Zie official_goal_import_issues." }] : [],
      completed_at: new Date().toISOString(),
    }).eq("id", batchId).throwOnError();

    return result;
  } catch (error) {
    await client.from("education_goal_import_batches").update({
      status: "failed",
      error_message: error instanceof Error ? error.message : String(error),
      completed_at: new Date().toISOString(),
    }).eq("id", batchId);
    throw error;
  }
}

async function main(): Promise<void> {
  const args = parseArgs();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn verplicht.");

  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const stat = fs.statSync(args.input);
  const files = (stat.isDirectory()
    ? fs.readdirSync(args.input).filter((name) => /\.xlsx$/i.test(name) && !name.startsWith("~$")).map((name) => path.join(args.input, name))
    : [args.input]).sort();
  if (!files.length) throw new Error(`Geen .xlsx-bestanden gevonden in ${args.input}`);

  const results: FileResult[] = [];
  for (const file of files) {
    console.log(`\n${args.commit ? "IMPORT" : "DRY-RUN"}: ${path.basename(file)}`);
    const result = await importFile(client, file, args);
    results.push(result);
    console.table([result]);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: args.commit ? "commit" : "dry-run",
    markMissingWithdrawn: args.markMissingWithdrawn,
    files: results,
    totals: results.reduce((sum, item) => ({
      rowsRead: sum.rowsRead + item.rowsRead,
      rowsValid: sum.rowsValid + item.rowsValid,
      created: sum.created + item.created,
      updated: sum.updated + item.updated,
      unchanged: sum.unchanged + item.unchanged,
      withdrawn: sum.withdrawn + item.withdrawn,
      skipped: sum.skipped + item.skipped,
      warnings: sum.warnings + item.warnings,
    }), { rowsRead: 0, rowsValid: 0, created: 0, updated: 0, unchanged: 0, withdrawn: 0, skipped: 0, warnings: 0 }),
  };
  fs.writeFileSync(args.report, JSON.stringify(report, null, 2));
  console.log(`\nRapport: ${args.report}`);
  console.log(args.commit ? "3B.1-import voltooid." : "3B.1-dry-run voltooid; officiële doelen zijn niet gewijzigd.");
}

main().catch((error) => {
  console.error("\n3B.1 MISLUKT");
  console.error(error);
  process.exitCode = 1;
});
