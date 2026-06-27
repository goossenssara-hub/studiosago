import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>Kleine stappen. Grote groei. Samen op weg.</h3>
        </div>



        <div className="footer-socials">
          <a
            href="https://www.facebook.com/profile.php?id=61590002666037"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://www.instagram.com/studiosago_"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
        </div>

        <nav className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/aanbod">Aanbod</Link>
          <Link href="/webshop">Webshop</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
          <Link href="/privacybeleid">Privacybeleid</Link>
        </nav>

        <p className="footer-copy">
          © {new Date().getFullYear()} Studio SaGo. Alle rechten voorbehouden.
        </p>
      </div>
    </footer>
  );
}