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
  parent_email?: string;
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

    if (error) {
      throw error;
    }

    if (!data) {
      return email;
    }
  }

  throw new Error("Er kon geen uniek leerling-e-mailadres worden gemaakt.");
}

export async function POST(request: Request) {
  const supabase = createAdminClient();

  try {
    const body = (await request.json()) as CreateStudentBody;
    const name = String(body.name ?? "").trim();
    const parentEmail = String(body.parent_email ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Naam van de leerling is verplicht." },
        { status: 400 }
      );
    }

    if (!parentEmail) {
      return NextResponse.json(
        { error: "E-mailadres van de ouder is verplicht." },
        { status: 400 }
      );
    }

    const studentEmail = await generateUniqueEmail(supabase, name);
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

    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        name,
        birth_date: body.birth_date || null,
        school: body.school || null,
        grade: body.grade || null,
        education_level: body.education_level || null,
        secondary_track: body.secondary_track || null,
        finality: body.finality || null,
        parent_email: parentEmail,
        diagnosis: body.diagnosis || null,
        support_needs: body.support_needs || null,
        goals: body.goals || null,
        preferred_subjects: body.preferred_subjects || null,
        medical_info: body.medical_info || null,
        doctor_name: body.doctor_name || null,
        doctor_phone: body.doctor_phone || null,
        notes: body.notes || null,
        photo_consent: body.photo_consent ?? false,
        auth_user_id: authData.user.id,
        student_email: studentEmail,
      })
      .select("*")
      .single();

    if (studentError) {
      await supabase.auth.admin.deleteUser(authData.user.id);

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
        loginUrl: "https://www.studiosago.be/leerling-login",
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
