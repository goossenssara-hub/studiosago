import Image from "next/image";
import Link from "next/link";

export default function Header() {
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

        <Link href="/#over">
          Over Studio SaGo
        </Link>

        <Link href="/over-mij">
          Over mij
        </Link>

        <Link href="/contact">
          Contact
        </Link>

        <Link href="/webshop" className="nav-link">
          Webshop
        </Link>
      </nav>

      <Link className="login-button" href="/login">
        <Image
          src="/assets/icon-user-white.svg"
          alt=""
          width={24}
          height={24}
        />
        Inloggen
      </Link>
    </header>
  );
}