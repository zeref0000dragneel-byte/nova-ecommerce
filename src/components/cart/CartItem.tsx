"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, Package } from "lucide-react";
import type { CartItem as CartItemType } from "@/contexts/CartContext";
import { useCart } from "@/contexts/CartContext";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const { setIsOpen } = useCart();
  const subtotal = item.price * item.quantity;
  const variantText = [item.color, item.size].filter(Boolean).join(" · ");

  return (
    <div className="flex items-center gap-4 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      {/* Imagen Minimalista */}
      <Link
        href={item.slug ? `/shop/${item.slug}` : "#"}
        onClick={() => setIsOpen(false)}
        className="relative w-20 h-20 flex-shrink-0 rounded-none border border-zinc-100 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            <Package className="w-6 h-6 stroke-[1px]" />
          </div>
        )}
      </Link>

      {/* Info con Jerarquía Visual NØVA */}
      <div className="flex-1 flex flex-col min-w-0 self-stretch justify-between py-0.5">
        <div>
          <Link
            href={item.slug ? `/shop/${item.slug}` : "#"}
            onClick={() => setIsOpen(false)}
            className="text-[13px] font-medium text-foreground uppercase tracking-tight line-clamp-1 hover:text-zinc-500 transition-colors"
          >
            {item.name}
          </Link>
          {variantText && (
            <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">
              {variantText}
            </p>
          )}
        </div>

        {/* Precio y Selector de Cantidad */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-none h-7">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="px-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-[11px] font-medium w-6 text-center tabular-nums text-foreground">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="px-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs font-medium text-foreground tabular-nums">
            ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Botón Eliminar Discreto */}
      <button
        type="button"
        onClick={onRemove}
        className="self-start p-1 text-zinc-300 hover:text-destructive transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}