"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      const supabase = createClient();

      await supabase.auth.signOut();

      router.push("/login");
      router.refresh();
    }

    logout();
  }, [router]);

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Uitloggen...</h1>
        <p>Je wordt afgemeld.</p>
      </div>
    </main>
  );
}