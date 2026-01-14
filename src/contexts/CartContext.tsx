"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  stock: number;
  variantId?: string; // ✅ NUEVO: ID de la variante (opcional)
  variantDetails?: string; // ✅ NUEVO: Texto descriptivo "Rojo - M"
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito desde localStorage al montar (solo en cliente)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Validar que los datos sean válidos
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      localStorage.removeItem("cart");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [items, isLoaded]);

  const addItem = (product: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((currentItems) => {
      // ✅ Buscar por ID de producto Y variante (si existe)
      const itemKey = product.variantId 
        ? `${product.id}-${product.variantId}` 
        : product.id;
      
      const existingItem = currentItems.find((item) => {
        const existingKey = item.variantId 
          ? `${item.id}-${item.variantId}` 
          : item.id;
        return existingKey === itemKey;
      });

      if (existingItem) {
        // Si ya existe, actualizar cantidad (sin exceder stock)
        return currentItems.map((item) => {
          const existingKey = item.variantId 
            ? `${item.id}-${item.variantId}` 
            : item.id;
          
          return existingKey === itemKey
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, product.stock),
              }
            : item;
        });
      }

      // Si no existe, agregar nuevo item
      return [...currentItems, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => {
        // ✅ Si se especifica variantId, solo eliminar esa variante
        if (variantId !== undefined) {
          return !(item.id === productId && item.variantId === variantId);
        }
        // ✅ Si NO se especifica variantId, solo eliminar el producto sin variante
        return !(item.id === productId && item.variantId === undefined);
      })
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        const matches = variantId
          ? item.id === productId && item.variantId === variantId
          : item.id === productId && !item.variantId;

        return matches
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
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