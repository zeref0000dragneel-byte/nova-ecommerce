"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  imageUrl,
  stock,
}: ProductCardProps) {
  const { addToCart, setIsOpen } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart({
      productId: id,
      name,
      price,
      image: imageUrl || "",
      quantity: 1,
      slug,
    });
    toast.success(
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-sm bg-gray-100 flex-shrink-0 overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.png"}
            alt={name}
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-black">Agregado al carrito</p>
          <p className="text-xs text-gray-600 truncate mt-0.5">{name}</p>
        </div>
      </div>,
      {
        duration: 3000,
        action: {
          label: "Ver carrito",
          onClick: () => setIsOpen(true),
        },
      }
    );
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <article className="group relative bg-white overflow-hidden transition-colors duration-300">
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        <Link href={`/shop/${slug}`} className="block w-full h-full">
          <Image
            src={imageUrl || "/placeholder.png"}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
          />
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" aria-hidden />
        </Link>

        <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
          {stock === 0 && (
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 bg-white/95 px-2 py-0.5 border border-zinc-200">
              Agotado
            </span>
          )}
          {stock > 0 && stock <= 5 && (
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 bg-white/95 px-2 py-0.5 border border-zinc-200">
              Últimas {stock}
            </span>
          )}
        </div>
      </div>

      <div className="pt-0 flex flex-col">
        <div className="min-h-[40px] mt-3">
          <Link href={`/shop/${slug}`}>
            <h2 className="text-[13px] font-medium text-zinc-900 uppercase tracking-tight line-clamp-2 hover:text-zinc-600 transition-colors duration-300">
              {name}
            </h2>
          </Link>
        </div>

        <div className="flex flex-col gap-0.5 mt-1.5">
          <span className="text-[12px] text-zinc-500 tabular-nums">
            $
            {price.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            MXN
          </span>
        </div>

        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            disabled={stock === 0 || isAdding}
            className="w-full bg-black text-white py-2.5 rounded-sm text-sm font-medium hover:bg-gray-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <>
                <Check className="w-4 h-4 animate-in zoom-in-50 duration-300" />
                <span>Agregado</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
                <span>{stock === 0 ? "Agotado" : "Agregar"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
