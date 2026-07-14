import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFirstName(
  value: string | null | undefined
) {
  if (!value) return null;

  const firstName =
    value.trim().split(/\s+/)[0] ?? "";

  return firstName || null;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        loggedIn: false,
        email: null,
        firstName: null,
        role: null,
      });
    }

    const {
      data: student,
      error: studentError,
    } = await supabase
      .from("students")
      .select("name")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (studentError) {
      console.error(
        "STUDENT PROFILE ERROR:",
        studentError
      );
    }

    if (student?.name) {
      return NextResponse.json({
        loggedIn: true,
        email: user.email ?? null,
        firstName: getFirstName(student.name),
        role: "student",
      });
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "CUSTOMER PROFILE ERROR:",
        profileError
      );
    }

    const metadataName =
      user.user_metadata?.first_name ??
      user.user_metadata?.given_name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name;

    const firstName =
      getFirstName(profile?.full_name) ??
      getFirstName(
        typeof metadataName === "string"
          ? metadataName
          : null
      );

    return NextResponse.json({
      loggedIn: true,
      email: user.email ?? null,
      firstName,
      role: "customer",
    });
  } catch (error) {
    console.error("AUTH STATUS ERROR:", error);

    return NextResponse.json(
      {
        loggedIn: false,
        email: null,
        firstName: null,
        role: null,
      },
      {
        status: 500,
      }
    );
  }
}