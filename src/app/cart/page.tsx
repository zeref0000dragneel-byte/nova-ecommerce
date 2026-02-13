"use client";

import Header from "@/components/Header";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
  const router = useRouter();

  // Cálculos
  const total = getTotal();
  const shippingCost = total >= 500 ? 0 : 99;
  const finalTotal = total + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="inline-block mb-6 bg-primary p-6 rounded-sm">
              <ShoppingBag className="w-16 h-16 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-muted-foreground mb-10 text-sm">
              Explora nuestra tienda y encuentra productos increíbles que te encantarán
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-transparent px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>Volver a la tienda</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Carrito de Compras
          </h1>
          <p className="text-muted-foreground text-sm">
            {items.reduce((acc, item) => acc + item.quantity, 0)} {items.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={`${item.productId}-${item.variantId || 'base'}`}
                className="bg-background rounded-sm border border-border p-6 flex flex-col sm:flex-row gap-6 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Imagen */}
                <Link
                  href={item.slug ? `/shop/${item.slug}` : '#'}
                  className="relative w-full sm:w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 group"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
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
                    href={item.slug ? `/shop/${item.slug}` : '#'}
                    className="text-lg font-medium text-foreground hover:text-muted-foreground transition block mb-2"
                  >
                    {item.name}
                  </Link>
                  
                  {/* Variante */}
                  {(item.color || item.size) && (
                    <div className="inline-block mb-3">
                      <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {[item.color, item.size].filter(Boolean).join(' - ')}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-xl font-semibold text-foreground">
                      ${item.price.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">Precio unitario</p>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center border border-border rounded-sm overflow-hidden bg-background">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                        disabled={item.quantity <= 1}
                        className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 text-sm font-medium min-w-[2.5rem] text-center text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-2.5 rounded-sm transition-colors flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="text-sm font-semibold hidden sm:inline">Eliminar</span>
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Subtotal:</span>
                      <span className="font-semibold text-foreground">
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
              className="w-full py-3 rounded-sm border border-border bg-transparent text-foreground hover:bg-muted/50 font-medium text-sm transition-colors"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-background rounded-sm border border-border p-6 md:p-8 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="bg-primary p-2 rounded-sm">
                  <ShoppingBag className="w-4 h-4 text-primary-foreground" />
                </span>
                Resumen del Pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} {items.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'producto' : 'productos'})
                  </span>
                  <span className="font-medium text-foreground">${total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Envío</span>
                  <span
                    className={`font-medium text-foreground ${
                      shippingCost === 0 ? "text-muted-foreground" : ""
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

              <div className="bg-muted/50 rounded-sm p-4 mb-6 border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Total</span>
                  <span className="text-xl font-semibold text-foreground">
                    ${finalTotal.toFixed(2)} MXN
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full rounded-sm bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity mb-3"
              >
                Proceder al Pago
              </button>

              <button
                onClick={() => router.push("/shop")}
                className="w-full py-3 rounded-sm border border-border bg-transparent text-foreground font-medium text-sm hover:bg-muted/50 transition-colors"
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