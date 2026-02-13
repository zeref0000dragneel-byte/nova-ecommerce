'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ShoppingCart, Truck, Shield, Recycle } from 'lucide-react';
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

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock || product.stock;
  const specs = product.specs && product.specs.length > 0 ? product.specs : [];

  const handleVariantClick = (variant: Variant) => {
    if (selectedVariant?.id === variant.id) {
      setSelectedVariant(null);
    } else {
      setSelectedVariant(variant);
    }
    setSelectedImageIndex(0);
  };

  const handleAddToCart = () => {
    if (currentStock <= 0) return;

    setIsAdding(true);
    const item = {
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: product.name,
      price: currentPrice,
      image: displayImages[0] || currentImage || "",
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
    <div className="bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Columna Izquierda: Galería (scroll) */}
        <div className="lg:min-h-[80vh] lg:overflow-y-auto order-2 lg:order-1">
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative aspect-square bg-muted/30 rounded-sm overflow-hidden">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="w-32 h-32" />
                </div>
              )}
            </div>

            {/* Miniaturas (cuando hay más de una imagen) */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 shrink-0 rounded-sm overflow-hidden border transition-colors ${
                      selectedImageIndex === idx
                        ? 'border-foreground'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Info + Compra (sticky en desktop) */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col">
            {/* Categoría */}
            <Link
              href={`/shop?category=${product.category.id}`}
              className="inline-block text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              {product.category.name}
            </Link>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            {/* Precio */}
            <div className="mb-6">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                ${currentPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
              {product.comparePrice && (
                <span className="ml-3 text-xl text-muted-foreground line-through">
                  ${product.comparePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {/* Selector de Variantes */}
            {hasVariants && (colors.length > 0 || sizes.length > 0) && (
              <div className="mb-6 space-y-5">
                {/* Colores: círculos 20px al estilo Apple */}
                {colors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      Color
                      {selectedVariant?.color && (
                        <span className="font-normal text-muted-foreground ml-2">
                          — {selectedVariant.color}
                        </span>
                      )}
                    </h3>
                    <div className="inline-flex flex-wrap gap-2">
                      {colors.map((color) => {
                        const variant = product.variants.find((v) => v.color === color);
                        const isSelected = selectedVariant?.color === color;
                        const hex = getColorHex(color);
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => variant && handleVariantClick(variant)}
                            title={color}
                            className={`relative w-5 h-5 rounded-full shrink-0 transition-all ${
                              isSelected
                                ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                                : 'border border-border hover:border-foreground'
                            }`}
                            style={
                              hex
                                ? { backgroundColor: hex }
                                : { backgroundColor: 'var(--muted)' }
                            }
                          >
                            {hex === '#fafafa' && (
                              <span className="absolute inset-0 rounded-full border border-border" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tallas: botones rectangulares minimalistas al estilo Vercel */}
                {sizes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      Talla
                      {selectedVariant?.size && (
                        <span className="font-normal text-muted-foreground ml-2">
                          — {selectedVariant.size}
                        </span>
                      )}
                    </h3>
                    <div className="inline-flex flex-wrap gap-2">
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
                            key={size}
                            type="button"
                            onClick={() => variant && handleVariantClick(variant)}
                            disabled={isDisabled}
                            className={`min-w-[2.5rem] px-3 py-2 text-sm font-medium rounded-sm border transition-colors ${
                              isSelected
                                ? 'bg-foreground text-background border-foreground'
                                : isDisabled
                                  ? 'border-border bg-muted/30 text-muted-foreground cursor-not-allowed'
                                  : 'border-border text-foreground hover:border-foreground'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stock */}
            <div className="mb-6">
              {currentStock === 0 ? (
                <span className="inline-flex items-center border border-border text-muted-foreground px-3 py-1.5 rounded-sm text-sm font-medium">
                  Agotado
                </span>
              ) : currentStock <= 5 ? (
                <span className="inline-flex items-center border border-border text-foreground px-3 py-1.5 rounded-sm text-sm font-medium">
                  Últimas {currentStock} unidades
                </span>
              ) : (
                <span className="inline-flex items-center border border-border/50 text-muted-foreground px-3 py-1.5 rounded-sm text-sm font-medium">
                  {currentStock} disponibles
                </span>
              )}
            </div>

            {/* Cantidad + Agregar al Carrito */}
            {currentStock > 0 && (
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                  <div className="flex items-center border border-border rounded-sm bg-background w-fit">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 border-r border-border transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={currentStock}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(
                            currentStock,
                            Math.max(1, parseInt(e.target.value, 10) || 1)
                          )
                        )
                      }
                      className="w-14 text-center bg-transparent border-0 py-2.5 text-sm font-medium text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l border-border transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="w-full sm:flex-1 rounded-sm bg-primary text-primary-foreground py-4 text-sm font-bold uppercase tracking-widest hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isAdding ? 'Agregado!' : 'Agregar al Carrito'}
                  </button>
                </div>

                {/* Micro-copy Premium */}
                <ul className="mt-4 flex flex-col gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Truck className="w-3 h-3 shrink-0 text-primary" />
                    Envío express asegurado
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-3 h-3 shrink-0 text-primary" />
                    Garantía limitada NØVA
                  </li>
                  <li className="flex items-center gap-2">
                    <Recycle className="w-3 h-3 shrink-0 text-primary" />
                    Packaging 100% reciclable
                  </li>
                </ul>
              </div>
            )}

            {/* Descripción */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Descripción
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>
            )}

            {/* ESPECIFICACIONES */}
            {specs.length > 0 && (
            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                Especificaciones
              </h3>
              <dl className="space-y-0">
                {specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-baseline gap-4 py-3 border-b border-border/50 last:border-b-0"
                  >
                    <dt className="text-sm text-muted-foreground shrink-0">
                      {spec.attribute}
                    </dt>
                    <dd className="text-sm text-foreground font-medium text-right">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
