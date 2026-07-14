import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeName(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, ".");
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Je bent niet aangemeld." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const userEmail = String(user.email ?? "")
      .trim()
      .toLowerCase();

    /*
     * 1. Normale situatie:
     * zoek de leerling via het gekoppelde Auth-user-id.
     */
    const { data: linkedStudent, error: linkedError } =
      await admin
        .from("students")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

    if (linkedError) {
      console.error(
        "STUDENT LOOKUP BY AUTH ID ERROR:",
        linkedError
      );

      return NextResponse.json(
        { error: linkedError.message },
        { status: 400 }
      );
    }

    if (linkedStudent) {
      return NextResponse.json({
        student: linkedStudent,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    }

    if (!userEmail) {
      return NextResponse.json(
        {
          error:
            "Het leerlingaccount heeft geen geldig e-mailadres.",
        },
        { status: 400 }
      );
    }

    /*
     * 2. Herstel via het opgeslagen leerling-e-mailadres.
     */
    const { data: emailMatches, error: emailError } =
      await admin
        .from("students")
        .select("*")
        .ilike("student_email", userEmail);

    if (emailError) {
      console.error(
        "STUDENT LOOKUP BY EMAIL ERROR:",
        emailError
      );

      return NextResponse.json(
        { error: emailError.message },
        { status: 400 }
      );
    }

    if ((emailMatches ?? []).length === 1) {
      const matchedStudent = emailMatches![0];

      const { data: repairedStudent, error: repairError } =
        await admin
          .from("students")
          .update({
            auth_user_id: user.id,
            student_email: userEmail,
          })
          .eq("id", matchedStudent.id)
          .select("*")
          .single();

      if (repairError) {
        console.error(
          "STUDENT EMAIL LINK REPAIR ERROR:",
          repairError
        );

        return NextResponse.json(
          { error: repairError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        student: repairedStudent,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    }

    /*
     * 3. Oude of nog niet gekoppelde accounts:
     * vergelijk het deel vóór @ met de genormaliseerde
     * volledige naam van niet-gekoppelde leerlingen.
     */
    const localPart = userEmail.split("@")[0];

    const { data: students, error: studentsError } =
      await admin
        .from("students")
        .select("*");

    if (studentsError) {
      console.error(
        "STUDENT FALLBACK LOOKUP ERROR:",
        studentsError
      );

      return NextResponse.json(
        { error: studentsError.message },
        { status: 400 }
      );
    }

    const nameMatches = (students ?? []).filter(
      (student) =>
        normalizeName(student.name) === localPart
    );

    if (nameMatches.length === 1) {
      const matchedStudent = nameMatches[0];

      if (
        matchedStudent.auth_user_id &&
        matchedStudent.auth_user_id !== user.id
      ) {
        return NextResponse.json(
          {
            error:
              "Deze leerling is al aan een ander account gekoppeld.",
          },
          { status: 409 }
        );
      }

      const { data: repairedStudent, error: repairError } =
        await admin
          .from("students")
          .update({
            auth_user_id: user.id,
            student_email: userEmail,
          })
          .eq("id", matchedStudent.id)
          .select("*")
          .single();

      if (repairError) {
        console.error(
          "STUDENT NAME LINK REPAIR ERROR:",
          repairError
        );

        return NextResponse.json(
          { error: repairError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        student: repairedStudent,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    }

    if (nameMatches.length > 1) {
      return NextResponse.json(
        {
          error:
            "Er zijn meerdere leerlingen met dezelfde gebruikersnaam. Koppel het account opnieuw via Admin.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Het account bestaat in Supabase Auth, maar er werd geen overeenkomende leerling gevonden in de tabel students.",
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("STUDENT ME ROUTE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De leerlinggegevens konden niet geladen worden.",
      },
      { status: 500 }
    );
  }
}
