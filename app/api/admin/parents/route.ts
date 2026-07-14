import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StudentRow = {
  id: string;
  name: string;
  parent_email: string | null;
  parent_name: string | null;
  school: string | null;
  grade: string | null;
  education_level: string | null;
  photo_consent: boolean | null;
};

type ParentGroup = {
  email: string;
  name: string;
  students: StudentRow[];
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function isValidEmail(value: unknown): boolean {
  const email = normalizeEmail(value);

  if (!email) return false;

  if (
    email.includes("vul_hier_het_oudermailadres_in") ||
    email.includes("vul-hier-het-oudermailadres-in") ||
    email === "null" ||
    email === "undefined"
  ) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("students")
      .select(
        `
          id,
          name,
          parent_email,
          parent_name,
          school,
          grade,
          education_level,
          photo_consent
        `
      )
      .order("name", {
        ascending: true,
      });

    if (error) {
      return NextResponse.json(
        {
          error:
            error.message ||
            "Leerlingen konden niet geladen worden.",
        },
        { status: 500 }
      );
    }

    const students = (data ?? []) as StudentRow[];

    const linkedStudents = students.filter((student) =>
      isValidEmail(student.parent_email)
    );

    const unlinkedStudents = students.filter(
      (student) => !isValidEmail(student.parent_email)
    );

    const groupedParents = linkedStudents.reduce<
      Record<string, ParentGroup>
    >((groups, student) => {
      const email = normalizeEmail(
        student.parent_email
      );

      const parentName =
        clean(student.parent_name) ||
        "Naam ouder niet ingevuld";

      if (!groups[email]) {
        groups[email] = {
          email,
          name: parentName,
          students: [],
        };
      }

      if (
        groups[email].name ===
          "Naam ouder niet ingevuld" &&
        parentName !== "Naam ouder niet ingevuld"
      ) {
        groups[email].name = parentName;
      }

      groups[email].students.push({
        ...student,
        parent_email: email,
      });

      return groups;
    }, {});

    const parents = Object.values(
      groupedParents
    ).sort((left, right) => {
      const leftValue =
        left.name === "Naam ouder niet ingevuld"
          ? left.email
          : left.name;

      const rightValue =
        right.name === "Naam ouder niet ingevuld"
          ? right.email
          : right.name;

      return leftValue.localeCompare(
        rightValue,
        "nl-BE"
      );
    });

    return NextResponse.json({
      parents,
      unlinkedStudents,
    });
  } catch (error) {
    console.error(
      "LOAD PARENTS SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ouders konden niet geladen worden.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const action = clean(body.action);
    const supabaseAdmin = getSupabaseAdmin();

    if (action === "renameParent") {
      const email = normalizeEmail(body.email);
      const name = clean(body.name);

      if (!isValidEmail(email)) {
        return NextResponse.json(
          {
            error:
              "Het e-mailadres van de ouder is ongeldig.",
          },
          { status: 400 }
        );
      }

      if (!name) {
        return NextResponse.json(
          {
            error:
              "Vul de voornaam en naam van de ouder in.",
          },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("students")
        .update({
          parent_name: name,
          updated_at: new Date().toISOString(),
        })
        .ilike("parent_email", email);

      if (error) {
        return NextResponse.json(
          {
            error:
              error.message ||
              "De oudernaam kon niet aangepast worden.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        name,
        email,
      });
    }

    if (action === "assignStudent") {
      const studentId = clean(body.studentId);
      const parentEmail = normalizeEmail(
        body.parentEmail
      );
      const parentName = clean(body.parentName);

      if (!studentId) {
        return NextResponse.json(
          {
            error: "Geen leerling ontvangen.",
          },
          { status: 400 }
        );
      }

      if (!isValidEmail(parentEmail)) {
        return NextResponse.json(
          {
            error:
              "Vul een geldig e-mailadres van de ouder in.",
          },
          { status: 400 }
        );
      }

      if (!parentName) {
        return NextResponse.json(
          {
            error:
              "Vul de voornaam en naam van de ouder in.",
          },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("students")
        .update({
          parent_email: parentEmail,
          parent_name: parentName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", studentId);

      if (error) {
        return NextResponse.json(
          {
            error:
              error.message ||
              "De leerling kon niet gekoppeld worden.",
          },
          { status: 500 }
        );
      }

      /*
       * Zorg dat andere leerlingen met hetzelfde
       * ouderadres dezelfde oudernaam krijgen.
       */
      await supabaseAdmin
        .from("students")
        .update({
          parent_name: parentName,
          updated_at: new Date().toISOString(),
        })
        .ilike("parent_email", parentEmail);

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      {
        error: "Onbekende bewerking.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "UPDATE PARENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De gegevens konden niet opgeslagen worden.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const email = normalizeEmail(
      request.nextUrl.searchParams.get("email")
    );

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error:
            "Geen geldig ouder-e-mailadres ontvangen.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("students")
      .update({
        parent_email: null,
        parent_name: null,
        updated_at: new Date().toISOString(),
      })
      .ilike("parent_email", email);

    if (error) {
      return NextResponse.json(
        {
          error:
            error.message ||
            "De leerlingen konden niet ontkoppeld worden.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedEmail: email,
    });
  } catch (error) {
    console.error(
      "DELETE PARENT SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ouder kon niet verwijderd worden.",
      },
      { status: 500 }
    );
  }
}