"use client";

import Header from "@/components/Header";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const router = useRouter();

  // Cálculos
  const total = totalPrice;
  const shippingCost = total >= 500 ? 0 : 99;
  const finalTotal = total + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-30"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-full">
                <ShoppingBag className="w-20 h-20 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-10 text-lg">
              Explora nuestra tienda y encuentra productos increíbles que te encantarán
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Explorar Productos</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Carrito de Compras
          </h1>
          <p className="text-gray-600 text-lg">
            {items.reduce((acc, item) => acc + item.quantity, 0)} {items.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={`${item.id}-${item.variantId || 'base'}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col sm:flex-row gap-6 border border-gray-100 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Imagen */}
                <Link
                  href={`/shop/${item.slug}`}
                  className="relative w-full sm:w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 group"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="160px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-16 h-16" />
                    </div>
                  )}
                </Link>

                {/* Información */}
                <div className="flex-1">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="text-xl font-bold text-gray-900 hover:text-blue-600 transition block mb-2"
                  >
                    {item.name}
                  </Link>
                  
                  {/* Variante */}
                  {item.variantDetails && (
                    <div className="inline-block mb-3">
                      <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {item.variantDetails}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${item.price.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm text-gray-500">Precio unitario</p>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                        disabled={item.quantity <= 1}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="px-6 py-3 font-bold text-lg min-w-[60px] text-center bg-gray-50">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                        disabled={item.quantity >= item.stock}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id, item.variantId)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-3 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="text-sm font-semibold hidden sm:inline">Eliminar</span>
                    </button>
                  </div>

                  {/* Stock disponible */}
                  {item.stock <= 5 && (
                    <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg mb-4">
                      <span className="text-sm font-semibold">⚠️ Solo quedan {item.stock} unidades</span>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Subtotal:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ${(item.price * item.quantity).toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Botón limpiar carrito */}
            <button
              onClick={clearCart}
              className="w-full text-red-600 hover:text-red-800 transition-all duration-200 py-4 border-2 border-red-300 rounded-xl hover:bg-red-50 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              🗑️ Vaciar carrito
            </button>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 sticky top-24 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </span>
                Resumen del Pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">
                    Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} {items.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'producto' : 'productos'})
                  </span>
                  <span className="font-bold text-lg text-gray-900">${total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Envío</span>
                  <span
                    className={`font-bold text-lg ${
                      shippingCost === 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {shippingCost === 0
                      ? "GRATIS ✨"
                      : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                {total > 0 && total < 500 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 font-medium">
                      💡 Añade <span className="font-bold">${(500 - total).toFixed(2)}</span> más para envío gratis
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">MXN</p>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 mb-3"
              >
                Proceder al Pago
              </button>

              <button
                onClick={() => router.push("/shop")}
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
              >
                ← Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}