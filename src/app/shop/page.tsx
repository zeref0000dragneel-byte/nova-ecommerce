import { prisma } from "@/app/lib/prisma";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Search, Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Explora nuestro catálogo completo de productos. Filtra por categoría y encuentra exactamente lo que buscas.",
};

export const revalidate = 300; // Revalidar cada 5 minutos

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  // Await searchParams (Next.js 15)
  const params = await searchParams;
  
  // Obtener categorías
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // Construir query de productos (solo productos activos)
  const where: any = {
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
      imageUrl: true,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 mb-10 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nuestra Tienda
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Encuentra los mejores productos al mejor precio. Miles de opciones para elegir.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <form className="flex-1" action="/shop" method="get">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="search"
                  placeholder="Buscar productos..."
                  defaultValue={params.search}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </form>

            {/* Filtro de categoría */}
            <CategoryFilter
              categories={categories}
              currentCategory={params.category}
            />
          </div>

          {/* Filtros activos */}
          {(params.category || params.search) && (
            <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Filtros activos:</span>
              {params.search && (
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md flex items-center gap-2">
                  🔍 {params.search}
                </span>
              )}
              {params.category && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md flex items-center gap-2">
                  📦 {categories.find((c) => c.id === params.category)?.name}
                </span>
              )}
              <a
                href="/shop"
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline transition"
              >
                ✕ Limpiar filtros
              </a>
            </div>
          )}
        </div>

        {/* Contador de productos */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-700 font-semibold">
              Mostrando <span className="text-blue-600 text-xl">{products.length}</span>{" "}
              {products.length === 1 ? "producto" : "productos"}
            </p>
          </div>
        </div>

        {/* Grid de productos */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  stock={product.stock}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              No hay productos que coincidan con los filtros seleccionados. Intenta con otros criterios de búsqueda.
            </p>
            <a
              href="/shop"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ver todos los productos
            </a>
          </div>
        )}
      </main>
    </div>
  );
}