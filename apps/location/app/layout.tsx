import type { Metadata } from "next";
import { Montserrat, Poppins, Playfair_Display } from 'next/font/google';
import "./globals.css";
import { RentalProvider } from "../context/RentalContext";
import { CartProvider } from "../context/CartContext";

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '700', '900'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "Artéfact Urbain | Location d'Équipement Événementiel",
  description: "Location d'équipement pour événements, festivals et mariages. Chapiteaux, sonorisation, éclairage et plus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${montserrat.variable} ${poppins.variable} ${playfair.variable} antialiased`}>
        <RentalProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </RentalProvider>
      </body>
    </html>
  );
}
