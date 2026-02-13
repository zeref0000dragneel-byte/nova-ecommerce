"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, setIsOpen } = useCart();

  const handleAddToCart = () => {
    setIsAdding(true);

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "",
      quantity,
      slug: product.slug,
    });

    // Toast premium con acción
    toast.success(
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-sm bg-black/5 flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5 text-black" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-black">Agregado al carrito</p>
          <p className="text-xs text-gray-600 truncate mt-0.5">{product.name}</p>
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

    // Reset del estado después de la animación
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1); // Reset a 1 después de agregar
    }, 600);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">Cantidad:</span>
        <div className="flex items-center border border-border rounded-sm bg-background">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-5 py-2 text-sm font-medium text-foreground min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={incrementQuantity}
            disabled={quantity >= product.stock}
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="w-full rounded-sm bg-black text-white py-3.5 px-6 font-medium text-sm hover:bg-gray-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAdding ? (
          <>
            <Check className="w-4 h-4 animate-in zoom-in-50 duration-300" />
            <span>Agregado</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>Agregar al carrito</span>
          </>
        )}
      </button>

      <div className="text-center">
        <span className="text-sm text-muted-foreground">Subtotal: </span>
        <span className="text-sm font-medium text-foreground">
          $
          {(product.price * quantity).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}