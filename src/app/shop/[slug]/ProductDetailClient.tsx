'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, Truck, Shield, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const COLOR_HEX: Record<string, string> = {
  negro: '#18181b',
  black: '#18181b',
  blanco: '#fafafa',
  white: '#fafafa',
  gris: '#71717a',
  gray: '#71717a',
  rojo: '#dc2626',
  red: '#dc2626',
  azul: '#3b82f6',
  blue: '#3b82f6',
  verde: '#22c55e',
  green: '#22c55e',
  beige: '#d4c4a8',
  marrón: '#92400e',
  brown: '#92400e',
};

function getColorHex(name: string): string | null {
  const key = name.toLowerCase().trim();
  return COLOR_HEX[key] ?? null;
}

interface Variant {
  id: string;
  color: string | null;
  size: string | null;
  sku: string | null;
  price: number | null;
  stock: number;
  images: string[];
}

interface Spec {
  attribute: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  imageUrl: string | null;
  images?: string[];
  category: {
    id: string;
    name: string;
  };
  variants: Variant[];
  specs?: Spec[];
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart, setIsOpen } = useCart();
  const hasVariants = product.variants && product.variants.length > 0;

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const productImages = product.images && product.images.length > 0
    ? product.images
    : product.imageUrl ? [product.imageUrl] : [];

  const variantImages = selectedVariant?.images?.length ? selectedVariant.images : [];
  const displayImages =
    hasVariants && variantImages.length > 0 ? variantImages : productImages;

  const currentImage = displayImages[selectedImageIndex] || displayImages[0];

  const colors = hasVariants
    ? Array.from(
        new Set(product.variants.filter((v) => v.color).map((v) => v.color))
      )
    : [];

  const sizes = hasVariants
    ? Array.from(
        new Set(product.variants.filter((v) => v.size).map((v) => v.size))
      )
    : [];

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const specs = product.specs && product.specs.length > 0 ? product.specs : [];
  const displayImage = currentImage || product.imageUrl || product.images?.[0];
  const onSale = product.comparePrice != null && product.comparePrice > currentPrice;

  const handleVariantClick = (variant: Variant) => {
    if (selectedVariant?.id === variant.id) {
      setSelectedVariant(null);
    } else {
      setSelectedVariant(variant);
    }
    setSelectedImageIndex(0);
  };

  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQuantity = () => setQuantity((q) => Math.min(currentStock, q + 1));

  const handleAddToCart = () => {
    if (currentStock <= 0) return;

    setIsAdding(true);
    const item = {
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: product.name,
      price: currentPrice,
      image: selectedVariant?.images?.[0] || product.images?.[0] || product.imageUrl || "",
      quantity,
      color: selectedVariant?.color ?? undefined,
      size: selectedVariant?.size ?? undefined,
      slug: product.slug,
    };
    addToCart(item);
    setIsOpen(true);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Imagen Principal - Full Width en Móvil */}
      <div className="relative aspect-square lg:aspect-[4/3] bg-gray-100">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Package className="w-32 h-32" />
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Columna Izquierda - Info del Producto */}
          <div className="lg:order-2">
            {/* Breadcrumb */}
            {product.category && (
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                {product.category.name}
              </p>
            )}

            {/* Título */}
            <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-black mb-4">
              {product.name}
            </h1>

            {/* Precio */}
            <div className="mb-6">
              <p className="text-3xl font-bold text-black">
                ${currentPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              {onSale && product.comparePrice != null && (
                <p className="text-sm text-gray-500 line-through mt-1">
                  ${product.comparePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>

            {/* Selectores de Variante */}
            {hasVariants && (colors.length > 0 || sizes.length > 0) && (
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-3">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {colors.map((color) => {
                        const variant = product.variants.find((v) => v.color === color);
                        const isSelected = selectedVariant?.color === color;
                        const hex = color ? (getColorHex(color) ?? '#000000') : '#000000';
                        return (
                          <button
                            key={color ?? ''}
                            type="button"
                            onClick={() => variant && handleVariantClick(variant)}
                            title={color || undefined}
                            className={`w-8 h-8 rounded-full transition-all ${
                              isSelected
                                ? 'ring-2 ring-black ring-offset-2'
                                : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-3">
                      Tamaño
                    </label>
                    <div className="flex gap-2">
                      {sizes.map((size) => {
                        const variant = product.variants.find(
                          (v) =>
                            v.size === size &&
                            (!selectedVariant?.color || v.color === selectedVariant.color)
                        );
                        const isSelected = selectedVariant?.size === size;
                        const isDisabled = !variant || variant.stock === 0;
                        return (
                          <button
                            key={size ?? ''}
                            type="button"
                            onClick={() => variant && handleVariantClick(variant)}
                            disabled={isDisabled}
                            className={`px-4 py-2 text-sm font-medium rounded-sm transition-all ${
                              isSelected
                                ? 'bg-black text-white'
                                : isDisabled
                                  ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
                                  : 'border border-gray-300 text-black hover:border-black'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  {currentStock} disponibles
                </p>
              </div>
            )}

            {/* Selector de Cantidad */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-3">
                Cantidad
              </label>
              <div className="flex items-center border border-gray-300 rounded-sm w-fit">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="px-4 py-3 text-gray-600 hover:text-black disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 text-sm font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={quantity >= currentStock}
                  className="px-4 py-3 text-gray-600 hover:text-black disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Botón Agregar al Carrito - Sticky en Móvil */}
            <div className="sticky bottom-4 lg:static z-10">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || currentStock === 0}
                className="w-full bg-black text-white py-4 rounded-sm font-medium text-sm hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg lg:shadow-none"
              >
                {isAdding ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5 animate-in zoom-in-50" />
                    Agregado
                  </span>
                ) : currentStock === 0 ? (
                  'Agotado'
                ) : (
                  'AGREGAR AL CARRITO'
                )}
              </button>
            </div>

            {/* Features */}
            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Envío express asegurado</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Garantía limitada NØVA</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Packaging 100% reciclable</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Descripción y Specs */}
          <div className="lg:order-1 mt-12 lg:mt-0 space-y-8">
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-black mb-3">Descripción</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {specs.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-black mb-4">ESPECIFICACIONES</h2>
                <div className="space-y-3">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 capitalize">{spec.attribute}</span>
                      <span className="text-sm font-medium text-black">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
