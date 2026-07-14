import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ResolveLoginBody = {
  identifier?: string;
};

function normalizeIdentifier(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export async function POST(request: Request) {
  const supabase = createAdminClient();

  try {
    const body = (await request.json()) as ResolveLoginBody;
    const identifier = normalizeIdentifier(body.identifier);

    if (!identifier) {
      return NextResponse.json(
        { error: "Gebruikersnaam ontbreekt." },
        { status: 400 }
      );
    }

    if (identifier.includes("@")) {
      const { data: student, error } = await supabase
        .from("students")
        .select("student_email")
        .ilike("student_email", identifier)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      if (!student?.student_email) {
        return NextResponse.json(
          { error: "Deze gebruikersnaam bestaat niet." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        email: student.student_email,
      });
    }

    const { data: students, error } = await supabase
      .from("students")
      .select("student_email")
      .not("student_email", "is", null);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const matches = (students ?? []).filter((student) => {
      const email = String(
        student.student_email ?? ""
      ).toLowerCase();

      const localPart = email.split("@")[0];

      return localPart === identifier;
    });

    if (matches.length === 0) {
      return NextResponse.json(
        { error: "Deze gebruikersnaam bestaat niet." },
        { status: 404 }
      );
    }

    if (matches.length > 1) {
      return NextResponse.json(
        {
          error:
            "Gebruik je volledige leerling-e-mailadres om aan te melden.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      email: matches[0].student_email,
    });
  } catch (error) {
    console.error("Resolve student login error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De gebruikersnaam kon niet gecontroleerd worden.",
      },
      { status: 500 }
    );
  }
}
