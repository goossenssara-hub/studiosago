import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateStudentEmail,
  generateStudentPassword,
} from "@/lib/students/generateStudentCredentials";

type CreateStudentBody = {
  name?: string;
  birth_date?: string | null;
  school?: string | null;
  grade?: string | null;
  education_level?: string | null;
  secondary_track?: string | null;
  finality?: string | null;
  parent_name?: string | null;
  parent_relation?: string | null;
  parent_email?: string | null;
  diagnosis?: string | null;
  support_needs?: string | null;
  goals?: string | null;
  preferred_subjects?: string | null;
  medical_info?: string | null;
  doctor_name?: string | null;
  doctor_phone?: string | null;
  notes?: string | null;
  photo_consent?: boolean | null;
};

function optionalText(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

async function generateUniqueEmail(
  supabase: ReturnType<typeof createAdminClient>,
  name: string
) {
  const baseEmail = generateStudentEmail(name);
  const [localPart, domain] = baseEmail.split("@");

  for (let index = 0; index < 100; index += 1) {
    const email =
      index === 0
        ? baseEmail
        : `${localPart}${index + 1}@${domain}`;

    const { data, error } = await supabase
      .from("students")
      .select("id")
      .eq("student_email", email)
      .maybeSingle();

    if (error) throw error;
    if (!data) return email;
  }

  throw new Error(
    "Er kon geen uniek leerling-e-mailadres worden gemaakt."
  );
}

export async function POST(request: Request) {
  const supabase = createAdminClient();

  try {
    const body = (await request.json()) as CreateStudentBody;
    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Naam van de leerling is verplicht." },
        { status: 400 }
      );
    }

    if (!String(body.education_level ?? "").trim()) {
      return NextResponse.json(
        { error: "Onderwijsniveau is verplicht." },
        { status: 400 }
      );
    }

    if (!String(body.grade ?? "").trim()) {
      return NextResponse.json(
        { error: "Leerjaar is verplicht." },
        { status: 400 }
      );
    }

    if (!String(body.parent_name ?? "").trim()) {
      return NextResponse.json(
        { error: "Naam van de ouder of voogd is verplicht." },
        { status: 400 }
      );
    }

    const studentEmail = await generateUniqueEmail(
      supabase,
      name
    );
    const temporaryPassword = generateStudentPassword();

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: studentEmail,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: "student",
        },
        app_metadata: {
          role: "student",
        },
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          error:
            authError?.message ??
            "Het leerlingaccount kon niet worden aangemaakt.",
        },
        { status: 400 }
      );
    }

    const { data: student, error: studentError } =
      await supabase
        .from("students")
        .insert({
          name,
          birth_date: optionalText(body.birth_date),
          school: optionalText(body.school),
          grade: optionalText(body.grade),
          education_level: optionalText(
            body.education_level
          ),
          secondary_track: optionalText(
            body.secondary_track
          ),
          finality: optionalText(body.finality),
          parent_name: optionalText(body.parent_name),
          parent_relation: optionalText(
            body.parent_relation
          ),
          parent_email: optionalText(body.parent_email),
          diagnosis: optionalText(body.diagnosis),
          support_needs: optionalText(
            body.support_needs
          ),
          goals: optionalText(body.goals),
          preferred_subjects: optionalText(
            body.preferred_subjects
          ),
          medical_info: optionalText(body.medical_info),
          doctor_name: optionalText(body.doctor_name),
          doctor_phone: optionalText(body.doctor_phone),
          notes: optionalText(body.notes),
          photo_consent: body.photo_consent ?? false,
          auth_user_id: authData.user.id,
          student_email: studentEmail,
        })
        .select("*")
        .single();

    if (studentError) {
      await supabase.auth.admin.deleteUser(
        authData.user.id
      );

      return NextResponse.json(
        { error: studentError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
      credentials: {
        name,
        email: studentEmail,
        password: temporaryPassword,
        loginUrl:
          "https://www.studiosago.be/leerling-login",
      },
    });
  } catch (error) {
    console.error("Create student error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Er ging iets mis bij het aanmaken van de leerling.",
      },
      { status: 500 }
    );
  }
}
