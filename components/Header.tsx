"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  async function checkServerSession() {
    try {
      const response = await fetch("/api/auth/status", {
        cache: "no-store",
      });

      const data = await response.json();
      setLoggedIn(Boolean(data.loggedIn));
    } catch (error) {
      console.error("AUTH STATUS ERROR:", error);
      setLoggedIn(false);
    } finally {
      setCheckedAuth(true);
    }
  }

  useEffect(() => {
    checkServerSession();

    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkServerSession();
      setMenuOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <Link href="/" aria-label="Studio SaGo home" onClick={closeMenu}>
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

      {checkedAuth && !loggedIn && (
        <div className="header-login-buttons">
          <Link
            className="student-login-button"
            href="/leerling-login"
            onClick={closeMenu}
          >
            🎓 Leerlingportaal
          </Link>

          <Link className="login-button" href="/login" onClick={closeMenu}>
            👤 Ouderportaal
          </Link>
        </div>
      )}

      {checkedAuth && loggedIn && (
        <div className="account-menu" ref={menuRef}>
          <button
            type="button"
            className="login-button account-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            👤 Dashboard
          </button>

          {menuOpen && (
            <div className="account-dropdown" role="menu">
              <Link href="/dashboard" onClick={closeMenu}>
                🏠 Mijn dashboard
              </Link>

              <Link href="/dashboard/oefenen" onClick={closeMenu}>
                🎓 Oefenen
              </Link>

              <Link href="/afspraak" onClick={closeMenu}>
                ➕ Nieuwe afspraak
              </Link>

              <Link href="/webshop" onClick={closeMenu}>
                🛒 Webshop
              </Link>

              <Link href="/logout" onClick={closeMenu}>
                🚪 Uitloggen
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}