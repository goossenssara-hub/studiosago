import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer({ locale = "nl" }: { locale?: "nl" | "en" }) {
  const isEnglish = locale === "en";
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand"><h3>{isEnglish ? "Small steps. Big growth. Growing together." : "Kleine stappen. Grote groei. Samen op weg."}</h3></div>
        <div className="footer-socials">
          <a href="https://www.facebook.com/profile.php?id=61590002666037" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
          <a href="https://www.instagram.com/studiosago_" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
        </div>
        <nav className="footer-links">
          {isEnglish ? (<>
            <Link href="/webshop-EN">English shop</Link>
            <Link href="/webshop">Nederlands</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/algemene-voorwaarden">Terms (Dutch)</Link>
            <Link href="/algemene-voorwaarden#privacy">Privacy (Dutch)</Link>
          </>) : (<>
            <Link href="/">Home</Link>
            <Link href="/webshop">Webshop</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
            <Link href="/algemene-voorwaarden#privacy">Privacybeleid</Link>
          </>)}
        </nav>
        <p className="footer-copy">© {new Date().getFullYear()} Studio SaGo. {isEnglish ? "All rights reserved." : "Alle rechten voorbehouden."}</p>
      </div>
    </footer>
  );
}
