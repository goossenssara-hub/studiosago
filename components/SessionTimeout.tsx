"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TIMEOUT = 20 * 60 * 1000;

export default function SessionTimeout() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function logoutAfterTimeout() {
      await supabase.auth.signOut();
      router.replace("/login?message=Sessie verlopen. Meld je opnieuw aan.");
    }

    function resetTimer() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(logoutAfterTimeout, TIMEOUT);
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [router]);

  return null;
}