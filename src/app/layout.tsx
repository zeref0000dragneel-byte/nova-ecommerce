import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "Mi Tienda Virtual - E-commerce Moderno",
    template: "%s | Mi Tienda Virtual",
  },
  description: "Encuentra los mejores productos al mejor precio. Envío gratis en compras mayores a $500. E-commerce completo y seguro.",
  keywords: ["tienda", "ecommerce", "productos", "compras online", "envío gratis"],
  authors: [{ name: "Mi Tienda Virtual" }],
  icons: {
    icon: "/Fabicon.ico", // Referencia al favicon en la carpeta public
  },
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
      <body className={`${inter.variable} antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
