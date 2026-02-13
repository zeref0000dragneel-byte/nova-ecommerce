import { prisma } from "@/app/lib/prisma";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Package } from "lucide-react";
import type { Metadata } from "next";
import { ShopToolbar } from "@/components/ShopToolbar";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Explora nuestro catálogo completo de productos. Filtra por categoría y encuentra exactamente lo que buscas.",
};

export const revalidate = 300;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (params.category) {
    where.categoryId = params.category;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      stock: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const productsWithImageUrl = products.map((product) => ({
    ...product,
    imageUrl: product.images && product.images.length > 0 ? product.images[0] : null,
  }));

  const count = productsWithImageUrl.length;
  const countStr = String(count).padStart(2, "0");

  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Cabecera tipográfica */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-foreground">
                CATÁLOGO
              </h1>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                [ {countStr} ]
              </span>
            </div>
            <Link
              href="/shop"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todos los productos —&gt;
            </Link>
          </div>

          {/* Barra de herramientas: búsqueda + categorías */}
          <ShopToolbar
            categories={categories}
            currentCategory={params.category}
            currentSearch={params.search}
          />
        </div>

        {/* Espacio y grid */}
        <div className="pt-12">
          {productsWithImageUrl.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
              {productsWithImageUrl.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  stock={product.stock}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-sm border border-border bg-muted/20">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No se encontraron productos
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                No hay productos que coincidan con los filtros. Prueba otra categoría o búsqueda.
              </p>
              <Link
                href="/shop"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
