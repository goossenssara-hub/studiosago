"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      if (!supabase) {
        console.error("Supabase is niet geconfigureerd.");
        router.replace("/login");
        return;
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          console.error(error);
          router.replace("/login");
          return;
        }

        router.replace("/klantendashboard");
      } catch (err) {
        console.error(err);
        router.replace("/login");
      }
    }

    handleAuth();
  }, [router]);

  return <p>Even inloggen...</p>;
}