import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Geen e-mailadres ontvangen." },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("customer_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      console.error("CUSTOMER PROFILE GET ERROR:", profileError);

      return NextResponse.json(
        { error: "Profiel kon niet geladen worden." },
        { status: 500 }
      );
    }

    const { data: students, error: studentsError } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("parent_email", email)
      .eq("active", true)
      .order("name", { ascending: true });

    if (studentsError) {
      console.error("CUSTOMER STUDENTS GET ERROR:", studentsError);

      return NextResponse.json(
        { error: "Leerlingen konden niet geladen worden." },
        { status: 500 }
      );
    }

    const firstName =
      profile?.first_name || profile?.parent1_first_name || "";

    const lastName =
      profile?.last_name || profile?.parent1_last_name || "";

    const fullName =
      profile?.full_name ||
      `${firstName} ${lastName}`.trim() ||
      profile?.parent_name ||
      "";

    return NextResponse.json({
      profile: profile
        ? {
            ...profile,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
          }
        : null,
      students: students ?? [],
      profileCompleted: !!profile?.profile_completed,
    });
  } catch (error) {
    console.error("CUSTOMER PROFILE GET SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij laden van profiel." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();

    const {
      email,
      profilePhotoUrl,

      parent1FirstName,
      parent1LastName,
      parent1Phone,

      parent2FirstName,
      parent2LastName,
      parent2Phone,
      parent2Email,

      address,
      postcode,
      city,

      emergencyContact,
      preferredFormat,
      availabilityNotes,
      notes,

      privacyConsent,
      photoConsent,

      students,
    } = body;

    if (
      !email ||
      !parent1FirstName ||
      !parent1LastName ||
      !parent1Phone ||
      !address ||
      !postcode ||
      !city ||
      !privacyConsent
    ) {
      return NextResponse.json(
        { error: "Vul alle verplichte gegevens in en geef GDPR-toestemming." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { error: profileError } = await supabaseAdmin
      .from("customer_profiles")
      .upsert(
        {
          email,
          profile_photo_url: profilePhotoUrl || null,

          first_name: parent1FirstName,
          last_name: parent1LastName,
          full_name: `${parent1FirstName} ${parent1LastName}`.trim(),
          parent_name: `${parent1FirstName} ${parent1LastName}`.trim(),

          parent1_first_name: parent1FirstName,
          parent1_last_name: parent1LastName,
          parent1_phone: parent1Phone,

          parent2_first_name: parent2FirstName || null,
          parent2_last_name: parent2LastName || null,
          parent2_phone: parent2Phone || null,
          parent2_email: parent2Email || null,

          phone: parent1Phone,
          address,
          postcode,
          city,

          emergency_contact: emergencyContact || null,
          preferred_format: preferredFormat || null,
          availability_notes: availabilityNotes || null,
          notes: notes || null,

          privacy_consent: true,
          privacy_consent_at: now,
          photo_consent: !!photoConsent,
          photo_consent_at: photoConsent ? now : null,

          profile_completed: true,
          updated_at: now,
        },
        { onConflict: "email" }
      );

    if (profileError) {
      console.error("CUSTOMER PROFILE POST ERROR:", profileError);

      return NextResponse.json(
        { error: "Profiel kon niet opgeslagen worden." },
        { status: 500 }
      );
    }

    if (Array.isArray(students)) {
      const { error: deleteStudentsError } = await supabaseAdmin
        .from("students")
        .delete()
        .eq("parent_email", email);

      if (deleteStudentsError) {
        console.error("CUSTOMER STUDENTS DELETE ERROR:", deleteStudentsError);

        return NextResponse.json(
          { error: "Oude leerlinggegevens konden niet vervangen worden." },
          { status: 500 }
        );
      }

      const cleanStudents = students
        .filter((student) => student.name?.trim())
        .map((student) => ({
          parent_email: email,
          name: student.name.trim(),
          birth_date: student.birthDate || null,
          school: student.school || null,
          grade: student.grade || null,
          education_level: student.educationLevel || null,
          secondary_track: student.secondaryTrack || null,
          finality: student.finality || null,
          preferred_subjects: student.preferredSubjects || null,
          diagnosis: student.diagnosis || null,
          support_needs: student.supportNeeds || null,
          goals: student.goals || null,
          medical_info: student.medicalInfo || null,
          doctor_name: student.doctorName || null,
          doctor_phone: student.doctorPhone || null,
          photo_consent: !!student.photoConsent,
          photo_consent_at: student.photoConsent ? now : null,
          notes: student.notes || null,
          active: true,
          updated_at: now,
        }));

      if (cleanStudents.length > 0) {
        const { error: studentError } = await supabaseAdmin
          .from("students")
          .insert(cleanStudents);

        if (studentError) {
          console.error("CUSTOMER STUDENTS INSERT ERROR:", studentError);

          return NextResponse.json(
            { error: "Leerlinggegevens konden niet opgeslagen worden." },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CUSTOMER PROFILE POST SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij opslaan van profiel." },
      { status: 500 }
    );
  }
}