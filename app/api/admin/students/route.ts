import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type CreateStudentBody = {
  name?: string;
  birth_date?: string;
  school?: string;
  grade?: string;
  education_level?: string;
  secondary_track?: string;
  finality?: string;
  parent_name?: string;
  parent_relation?: string;
  parent_email?: string;
  diagnosis?: string;
  support_needs?: string;
  goals?: string;
  preferred_subjects?: string;
  medical_info?: string;
  doctor_name?: string;
  doctor_phone?: string;
  notes?: string;
};

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

/**
 * Alle leerlingen ophalen.
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: students, error } = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase load students error:", error);

      return NextResponse.json(
        {
          error: `Leerlingen konden niet geladen worden: ${error.message}`,
          details: error.details ?? null,
          hint: error.hint ?? null,
          code: error.code ?? null,
        },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      {
        students: students ?? [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Load students exception:", error);

    return NextResponse.json(
      {
        error: getErrorMessage(
          error,
          "Leerlingen konden niet geladen worden."
        ),
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

/**
 * Nieuwe leerling toevoegen.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    let body: CreateStudentBody;

    try {
      body = (await request.json()) as CreateStudentBody;
    } catch {
      return NextResponse.json(
        {
          error: "De verzonden gegevens zijn ongeldig.",
        },
        { status: 400 }
      );
    }

    const name = cleanText(body.name);
    const grade = cleanText(body.grade);
    const educationLevel = cleanText(
      body.education_level
    );
    const parentName = cleanText(body.parent_name);

    if (!name) {
      return NextResponse.json(
        {
          error: "De naam van de leerling is verplicht.",
        },
        { status: 400 }
      );
    }

    if (!grade) {
      return NextResponse.json(
        {
          error: "Het leerjaar is verplicht.",
        },
        { status: 400 }
      );
    }

    if (!educationLevel) {
      return NextResponse.json(
        {
          error: "Het onderwijsniveau is verplicht.",
        },
        { status: 400 }
      );
    }

    if (!parentName) {
      return NextResponse.json(
        {
          error:
            "De naam van de ouder of voogd is verplicht.",
        },
        { status: 400 }
      );
    }

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
      parent_relation: cleanText(
        body.parent_relation
      ),
      parent_email: cleanText(body.parent_email),

      diagnosis: cleanText(body.diagnosis),
      support_needs: cleanText(
        body.support_needs
      ),
      goals: cleanText(body.goals),
      preferred_subjects: cleanText(
        body.preferred_subjects
      ),

      medical_info: cleanText(body.medical_info),
      doctor_name: cleanText(body.doctor_name),
      doctor_phone: cleanText(body.doctor_phone),
      notes: cleanText(body.notes),
    };

    const { data: student, error } = await supabase
      .from("students")
      .insert(studentData)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase create student error:", error);

      return NextResponse.json(
        {
          error: `De leerling kon niet toegevoegd worden: ${error.message}`,
          details: error.details ?? null,
          hint: error.hint ?? null,
          code: error.code ?? null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        student,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create student exception:", error);

    return NextResponse.json(
      {
        error: getErrorMessage(
          error,
          "De leerling kon niet toegevoegd worden."
        ),
      },
      { status: 500 }
    );
  }
}

/**
 * Leerling en eventueel gekoppeld Auth-account verwijderen.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    const studentId =
      request.nextUrl.searchParams.get("id");

    if (!studentId) {
      return NextResponse.json(
        {
          error: "Leerling-ID ontbreekt.",
        },
        { status: 400 }
      );
    }

    const { data: student, error: findError } =
      await supabase
        .from("students")
        .select("id, auth_user_id")
        .eq("id", studentId)
        .maybeSingle();

    if (findError) {
      console.error(
        "Supabase find student error:",
        findError
      );

      return NextResponse.json(
        {
          error: findError.message,
        },
        { status: 400 }
      );
    }

    if (!student) {
      return NextResponse.json(
        {
          error: "De leerling werd niet gevonden.",
        },
        { status: 404 }
      );
    }

    /*
     * Eerst de leerlingrecord verwijderen.
     */
    const { error: deleteError } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (deleteError) {
      console.error(
        "Supabase delete student error:",
        deleteError
      );

      return NextResponse.json(
        {
          error: deleteError.message,
        },
        { status: 400 }
      );
    }

    /*
     * Daarna het gekoppelde leerlingaccount verwijderen.
     * Een fout hier verhindert niet dat de leerlingrecord
     * succesvol verwijderd is.
     */
    if (student.auth_user_id) {
      const { error: authError } =
        await supabase.auth.admin.deleteUser(
          student.auth_user_id
        );

      if (authError) {
        console.error(
          "Auth-account kon niet verwijderd worden:",
          authError
        );
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete student exception:", error);

    return NextResponse.json(
      {
        error: getErrorMessage(
          error,
          "De leerling kon niet verwijderd worden."
        ),
      },
      { status: 500 }
    );
  }
}