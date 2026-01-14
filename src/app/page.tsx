export const dynamic = 'force-dynamic';

import { prisma } from "@/app/lib/prisma";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowRight, Package, Truck, Shield, Store } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Bienvenido a nuestra tienda. Descubre los mejores productos de electrónica al mejor precio. Envío gratis en compras mayores a $500.",
};

export const revalidate = 60; // Revalidar cada 60 segundos

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      imageUrl: true,
      stock: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fadeIn">
            <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              🎉 Bienvenido a la mejor experiencia de compra
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Descubre Productos
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Extraordinarios
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Los mejores productos de electrónica al mejor precio. 
              <span className="block mt-2 font-semibold text-yellow-300">
                ✨ Envío gratis en compras mayores a $500
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/shop"
                className="group inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                <span>Explorar Productos</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all duration-300"
              >
                Ver Ofertas Especiales
              </Link>
            </div>
          </div>
        </div>

        {/* Onda decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249, 250, 251)"/>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Envío Gratis</h3>
              <p className="text-gray-600 leading-relaxed">
                En compras mayores a $500. Llevamos tus productos hasta la puerta de tu casa.
              </p>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Compra Segura</h3>
              <p className="text-gray-600 leading-relaxed">
                Tus datos están protegidos con encriptación de nivel bancario. Compra con confianza.
              </p>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-orange-50 hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="bg-gradient-to-r from-pink-600 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Entrega Rápida</h3>
              <p className="text-gray-600 leading-relaxed">
                3-5 días hábiles. Recibe tus productos en tiempo récord con nuestro servicio express.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
              <span className="text-blue-600 font-semibold text-sm">✨ Productos Destacados</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Lo Mejor de Nuestra
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Colección
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Descubre nuestros productos más populares y mejor valorados por nuestros clientes
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
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
            <div className="text-center py-16">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay productos disponibles en este momento</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Ver Todos los Productos</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para Comprar?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Explora nuestra colección completa de productos y encuentra exactamente lo que buscas
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center bg-white text-blue-600 px-10 py-5 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-lg"
          >
            <span>Ir a la Tienda</span>
            <ArrowRight className="ml-3 w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Mi Tienda</span>
              </div>
              <p className="text-gray-400 text-sm">
                Tu destino para los mejores productos al mejor precio.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition">Inicio</Link></li>
                <li><Link href="/shop" className="hover:text-white transition">Productos</Link></li>
                <li><Link href="/cart" className="hover:text-white transition">Carrito</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 contacto@mitienda.com</li>
                <li>📱 +52 55 1234 5678</li>
                <li>📍 Ciudad de México, México</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Mi Tienda. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}