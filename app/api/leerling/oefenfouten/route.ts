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
  const recentBonus = Math.max(0, 7 - Math.floor(ageInDays));

  return Math.max(
    0,
    row.error_count * 3 + recentBonus - row.correct_after_error_count * 2
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

function validLevel(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 10;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet aangemeld." }, { status: 401 });
  }

  const skill = request.nextUrl.searchParams.get("skill")?.trim();
  let query = supabase
    .from("student_exercise_errors")
    .select("*")
    .eq("auth_user_id", user.id)
    .eq("is_resolved", false)
    .order("last_error_at", { ascending: false })
    .limit(100);

  if (skill) query = query.eq("skill", skill);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const errors = ((data ?? []) as ErrorRow[])
    .map(mapRow)
    .sort((a, b) => b.priority - a.priority);

  return NextResponse.json({ errors });
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
  const level = body?.level;
  const exerciseFingerprint =
    typeof body?.exerciseFingerprint === "string"
      ? body.exerciseFingerprint.trim()
      : "";
  const question =
    typeof body?.question === "string" ? body.question.trim() : "";
  const exerciseType =
    body?.exerciseType === "multiple-choice" ? "multiple-choice" : "open";
  const exerciseId =
    typeof body?.exerciseId === "string" ? body.exerciseId : null;
  const wrongAnswer =
    typeof body?.wrongAnswer === "string" ? body.wrongAnswer.trim() : "";
  const correctAnswer = body?.correctAnswer;

  if (!skill || !validLevel(level) || !exerciseFingerprint || !question) {
    return NextResponse.json(
      { error: "Ongeldige of onvolledige oefengegevens." },
      { status: 400 }
    );
  }

  if (
    typeof correctAnswer !== "string" &&
    !(
      Array.isArray(correctAnswer) &&
      correctAnswer.every((item) => typeof item === "string")
    )
  ) {
    return NextResponse.json(
      { error: "Het correcte antwoord heeft een ongeldig formaat." },
      { status: 400 }
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("student_exercise_errors")
    .select("*")
    .eq("auth_user_id", user.id)
    .eq("skill", skill)
    .eq("level", level)
    .eq("exercise_fingerprint", exerciseFingerprint)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }

  const now = new Date().toISOString();
  let saved: ErrorRow | null = null;

  if (existing) {
    const { data, error } = await supabase
      .from("student_exercise_errors")
      .update({
        exercise_id: exerciseId,
        question,
        exercise_type: exerciseType,
        wrong_answer: wrongAnswer || null,
        correct_answer: correctAnswer,
        error_count: Number(existing.error_count ?? 0) + 1,
        correct_after_error_count: 0,
        is_resolved: false,
        last_error_at: now,
        last_correct_at: null,
        resolved_at: null,
        next_review_at: null,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    saved = data as ErrorRow;
  } else {
    const { data, error } = await supabase
      .from("student_exercise_errors")
      .insert({
        auth_user_id: user.id,
        skill,
        level,
        exercise_id: exerciseId,
        exercise_fingerprint: exerciseFingerprint,
        question,
        exercise_type: exerciseType,
        wrong_answer: wrongAnswer || null,
        correct_answer: correctAnswer,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    saved = data as ErrorRow;
  }

  return NextResponse.json({ errorRecord: mapRow(saved) });
}
