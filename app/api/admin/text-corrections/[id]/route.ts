import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const adminSession = await requireAdmin();

  if (!adminSession.ok) {
    return adminSession.response;
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "De aanvraag-id ontbreekt." },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    const { data: requestRow, error: findError } = await supabase
      .from("webshop_text_correction_orders")
      .select("id, storage_path, original_file_name")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      console.error("TEXT CORRECTION DELETE FIND ERROR:", findError);

      return NextResponse.json(
        { error: "De aanvraag kon niet worden opgezocht." },
        { status: 500 }
      );
    }

    if (!requestRow) {
      return NextResponse.json(
        { error: "De tekstcorrectie-aanvraag werd niet gevonden." },
        { status: 404 }
      );
    }

    const storagePath = String(requestRow.storage_path ?? "").trim();

    /*
     * Eerst het privébestand verwijderen. Wanneer dit mislukt, blijft
     * de databaserij behouden zodat je geen verweesd bestand verliest.
     */
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("webshop-text-uploads")
        .remove([storagePath]);

      if (storageError) {
        console.error("TEXT CORRECTION STORAGE DELETE ERROR:", storageError);

        return NextResponse.json(
          {
            error:
              "Het document kon niet uit de beveiligde opslag worden verwijderd. De aanvraag werd daarom behouden.",
          },
          { status: 500 }
        );
      }
    }

    const { error: deleteError } = await supabase
      .from("webshop_text_correction_orders")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("TEXT CORRECTION DELETE ERROR:", deleteError);

      return NextResponse.json(
        {
          error:
            "Het document werd uit de opslag verwijderd, maar de aanvraag kon niet uit de lijst worden verwijderd.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
      deletedFileName:
        String(requestRow.original_file_name ?? "").trim() || null,
    });
  } catch (error) {
    console.error("TEXT CORRECTION DELETE SERVER ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De aanvraag kon niet worden verwijderd.",
      },
      { status: 500 }
    );
  }
}
