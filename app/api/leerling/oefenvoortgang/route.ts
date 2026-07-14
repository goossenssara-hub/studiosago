import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recommendDifficulty } from "@/lib/oefeningen/middelbaar/adaptiveDifficulty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProgressRow = {
  skill: string;
  current_level: number;
  recommended_level: number;
  highest_level: number;
  total_sessions: number;
  total_exercises: number;
  total_correct: number;
  average_score: number | string;
  last_score: number | null;
  consecutive_passes: number;
  consecutive_strong_passes: number;
  last_action: string | null;
  last_practiced_at: string | null;
};

function validLevel(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 10;
}

function validCount(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function mapProgress(row: ProgressRow) {
  return {
    skill: row.skill,
    currentLevel: row.current_level,
    recommendedLevel: row.recommended_level,
    highestLevel: row.highest_level,
    totalSessions: row.total_sessions,
    totalExercises: row.total_exercises,
    totalCorrect: row.total_correct,
    averageScore: Number(row.average_score),
    lastScore: row.last_score,
    consecutivePasses: row.consecutive_passes,
    consecutiveStrongPasses: row.consecutive_strong_passes,
    lastAction: row.last_action,
    lastPracticedAt: row.last_practiced_at,
  };
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
  if (!skill) {
    return NextResponse.json({ error: "Skill ontbreekt." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("student_exercise_progress")
    .select("*")
    .eq("auth_user_id", user.id)
    .eq("skill", skill)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    progress: data ? mapProgress(data as ProgressRow) : null,
  });
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
  const correctAnswers = body?.correctAnswers;
  const totalExercises = body?.totalExercises;
  const durationSeconds =
    validCount(body?.durationSeconds) ? Number(body?.durationSeconds) : null;

  if (
    !skill ||
    !validLevel(level) ||
    !validCount(correctAnswers) ||
    !validCount(totalExercises) ||
    Number(totalExercises) < 1 ||
    Number(correctAnswers) > Number(totalExercises)
  ) {
    return NextResponse.json(
      { error: "Ongeldige of onvolledige sessiegegevens." },
      { status: 400 }
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("student_exercise_progress")
    .select("*")
    .eq("auth_user_id", user.id)
    .eq("skill", skill)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }

  const current = existing as ProgressRow | null;
  const recommendation = recommendDifficulty({
    level: Number(level),
    correctAnswers: Number(correctAnswers),
    totalExercises: Number(totalExercises),
    previousConsecutivePasses: current?.consecutive_strong_passes ?? 0,
  });

  const totalSessions = (current?.total_sessions ?? 0) + 1;
  const newTotalExercises =
    (current?.total_exercises ?? 0) + Number(totalExercises);
  const newTotalCorrect =
    (current?.total_correct ?? 0) + Number(correctAnswers);
  const averageScore = Number(
    ((newTotalCorrect / newTotalExercises) * 100).toFixed(2)
  );
  const consecutivePasses = recommendation.passed
    ? (current?.consecutive_passes ?? 0) + 1
    : 0;
  const consecutiveStrongPasses =
    recommendation.scorePercentage >= 95
      ? (current?.consecutive_strong_passes ?? 0) + 1
      : 0;
  const now = new Date().toISOString();

  const progressPayload = {
    auth_user_id: user.id,
    skill,
    current_level: recommendation.recommendedLevel,
    recommended_level: recommendation.recommendedLevel,
    highest_level: Math.max(
      current?.highest_level ?? 1,
      recommendation.recommendedLevel
    ),
    total_sessions: totalSessions,
    total_exercises: newTotalExercises,
    total_correct: newTotalCorrect,
    average_score: averageScore,
    last_score: recommendation.scorePercentage,
    consecutive_passes: consecutivePasses,
    consecutive_strong_passes: consecutiveStrongPasses,
    last_action: recommendation.action,
    last_practiced_at: now,
  };

  const { data: savedProgress, error: saveError } = await supabase
    .from("student_exercise_progress")
    .upsert(progressPayload, { onConflict: "auth_user_id,skill" })
    .select("*")
    .single();

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 400 });
  }

  const { error: sessionError } = await supabase
    .from("student_exercise_sessions")
    .insert({
      auth_user_id: user.id,
      skill,
      level: Number(level),
      correct_answers: Number(correctAnswers),
      total_exercises: Number(totalExercises),
      score_percentage: recommendation.scorePercentage,
      duration_seconds: durationSeconds,
      recommended_level: recommendation.recommendedLevel,
      difficulty_action: recommendation.action,
    });

  if (sessionError) {
    console.warn("Oefensessie kon niet in de historiek worden opgeslagen:", sessionError.message);
  }

  return NextResponse.json({
    progress: mapProgress(savedProgress as ProgressRow),
    recommendation,
  });
}
