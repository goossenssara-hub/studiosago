import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function safeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json(
        { success: false, error: "Je bent niet aangemeld." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const bookingId = clean(formData.get("bookingId"));
    const file = formData.get("file");

    if (!bookingId || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Afspraak of bestand ontbreekt." },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Een bestand mag maximaal 10 MB groot zijn." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: "Dit bestandstype is niet toegestaan." },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdmin();
    const customerEmail = clean(user.email).toLowerCase();

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, customer_email")
      .eq("id", bookingId)
      .ilike("customer_email", customerEmail)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: "De afspraak werd niet gevonden." },
        { status: 404 },
      );
    }

    const filename = safeName(file.name) || "bestand";
    const storagePath = `${bookingId}/${crypto.randomUUID()}-${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from("appointment-files")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { error: insertError } = await admin
      .from("appointment_files")
      .insert({
        booking_id: bookingId,
        uploaded_by: user.id,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
      });

    if (insertError) {
      await admin.storage.from("appointment-files").remove([storagePath]);
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("APPOINTMENT FILE UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Het bestand kon niet worden toegevoegd.",
      },
      { status: 500 },
    );
  }
}
