import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import StudentDocuments from "@/components/dashboard/StudentDocuments";

export const metadata: Metadata = {
  title: "Mijn documenten | Studio SaGo",
};

export const dynamic = "force-dynamic";

export default function LeerlingDocumentenPage() {
  return (
    <PageShell>
      <main
        style={{
          width: "min(1050px, calc(100% - 32px))",
          margin: "0 auto",
          padding: "42px 0 90px",
        }}
      >
        <Link
          href="/dashboard/leerling"
          style={{
            display: "inline-flex",
            marginBottom: 22,
            color: "#033663",
            fontWeight: 850,
            textDecoration: "none",
          }}
        >
          ← Terug naar mijn dashboard
        </Link>

        <header style={{ marginBottom: 28 }}>
          <p
            style={{
              margin: 0,
              color: "#28B9AA",
              fontWeight: 900,
              letterSpacing: ".12em",
              textTransform: "uppercase",
            }}
          >
            Leerlingportaal
          </p>
          <h1
            style={{
              margin: "7px 0 10px",
              color: "#033663",
              fontSize: "clamp(2rem, 5vw, 3.7rem)",
            }}
          >
            Mijn documenten
          </h1>
          <p
            style={{
              maxWidth: 720,
              margin: 0,
              color: "#5c7287",
              lineHeight: 1.65,
            }}
          >
            Hier vind je certificaten en andere documenten die voor
            jou werden klaargezet.
          </p>
        </header>

        <StudentDocuments />
      </main>
    </PageShell>
  );
}
