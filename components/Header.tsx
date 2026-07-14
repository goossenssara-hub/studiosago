"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AuthStatusResponse = {
  loggedIn: boolean;
  email: string | null;
  firstName: string | null;
  role: string | null;
};

export default function Header() {
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [loggedIn, setLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const checkServerSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/status", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data =
        (await response.json()) as AuthStatusResponse;

      if (!response.ok) {
        throw new Error(
          "De loginstatus kon niet worden gecontroleerd."
        );
      }

      const isLoggedIn = Boolean(data.loggedIn);

      setLoggedIn(isLoggedIn);

      setFirstName(
        isLoggedIn &&
          typeof data.firstName === "string"
          ? data.firstName.trim()
          : ""
      );
    } catch (error) {
      console.error("AUTH STATUS ERROR:", error);

      setLoggedIn(false);
      setFirstName("");
    } finally {
      setCheckedAuth(true);
    }
  }, []);

  useEffect(() => {
    void checkServerSession();

    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setMenuOpen(false);

      window.setTimeout(() => {
        void checkServerSession();
      }, 100);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkServerSession]);

  useEffect(() => {
    function refreshHeader() {
      void checkServerSession();
    }

    window.addEventListener("focus", refreshHeader);
    window.addEventListener(
      "auth-status-changed",
      refreshHeader
    );

    return () => {
      window.removeEventListener("focus", refreshHeader);
      window.removeEventListener(
        "auth-status-changed",
        refreshHeader
      );
    };
  }, [checkServerSession]);

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

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

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

      <nav
        className="nav"
        aria-label="Hoofdnavigatie"
      >
        <Link href="/" onClick={closeMenu}>
          Home
        </Link>

        <Link
          href="/#over"
          onClick={closeMenu}
        >
          Over Studio SaGo
        </Link>

        <Link
          href="/over-mij"
          onClick={closeMenu}
        >
          Over mij
        </Link>

        <Link
          href="/contact"
          onClick={closeMenu}
        >
          Contact
        </Link>

        <Link
          href="/afspraak"
          onClick={closeMenu}
        >
          Afspraak
        </Link>

        <Link
          href="/webshop"
          onClick={closeMenu}
        >
          Webshop
        </Link>
      </nav>

      {checkedAuth && !loggedIn && (
        <div className="header-login-buttons">
          <div className="login-dropdown">
            <button
              type="button"
              className="login-button"
              aria-haspopup="true"
            >
              👤 Inloggen
            </button>

            <div className="login-menu">
              <Link
                href="/leerling-login"
                onClick={closeMenu}
              >
                🎓 Leerlingportaal
              </Link>

              <Link
                href="/login"
                onClick={closeMenu}
              >
                👤 Ouderportaal
              </Link>
            </div>
          </div>
        </div>
      )}

      {checkedAuth && loggedIn && (
        <div
          className="account-menu"
          ref={menuRef}
        >
          <button
            type="button"
            className="login-button account-button"
            onClick={() =>
              setMenuOpen((open) => !open)
            }
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {firstName
              ? `👋 Welkom ${firstName}`
              : "👤 Dashboard"}
          </button>

          {menuOpen && (
            <div
              className="account-dropdown"
              role="menu"
            >
              <Link
                href="/dashboard"
                onClick={closeMenu}
                role="menuitem"
              >
                🏠 Mijn dashboard
              </Link>

              <Link
                href="/dashboard/oefenen"
                onClick={closeMenu}
                role="menuitem"
              >
                🎓 Oefenen
              </Link>

              <Link
                href="/afspraak"
                onClick={closeMenu}
                role="menuitem"
              >
                ➕ Nieuwe afspraak
              </Link>

              <Link
                href="/webshop"
                onClick={closeMenu}
                role="menuitem"
              >
                🛒 Webshop
              </Link>

              <Link
                href="/logout"
                onClick={closeMenu}
                role="menuitem"
              >
                🚪 Uitloggen
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}