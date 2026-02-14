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

  const [displayImage, setDisplayImage] = useState<string>(
    productImages[0] || product.imageUrl || ''
  );

  const variantImages = selectedVariant?.images?.length ? selectedVariant.images : [];
  const displayImages =
    hasVariants && variantImages.length > 0 ? variantImages : productImages;

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
  const onSale = product.comparePrice != null && product.comparePrice > currentPrice;

  const handleVariantClick = (variant: Variant) => {
    if (selectedVariant?.id === variant.id) {
      setSelectedVariant(null);
      setDisplayImage(productImages[0] || product.imageUrl || '');
    } else {
      setSelectedVariant(variant);
      setDisplayImage(variant.images?.[0] || productImages[0] || product.imageUrl || '');
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

  const galleryImages = displayImages.length > 1 ? displayImages : productImages;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">

          {/* COLUMNA IZQUIERDA - GALERÍA DE IMÁGENES */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            {/* Imagen Principal */}
            <div className="relative aspect-square bg-gray-100 rounded-sm overflow-hidden mb-4">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  priority
                  quality={95}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Package className="w-32 h-32" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setDisplayImage(img)}
                    className={`relative aspect-square bg-gray-100 rounded-sm overflow-hidden transition-all ${
                      displayImage === img
                        ? 'ring-2 ring-black'
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - Vista ${index + 1}`}
                      fill
                      quality={90}
                      sizes="(max-width: 1024px) 25vw, 150px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA - INFORMACIÓN */}
          <div className="space-y-4 lg:space-y-6">
            {/* Breadcrumb */}
            {product.category && (
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                {product.category.name}
              </p>
            )}

            {/* Título + Precio */}
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-black mb-3">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-black">
                  ${currentPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
                {onSale && product.comparePrice != null && (
                  <p className="text-base text-gray-400 line-through">
                    ${product.comparePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>

            {/* Variantes */}
            {hasVariants && (colors.length > 0 || sizes.length > 0) && (
              <div className="space-y-4 py-4 border-y border-gray-200">
                {colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Color {selectedVariant?.color && `— ${selectedVariant.color}`}
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
                                : 'hover:ring-2 hover:ring-gray-300'
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
                    <label className="block text-sm font-medium text-black mb-2">Tamaño</label>
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
                                  : 'border border-gray-300 hover:border-black'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600">{currentStock} disponibles</p>
              </div>
            )}

            {/* Cantidad + Botón */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Cantidad</label>
                <div className="flex items-center border border-gray-300 rounded-sm w-fit">
                  <button
                    type="button"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="px-3 py-2 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-2 text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={incrementQuantity}
                    disabled={quantity >= currentStock}
                    className="px-3 py-2 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || currentStock === 0}
                className="w-full bg-black text-white py-3.5 rounded-sm font-medium text-sm hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isAdding ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
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
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 py-4 border-t border-gray-200">
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

            {/* Descripción */}
            {product.description && (
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-base font-semibold mb-2">Descripción</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Especificaciones */}
            {specs.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-base font-semibold mb-3">ESPECIFICACIONES</h2>
                <div className="space-y-2">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600 capitalize">{spec.attribute}</span>
                      <span className="font-medium text-black">{spec.value}</span>
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
