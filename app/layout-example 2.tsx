import "./globals.css";
import "./seasonal.css";
import SeasonalBackground from "@/components/SeasonalBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <SeasonalBackground>{children}</SeasonalBackground>
      </body>
    </html>
  );
}
