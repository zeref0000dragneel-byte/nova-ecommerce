import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: "NØVA — Minimalist Tech",
    template: "%s | NØVA",
  },
  description: "Minimalist tech. Clean, focused, premium.",
  keywords: ["NØVA", "tech", "minimal", "ecommerce"],
  authors: [{ name: "NØVA" }],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "NØVA",
    title: "NØVA — Minimalist Tech",
    description: "Minimalist tech. Clean, focused, premium.",
    images: ["/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={GeistSans.variable}>
      <body className="bg-background text-foreground antialiased">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <Footer />
          </div>
          <Toaster 
            position="bottom-right" 
            expand={false}
            richColors 
            closeButton
            theme="light"
            toastOptions={{
              style: {
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                fontFamily: 'var(--font-geist-sans)',
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}