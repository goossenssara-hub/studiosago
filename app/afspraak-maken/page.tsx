import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import AfspraakMakenClient from "@/components/AfspraakMakenClient";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type Props = {
  searchParams: Promise<{ passId?: string }>;
};

export default async function AfspraakMakenPage({ searchParams }: Props) {
  const params = await searchParams;
  const passId = params.passId;

  if (!passId) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const email = user.email.trim().toLowerCase();
  const supabaseAdmin = getSupabaseAdmin();

  const { data: pass } = await supabaseAdmin
    .from("passes")
    .select("*")
    .eq("id", passId)
    .eq("customer_email", email)
    .eq("status", "active")
    .maybeSingle();

  if (!pass) {
    redirect("/dashboard");
  }

  return (
    <PageShell>
      <AfspraakMakenClient pass={pass} email={email} />
    </PageShell>
  );
}