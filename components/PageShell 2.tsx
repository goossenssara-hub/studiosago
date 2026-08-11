import Header from "./Header";
import Footer from "./Footer";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell">
      <div className="site-card">
        <Header />

        <main>{children}</main>

        <Footer />
      </div>
    </div>
  );
}