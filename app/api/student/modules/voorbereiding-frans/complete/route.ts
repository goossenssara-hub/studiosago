import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveCurrentStudent } from "@/lib/students/resolveCurrentStudent";
import { generateFrenchCertificatePdf } from "@/lib/certificates/generateFrenchCertificatePdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODULE_SLUG = "voorbereiding-frans-middelbaar";
const MODULE_TITLE = "Voorbereiding Frans voor het middelbaar";
const BUCKET = "student-documents";

type CompletionBody = {
  score?: unknown;
  completed?: unknown;
  completedExercises?: unknown;
  totalExercises?: unknown;
};

function asInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Je moet als leerling ingelogd zijn.",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CompletionBody;
    const score = asInteger(body.score);
    const completedExercises = asInteger(body.completedExercises);
    const totalExercises = asInteger(body.totalExercises);

    if (
      body.completed !== true ||
      score === null ||
      score < 0 ||
      score > 100 ||
      completedExercises === null ||
      totalExercises === null ||
      totalExercises < 1 ||
      completedExercises !== totalExercises
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "De module is nog niet volledig afgerond.",
        },
        { status: 400 }
      );
    }

    if (score < 75) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Voor een certificaat moet de eindscore minstens 75% zijn.",
        },
        { status: 400 }
      );
    }

    const student = await resolveCurrentStudent(user);

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Het ingelogde account kon niet aan een leerling gekoppeld worden.",
        },
        { status: 404 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existingResult } = await supabaseAdmin
      .from("student_module_results")
      .select(
        "id, score, certificate_document_id, certificate_created_at"
      )
      .eq("student_id", student.id)
      .eq("module_slug", MODULE_SLUG)
      .maybeSingle();

    const existingScore = Number(existingResult?.score ?? 0);
    const shouldCreateOrReplaceCertificate =
      !existingResult?.certificate_document_id || score > existingScore;

    if (
      existingResult?.certificate_document_id &&
      !shouldCreateOrReplaceCertificate
    ) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        score: existingScore,
        documentId: existingResult.certificate_document_id,
        message:
          "Je certificaat stond al bij je documenten.",
      });
    }

    const completedAt = new Date();
    const pdf = generateFrenchCertificatePdf({
      studentName: student.name,
      score,
      completedAt,
    });

    const filePath =
      `certificates/${student.id}/` +
      `${MODULE_SLUG}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, pdf, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(
        `Het certificaat kon niet geüpload worden: ${uploadError.message}`
      );
    }

    const { data: document, error: documentError } =
      await supabaseAdmin
        .from("student_documents")
        .upsert(
          {
            student_id: student.id,
            title:
              "Certificaat voorbereiding Frans voor het middelbaar",
            description:
              `Je behaalde ${score}% voor de voorbereiding ` +
              "Frans voor het middelbaar.",
            category: "certificaat",
            file_path: filePath,
            mime_type: "application/pdf",
            score,
            module_slug: MODULE_SLUG,
          },
          {
            onConflict: "student_id,module_slug",
          }
        )
        .select("id")
        .single();

    if (documentError || !document?.id) {
      throw new Error(
        documentError?.message ||
          "Het certificaat kon niet bij Documenten geplaatst worden."
      );
    }

    const { error: resultError } = await supabaseAdmin
      .from("student_module_results")
      .upsert(
        {
          student_id: student.id,
          module_slug: MODULE_SLUG,
          module_title: MODULE_TITLE,
          score,
          completed_at: completedAt.toISOString(),
          certificate_created_at: completedAt.toISOString(),
          certificate_document_id: document.id,
          updated_at: completedAt.toISOString(),
        },
        {
          onConflict: "student_id,module_slug",
        }
      );

    if (resultError) {
      throw new Error(
        `Het resultaat kon niet opgeslagen worden: ${resultError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      score,
      documentId: document.id,
      message:
        "Gefeliciteerd! Je certificaat staat nu bij je documenten.",
    });
  } catch (error) {
    console.error("FRENCH CERTIFICATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Het certificaat kon niet aangemaakt worden.",
      },
      { status: 500 }
    );
  }
}
