import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type ResolvedStudent = {
  id: string;
  name: string;
  parent_email: string | null;
};

export async function resolveCurrentStudent(
  user: User
): Promise<ResolvedStudent | null> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: student, error } = await supabaseAdmin
    .from("students")
    .select("id, name, parent_email, auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `De ingelogde leerling kon niet geladen worden: ${error.message}`
    );
  }

  if (!student) {
    return null;
  }

  return {
    id: student.id,
    name: student.name?.trim() || "Leerling",
    parent_email: student.parent_email?.trim().toLowerCase() || null,
  };
}
