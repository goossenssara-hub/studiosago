"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setLoggedIn(!!session);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
      setMenuOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    setLoggedIn(false);
    setMenuOpen(false);

    router.push("/");
    router.refresh();
  }

  return (
    <header className="site-header">
      <Link href="/" aria-label="Studio SaGo home">
        <Image
          className="logo"
          src="/assets/logo-studio-sago.svg"
          alt="Studio SaGo"
          width={245}
          height={115}
          priority
        />
      </Link>

      <nav className="nav" aria-label="Hoofdnavigatie">
        <Link href="/">Home</Link>
        <Link href="/#over">Over Studio SaGo</Link>
        <Link href="/over-mij">Over mij</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/webshop">Webshop</Link>
      </nav>

      {!loggedIn ? (
        <Link className="login-button" href="/login">
          👤 Inloggen
        </Link>
      ) : (
        <div className="account-menu">
          <button
            type="button"
            className="login-button account-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            👤 Mijn account
          </button>

          {menuOpen && (
            <div className="account-dropdown">
              <Link
                href="/klantendashboard"
                onClick={() => setMenuOpen(false)}
              >
                🏠 Mijn dashboard
              </Link>

              <Link
                href="/klantendashboard"
                onClick={() => setMenuOpen(false)}
              >
                📅 Mijn afspraken
              </Link>

              <Link
                href="/boek-nu"
                onClick={() => setMenuOpen(false)}
              >
                ➕ Nieuwe afspraak
              </Link>

              <button type="button" onClick={handleLogout}>
                🚪 Uitloggen
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}