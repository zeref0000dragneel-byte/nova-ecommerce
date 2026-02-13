import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  productImage?: string | null;
  productName?: string | null;
}

export default function Hero({ productImage, productName }: HeroProps) {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* MÓVIL: Layout Vertical Centrado */}
        <div className="lg:hidden flex flex-col items-center text-center py-14 space-y-10">
          {/* Eyebrow */}
          <p className="text-xs font-medium tracking-widest uppercase text-gray-400">
            Edition 001
          </p>

          {/* Título Grande */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black leading-tight max-w-md">
            Herramientas para la era de la precisión
          </h1>

          {/* Imagen Cuadrada Pequeña */}
          <div className="relative w-64 h-64 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
            {productImage ? (
              <Image
                src={productImage}
                alt={productName || "Producto destacado"}
                fill
                priority
                sizes="256px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-bold tracking-tighter text-gray-900">
                  NØVA
                </p>
              </div>
            )}
          </div>

          {/* Descripción */}
          <p className="text-base text-gray-600 max-w-sm">
            Diseño minimalista con propósito funcional. Elevamos tu flujo de trabajo digital al siguiente nivel.
          </p>

          {/* Botones */}
          <div className="w-full max-w-sm flex flex-col gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-black text-white text-sm font-medium rounded-sm hover:bg-gray-900 transition-all active:scale-[0.98]"
            >
              Explorar Colección
            </Link>
            <Link
              href="#filosofia"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 border border-gray-300 text-black text-sm font-medium rounded-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              Nuestra Filosofía
            </Link>
          </div>
        </div>

        {/* DESKTOP: Layout Original */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-16 items-center py-24">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-gray-400 mb-4">
              NØVA LAB — EDITION 001
            </p>
            <h1 className="text-6xl font-bold tracking-tight text-black leading-tight">
              Herramientas para la era de la precisión.
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-xl">
              Diseño minimalista con propósito funcional. Elevamos tu flujo de trabajo digital al siguiente nivel.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-black text-white text-sm font-medium rounded-sm hover:bg-gray-900 transition-all active:scale-[0.98]"
              >
                Explorar Colección
              </Link>
              <Link
                href="#filosofia"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-gray-300 text-black text-sm font-medium rounded-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Nuestra Filosofía
              </Link>
            </div>
          </div>
          <div className="relative aspect-square bg-gray-100 rounded-sm overflow-hidden">
            {productImage ? (
              <Image
                src={productImage}
                alt={productName || "Producto destacado"}
                fill
                priority
                sizes="50vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-bold tracking-tighter text-gray-900">
                  NØVA LAB
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
