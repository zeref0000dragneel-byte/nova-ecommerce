"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  productId: string;
  variantId?: string | null;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  slug?: string; // Para enlaces a /shop/[slug]
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "nova-cart";

function getItemKey(productId: string, variantId?: string | null): string {
  return variantId ? `${productId}-${variantId}` : productId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar en localStorage cuando cambie items
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [items, isLoaded]);

  const addToCart = (item: CartItem) => {
    setItems((current) => {
      const key = getItemKey(item.productId, item.variantId);
      const existing = current.find(
        (i) => getItemKey(i.productId, i.variantId) === key
      );

      if (existing) {
        return current.map((i) =>
          getItemKey(i.productId, i.variantId) === key
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...current, { ...item }];
    });
  };

  const removeFromCart = (productId: string, variantId?: string | null) => {
    setItems((current) =>
      current.filter(
        (i) => getItemKey(i.productId, i.variantId) !== getItemKey(productId, variantId)
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    variantId?: string | null
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems((current) =>
      current.map((i) =>
        getItemKey(i.productId, i.variantId) === getItemKey(productId, variantId)
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const getTotal = () =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getItemCount = () =>
    items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
