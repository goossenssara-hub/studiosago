import type { Metadata } from "next";
import "./globals.css";
import "./season-engine.css";
import SeasonEngine from "@/components/SeasonEngine";

export const metadata: Metadata = {
  title: "Studio SaGo",
  description: "Educatieve begeleiding, zorgaanbod en fotografie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <SeasonEngine effects={true}>
          {children}
        </SeasonEngine>
      </body>
    </html>
  );
}