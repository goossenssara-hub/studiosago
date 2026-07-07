"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AuthNavButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setLoggedIn(!!session);
      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Link
      href={loggedIn ? "/dashboard" : "/login"}
      className="login-button"
    >
      {loggedIn ? "👤 Dashboard" : "👤 Inloggen"}
    </Link>
  );
}