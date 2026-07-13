"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function handleLogout() {
      const supabase = createClient();

      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Fout bij uitloggen:", error);
      }

      // Heel korte vertraging zodat de gebruiker de melding ziet
      setTimeout(() => {
        if (!isMounted) return;

        router.replace("/");
        router.refresh();
      }, 500);
    }

    handleLogout();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Uitloggen...</h1>
        <p>Je wordt afgemeld en doorgestuurd naar de homepagina.</p>
      </div>
    </main>
  );
}