import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "@repo/ui/styles.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const sans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Artéfact Urbain | Production Événementielle & Patrimoine",
  description: "Artéfact Urbain fusionne patrimoine et innovation au Québec. Services d'archéologie, production d'événements, fabrication et conception web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${playfair.variable} ${sans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
