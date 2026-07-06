"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoggedIn(false);
      return;
    }

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setLoggedIn(Boolean(session));
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
      setMenuOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setLoggedIn(false);
    setMenuOpen(false);

    router.push("/");
    router.refresh();
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <Link
        href="/"
        aria-label="Studio SaGo home"
        onClick={closeMenu}
      >
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
        <Link href="/" onClick={closeMenu}>
          Home
        </Link>

        <Link href="/#over" onClick={closeMenu}>
          Over Studio SaGo
        </Link>

        <Link href="/over-mij" onClick={closeMenu}>
          Over mij
        </Link>

        <Link href="/contact" onClick={closeMenu}>
          Contact
        </Link>

        <Link href="/afspraak" onClick={closeMenu}>
          Afspraak
        </Link>

        <Link href="/webshop" onClick={closeMenu}>
          Webshop
        </Link>
      </nav>

      {!loggedIn ? (
        <Link className="login-button" href="/login">
          👤 Inloggen
        </Link>
      ) : (
        <div className="account-menu" ref={menuRef}>
          <button
            type="button"
            className="login-button account-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            👤 Mijn account
          </button>

          {menuOpen && (
            <div className="account-dropdown" role="menu">
              <Link
                href="/klantendashboard"
                onClick={closeMenu}
              >
                🏠 Mijn dashboard
              </Link>

              <Link
                href="/klantendashboard"
                onClick={closeMenu}
              >
                📅 Mijn afspraken
              </Link>

              <Link
                href="/afspraak"
                onClick={closeMenu}
              >
                ➕ Nieuwe afspraak
              </Link>

              <button
                type="button"
                onClick={handleLogout}
              >
                🚪 Uitloggen
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}