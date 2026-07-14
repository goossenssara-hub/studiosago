import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const editableFields = [
  "name",
  "birth_date",
  "school",
  "grade",
  "education_level",
  "secondary_track",
  "finality",
  "parent_name",
  "parent_relation",
  "parent_email",
  "diagnosis",
  "support_needs",
  "goals",
  "preferred_subjects",
  "medical_info",
  "doctor_name",
  "doctor_phone",
  "notes",
] as const;

type EditableField = (typeof editableFields)[number];

function cleanOptionalString(value: unknown) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      response: NextResponse.json(
        { error: "Je bent niet aangemeld." },
        { status: 401 },
      ),
    };
  }

  return {
    supabase,
    response: null,
  };
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;
  const { supabase, response } = await requireAuthenticatedUser();

  if (response) return response;

  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !student) {
    return NextResponse.json(
      { error: "De leerling werd niet gevonden." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { student },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;
  const { supabase, response } = await requireAuthenticatedUser();

  if (response) return response;

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "De verzonden gegevens zijn ongeldig." },
      { status: 400 },
    );
  }

  const name =
    typeof body.name === "string" ? body.name.trim() : "";
  const grade =
    typeof body.grade === "string" ? body.grade.trim() : "";
  const educationLevel =
    typeof body.education_level === "string"
      ? body.education_level.trim()
      : "";

  if (!name) {
    return NextResponse.json(
      { error: "De naam van de leerling is verplicht." },
      { status: 400 },
    );
  }

  if (!grade) {
    return NextResponse.json(
      { error: "Het leerjaar is verplicht." },
      { status: 400 },
    );
  }

  if (!educationLevel) {
    return NextResponse.json(
      { error: "Het onderwijsniveau is verplicht." },
      { status: 400 },
    );
  }

  const updateData: Partial<Record<EditableField, string | null>> = {};

  for (const field of editableFields) {
    if (!(field in body)) continue;

    if (field === "name") {
      updateData.name = name;
      continue;
    }

    if (field === "grade") {
      updateData.grade = grade;
      continue;
    }

    if (field === "education_level") {
      updateData.education_level = educationLevel;
      continue;
    }

    updateData[field] = cleanOptionalString(body[field]);
  }

  /*
   * Beveiliging:
   * photo_consent, auth_user_id en student_email staan bewust niet
   * in editableFields en kunnen via deze route dus nooit gewijzigd worden.
   */
  const { data: student, error } = await supabase
    .from("students")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Leerling bijwerken mislukt:", error);

    return NextResponse.json(
      { error: "De leerlinggegevens konden niet opgeslagen worden." },
      { status: 500 },
    );
  }

  return NextResponse.json({ student }, { status: 200 });
}
