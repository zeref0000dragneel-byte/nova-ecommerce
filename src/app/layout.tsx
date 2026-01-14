import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mi Tienda Virtual - E-commerce Moderno",
    template: "%s | Mi Tienda Virtual",
  },
  description: "Encuentra los mejores productos al mejor precio. Envío gratis en compras mayores a $500. E-commerce completo y seguro.",
  keywords: ["tienda", "ecommerce", "productos", "compras online", "envío gratis"],
  authors: [{ name: "Mi Tienda Virtual" }],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://mitienda.com",
    siteName: "Mi Tienda Virtual",
    title: "Mi Tienda Virtual - E-commerce Moderno",
    description: "Encuentra los mejores productos al mejor precio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}