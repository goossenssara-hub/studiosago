import Header from "./Header";
import Footer from "./Footer";

type Locale = "nl" | "en";

export default function PageShell({ children, locale = "nl" }: { children: React.ReactNode; locale?: Locale }) {
  return (
    <div className="page-shell">
      <div className="site-card">
        <Header locale={locale} />
        <main>{children}</main>
        <Footer locale={locale} />
      </div>
    </div>
  );
}
