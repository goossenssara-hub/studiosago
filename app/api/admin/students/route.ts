import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StudentPayload = {
  name?: unknown;
  birth_date?: unknown;
  school?: unknown;
  grade?: unknown;
  education_level?: unknown;
  secondary_track?: unknown;
  finality?: unknown;
  parent_name?: unknown;
  parent_relation?: unknown;
  parent_email?: unknown;
  diagnosis?: unknown;
  support_needs?: unknown;
  goals?: unknown;
  preferred_subjects?: unknown;
  medical_info?: unknown;
  doctor_name?: unknown;
  doctor_phone?: unknown;
  notes?: unknown;
  photo_consent?: unknown;
};

function cleanText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function cleanRequiredText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("STUDENTS GET ERROR:", error);

      return NextResponse.json(
        {
          error:
            "Leerlingen konden niet geladen worden.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      students: data ?? [],
    });
  } catch (error) {
    console.error("STUDENTS GET SERVER ERROR:", error);

    return NextResponse.json(
      {
        error: "Serverfout bij laden van leerlingen.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const body = (await request.json()) as StudentPayload;

    const name = cleanRequiredText(body.name);
    const grade = cleanRequiredText(body.grade);
    const educationLevel = cleanRequiredText(
      body.education_level
    );
    const parentName = cleanRequiredText(body.parent_name);
    const parentEmail = cleanText(body.parent_email);

    if (!name) {
      return NextResponse.json(
        {
          error: "Vul de naam van de leerling in.",
        },
        { status: 400 }
      );
    }

    if (!educationLevel) {
      return NextResponse.json(
        {
          error: "Kies het onderwijsniveau.",
        },
        { status: 400 }
      );
    }

    if (!grade) {
      return NextResponse.json(
        {
          error: "Vul het leerjaar in.",
        },
        { status: 400 }
      );
    }

    if (!parentName) {
      return NextResponse.json(
        {
          error:
            "Vul de naam van de ouder of voogd in.",
        },
        { status: 400 }
      );
    }

    if (
      parentEmail &&
      !isValidEmail(parentEmail)
    ) {
      return NextResponse.json(
        {
          error:
            "Vul een geldig e-mailadres voor de ouder in.",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const studentData = {
      name,
      birth_date: cleanText(body.birth_date),
      school: cleanText(body.school),
      grade,
      education_level: educationLevel,

      secondary_track:
        educationLevel === "middelbaar"
          ? cleanText(body.secondary_track)
          : null,

      finality:
        educationLevel === "middelbaar"
          ? cleanText(body.finality)
          : null,

      parent_name: parentName,
      parent_relation: cleanText(body.parent_relation),
      parent_email: parentEmail,

      diagnosis: cleanText(body.diagnosis),
      support_needs: cleanText(body.support_needs),
      goals: cleanText(body.goals),

      preferred_subjects: cleanText(
        body.preferred_subjects
      ),

      medical_info: cleanText(body.medical_info),
      doctor_name: cleanText(body.doctor_name),
      doctor_phone: cleanText(body.doctor_phone),
      notes: cleanText(body.notes),

      photo_consent: body.photo_consent === true,
      active: true,
      updated_at: now,
    };

    const { data, error } = await supabaseAdmin
      .from("students")
      .insert(studentData)
      .select("*")
      .single();

    if (error) {
      console.error("STUDENTS POST ERROR:", error);

      return NextResponse.json(
        {
          error:
            "De leerling kon niet toegevoegd worden.",
          details:
            process.env.NODE_ENV === "development"
              ? error.message
              : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        student: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("STUDENTS POST SERVER ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Serverfout bij toevoegen van de leerling.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error: "Geen leerling-id ontvangen.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("students")
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("STUDENTS DELETE ERROR:", error);

      return NextResponse.json(
        {
          error:
            "De leerling kon niet verwijderd worden.",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "De leerling werd niet gevonden.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "STUDENTS DELETE SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Serverfout bij verwijderen van de leerling.",
      },
      { status: 500 }
    );
  }
}