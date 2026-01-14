"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
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
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addItem({ id, name, slug, price, imageUrl, stock });
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover-lift"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen con overlay */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <Link href={`/shop/${slug}`} className="block w-full h-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className={`object-cover transition-transform duration-500 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="w-16 h-16" />
            </div>
          )}
        </Link>
        
        {/* Overlay en hover */}
        {imageUrl && (
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 transition-opacity duration-300 pointer-events-none ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        
        {/* Botones de acción en hover */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300 pointer-events-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Link
            href={`/shop/${slug}`}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transform hover:scale-110 transition-all duration-200 shadow-lg pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="w-5 h-5 text-gray-800" />
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={stock === 0 || isAdding}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-110 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
          >
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Badge de stock */}
        {stock === 0 ? (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse pointer-events-none">
            Agotado
          </div>
        ) : stock <= 5 ? (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg pointer-events-none">
            ¡Últimas {stock}!
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            En Stock
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        <Link href={`/shop/${slug}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 min-h-[3.5rem]">
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
            <p className="text-xs text-gray-500 mt-1">MXN</p>
          </div>

          {stock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed md:hidden lg:flex items-center gap-2"
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold">Agregado</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm font-semibold">Agregar</span>
                </>
              )}
            </button>
          )}
        </div>

        {stock > 0 && (
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {stock} disponibles
          </p>
        )}
      </div>

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
}
