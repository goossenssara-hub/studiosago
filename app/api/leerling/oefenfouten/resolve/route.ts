import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrorRow = {
  id: string;
  skill: string;
  level: number;
  exercise_id: string | null;
  exercise_fingerprint: string;
  question: string;
  exercise_type: "multiple-choice" | "open";
  wrong_answer: string | null;
  correct_answer: string | string[];
  error_count: number;
  correct_after_error_count: number;
  is_resolved: boolean;
  first_error_at: string;
  last_error_at: string;
  last_correct_at: string | null;
  resolved_at: string | null;
  next_review_at: string | null;
};

function calculatePriority(row: ErrorRow): number {
  const ageInDays = Math.max(
    0,
    (Date.now() - new Date(row.last_error_at).getTime()) / 86_400_000
  );
  return Math.max(
    0,
    row.error_count * 3 + Math.max(0, 7 - Math.floor(ageInDays)) -
      row.correct_after_error_count * 2
  );
}

function mapRow(row: ErrorRow) {
  return {
    id: row.id,
    skill: row.skill,
    level: row.level,
    exerciseId: row.exercise_id,
    exerciseFingerprint: row.exercise_fingerprint,
    question: row.question,
    exerciseType: row.exercise_type,
    wrongAnswer: row.wrong_answer,
    correctAnswer: row.correct_answer,
    errorCount: row.error_count,
    correctAfterErrorCount: row.correct_after_error_count,
    isResolved: row.is_resolved,
    firstErrorAt: row.first_error_at,
    lastErrorAt: row.last_error_at,
    lastCorrectAt: row.last_correct_at,
    resolvedAt: row.resolved_at,
    nextReviewAt: row.next_review_at,
    priority: calculatePriority(row),
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet aangemeld." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const skill = typeof body?.skill === "string" ? body.skill.trim() : "";
  const level = Number(body?.level);
  const fingerprint =
    typeof body?.exerciseFingerprint === "string"
      ? body.exerciseFingerprint.trim()
      : "";

  if (!skill || !Number.isInteger(level) || level < 1 || level > 10 || !fingerprint) {
    return NextResponse.json(
      { error: "Ongeldige of onvolledige oefengegevens." },
      { status: 400 }
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("student_exercise_errors")
    .select("*")
    .eq("auth_user_id", user.id)
    .eq("skill", skill)
    .eq("level", level)
    .eq("exercise_fingerprint", fingerprint)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }

  if (!existing) {
    return NextResponse.json({ errorRecord: null });
  }

  const correctCount = Number(existing.correct_after_error_count ?? 0) + 1;
  const resolved = correctCount >= 3;
  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + (resolved ? 14 : correctCount === 2 ? 7 : 3));

  const { data, error } = await supabase
    .from("student_exercise_errors")
    .update({
      correct_after_error_count: correctCount,
      last_correct_at: now.toISOString(),
      is_resolved: resolved,
      resolved_at: resolved ? now.toISOString() : null,
      next_review_at: nextReview.toISOString(),
    })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ errorRecord: mapRow(data as ErrorRow) });
}
