"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Package, Menu, X, Home } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { getItemCount, setIsOpen } = useCart();
  const itemCount = getItemCount();
  const prevCount = useRef(itemCount);
  const [badgeKey, setBadgeKey] = useState(0);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBadgeKey((prev) => prev + 1);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/shop", label: "Productos", icon: Package },
  ];

  const handleCartClick = () => {
    setIsMenuOpen(false);
    setIsOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link 
              href="/" 
              className="font-bold text-xl tracking-tighter text-black hover:opacity-70 transition-opacity active:scale-95"
            >
              NØVA
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-all duration-200 active:scale-95 ${
                      isActive 
                        ? "text-black" 
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Carrito y Menú Móvil */}
            <div className="flex items-center gap-2">
              {/* Botón Carrito */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-gray-600 hover:text-black transition-colors rounded-lg hover:bg-gray-50 active:scale-95 active:bg-gray-100 duration-200"
                aria-label={`Carrito${itemCount > 0 ? `, ${itemCount} productos` : ""}`}
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span
                    key={badgeKey}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50 duration-200"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>

              {/* Botón Hamburguesa (Solo Móvil) */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-black transition-colors rounded-lg hover:bg-gray-50 active:scale-95 active:bg-gray-100 duration-200"
                aria-label="Abrir menú"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sheet Móvil (Overlay + Panel) */}
      {isMenuOpen && (
        <>
          {/* Overlay con Backdrop Blur */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Panel Lateral */}
          <div className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-white border-l border-gray-200 shadow-2xl animate-in slide-in-from-right duration-300 md:hidden flex flex-col">
            {/* Header del Sheet */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-gray-100">
              <span className="font-bold text-lg tracking-tighter">Menú</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 text-gray-600 hover:text-black transition-colors rounded-lg hover:bg-gray-50 active:scale-95 active:bg-gray-100"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer del Sheet - Carrito */}
            <div className="px-4 py-4 border-t border-gray-100">
              <button
                onClick={handleCartClick}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg bg-black text-white hover:bg-gray-900 active:scale-[0.98] transition-all duration-200 font-medium text-sm"
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                  Ver Carrito
                </span>
                {itemCount > 0 && (
                  <span className="px-2.5 py-1 bg-white text-black rounded-full text-xs font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}