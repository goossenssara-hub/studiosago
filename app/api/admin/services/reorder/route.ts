import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ReorderItem = { id: string; sort_order: number };

type ReorderBody = {
  category?: string;
  items?: ReorderItem[];
};

export async function PATCH(request: NextRequest) {
  const adminSession = await requireAdmin();
  if (!adminSession.ok) return adminSession.response;

  const body = (await request.json()) as ReorderBody;
  const category = String(body.category ?? "").trim();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!category || items.length === 0) {
    return NextResponse.json(
      { error: "Categorie of nieuwe volgorde ontbreekt." },
      { status: 400 }
    );
  }

  const normalized = items
    .map((item, index) => ({
      id: String(item.id ?? "").trim(),
      sort_order: Number.isFinite(Number(item.sort_order))
        ? Number(item.sort_order)
        : index,
    }))
    .filter((item) => item.id);

  try {
    const supabase = createAdminClient();

    const results = await Promise.all(
      normalized.map((item) =>
        supabase
          .from("services")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id)
          .eq("category", category)
      )
    );

    const failed = results.find((result) => result.error);
    if (failed?.error) {
      return NextResponse.json(
        { error: `Volgorde opslaan is mislukt: ${failed.error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De nieuwe volgorde kon niet worden opgeslagen.",
      },
      { status: 500 }
    );
  }
}
