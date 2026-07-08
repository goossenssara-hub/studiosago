"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      const supabase = createClient();
      await supabase.auth.signOut();

      router.replace("/login");
      router.refresh();
    }

    handleLogout();
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