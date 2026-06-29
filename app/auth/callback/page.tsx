"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      // Verwerkt de access token uit de URL
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error(error);
        router.replace("/login");
        return;
      }

      router.replace("/klantdashboard");
    }

    handleAuth();
  }, [router]);

  return <p>Even inloggen...</p>;
}