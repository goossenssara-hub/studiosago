import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const adminSession = await requireAdmin();
  if (!adminSession.ok) return adminSession.response;

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("webshop_text_correction_orders")
    .select("storage_path,original_file_name,mime_type")
    .eq("id", id)
    .single();

  if (error || !order?.storage_path) {
    return NextResponse.json(
      { error: "Het geüploade document werd niet gevonden." },
      { status: 404 }
    );
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from("webshop-text-uploads")
    .download(order.storage_path);

  if (downloadError || !file) {
    return NextResponse.json(
      { error: "Het document kon niet uit de beveiligde opslag worden opgehaald." },
      { status: 500 }
    );
  }

  const bytes = await file.arrayBuffer();
  const safeName = String(order.original_file_name || "document")
    .replace(/[\r\n"]/g, "-");

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": order.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
