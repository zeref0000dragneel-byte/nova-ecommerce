import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { ShieldCheck, Truck, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio",
  description: "NØVA — Minimalist Tech. Herramientas para la era de la precisión.",
};

export const revalidate = 60;

export default async function Home() {
  const [heroProduct, categories] = await Promise.all([
    prisma.product.findFirst({
      where: { isActive: true },
      orderBy: { price: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const heroImageUrl =
    heroProduct?.images && heroProduct.images.length > 0
      ? heroProduct.images[0]
      : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <Hero
        productImage={heroImageUrl}
        productName={heroProduct?.name}
      />

      {/* Beneficios */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="flex flex-col items-center text-center">
              <ShieldCheck className="w-6 h-6 text-primary mb-4" />
              <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                Garantía
              </span>
              <p className="mt-2 text-sm text-foreground max-w-[200px]">
                Cobertura extendida en productos seleccionados
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck className="w-6 h-6 text-primary mb-4" />
              <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                Envío Global
              </span>
              <p className="mt-2 text-sm text-foreground max-w-[200px]">
                Entrega a todo el país. Gratis en compras +$500
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Zap className="w-6 h-6 text-primary mb-4" />
              <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                Soporte 24/7
              </span>
              <p className="mt-2 text-sm text-foreground max-w-[200px]">
                Atención técnica y postventa cuando lo necesites
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-8 text-center">
            Explorar por categoría
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="rounded-sm bg-muted/30 border border-border/50 py-8 px-4 text-center font-medium text-foreground text-sm hover:bg-muted/50 hover:border-border transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Nuestra Filosofía */}
      <section
        id="filosofia"
        className="bg-black text-white py-24 scroll-mt-16"
      >
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-6">
            Menos, pero mejor.
          </h2>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Seleccionamos con rigor herramientas tecnológicas que eliminan la
            fricción digital. Cada producto en NØVA está curado para durar,
            rendir y encajar en un flujo de trabajo enfocado — sin ruido, sin
            exceso.
          </p>
        </div>
      </section>
    </div>
  );
}
