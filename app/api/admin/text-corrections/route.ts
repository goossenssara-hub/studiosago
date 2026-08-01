import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-services";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminSession = await requireAdmin();
  if (!adminSession.ok) return adminSession.response;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("webshop_text_correction_orders")
    .select("id,checkout_id,mollie_payment_id,payment_status,customer_first_name,customer_last_name,customer_email,customer_phone,original_file_name,mime_type,word_count,total_amount,text_type,notes,created_at,paid_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: `Tekstcorrectie-aanvragen laden is mislukt: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ requests: data ?? [] });
}
