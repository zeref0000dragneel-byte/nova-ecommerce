"use client";

import Link from "next/link";
import { Drawer } from "vaul";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CartItem from "./CartItem";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
  } = useCart();

  const total = getTotal();

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      direction="right"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 transition-opacity" />
        <Drawer.Content className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-background border-l border-border flex flex-col z-[51] outline-none">
          
          {/* Header NØVA */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
            <div className="flex items-baseline gap-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Carrito</h2>
              {items.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("¿Limpiar todos los artículos del carrito?")) {
                      clearCart();
                    }
                  }}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-all"
                >
                  [ Vaciar ]
                </button>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:rotate-90 transition-transform duration-300 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5 stroke-[1.5px]" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <ShoppingBag className="w-8 h-8 text-zinc-200 stroke-[1px]" />
                <div className="space-y-1">
                  <p className="text-[13px] font-medium uppercase tracking-tight">El carrito está vacío</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">NØVA Essentials</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {items.map((item) => (
                  <CartItem
                    key={`${item.productId}-${item.variantId ?? "base"}`}
                    item={item}
                    onUpdateQuantity={(qty) =>
                      updateQuantity(item.productId, qty, item.variantId)
                    }
                    onRemove={() =>
                      removeFromCart(item.productId, item.variantId)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer Premium NØVA - Limpio y sin franjas pesadas */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 shrink-0 space-y-6 bg-background/80 backdrop-blur-md">
              <div className="flex justify-between items-end">
                {/* Corregido: Texto ahora es visible y elegante */}
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
                  Subtotal
                </span>
                <span className="text-xl font-bold tabular-nums tracking-tighter text-foreground">
                  ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full py-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-[0.3em] transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Finalizar Compra
                </Link>
                
                {/* Texto de envío: más pequeño y centrado */}
                <p className="text-[9px] text-center text-zinc-400 uppercase tracking-widest leading-loose">
                  Envío gratuito en órdenes superiores a $150.00
                </p>
              </div>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}