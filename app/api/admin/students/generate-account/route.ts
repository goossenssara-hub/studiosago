import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateStudentEmail,
  generateStudentPassword,
} from "@/lib/students/generateStudentCredentials";

type Body = {
  studentId?: string;
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
    const body = (await request.json()) as Body;
    const studentId = String(body.studentId ?? "").trim();

    if (!studentId) {
      return NextResponse.json(
        { error: "Leerling-ID ontbreekt." },
        { status: 400 }
      );
    }

    const { data: student, error: findError } =
      await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: findError.message },
        { status: 400 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { error: "De leerling werd niet gevonden." },
        { status: 404 }
      );
    }

    if (student.auth_user_id || student.student_email) {
      return NextResponse.json(
        {
          error:
            "Voor deze leerling bestaat al een leerlingaccount.",
        },
        { status: 409 }
      );
    }

    const email = await generateUniqueEmail(
      supabase,
      student.name
    );
    const password = generateStudentPassword();

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: student.name,
          role: "student",
          student_id: student.id,
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

    const { data: updatedStudent, error: updateError } =
      await supabase
        .from("students")
        .update({
          auth_user_id: authData.user.id,
          student_email: email,
        })
        .eq("id", student.id)
        .select("*")
        .single();

    if (updateError) {
      await supabase.auth.admin.deleteUser(
        authData.user.id
      );

      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      student: updatedStudent,
      credentials: {
        name: student.name,
        email,
        password,
        loginUrl:
          "https://www.studiosago.be/leerling-login",
      },
    });
  } catch (error) {
    console.error("Generate student account error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Het leerlingaccount kon niet gegenereerd worden.",
      },
      { status: 500 }
    );
  }
}
