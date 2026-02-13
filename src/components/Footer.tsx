import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Columna 1: Logo + Tagline */}
          <div>
            <Link href="/" className="font-bold text-xl tracking-tighter text-white hover:opacity-80 transition-opacity">
              NØVA
            </Link>
            <p className="mt-3 text-sm text-white/60 max-w-xs">
              Herramientas para mentes productivas.
            </p>
          </div>

          {/* Columna 2: Enlaces */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-white/40 mb-4">
              ENLACES
            </p>
            <nav className="flex flex-col gap-3">
              <Link href="/shop" className="text-sm text-white/70 hover:text-white transition-colors duration-200">
                Shop
              </Link>
              <Link href="/shop" className="text-sm text-white/70 hover:text-white transition-colors duration-200">
                Categorías
              </Link>
              <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors duration-200">
                Contacto
              </Link>
            </nav>
          </div>

          {/* Columna 3: Newsletter */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-white/40 mb-4">
              NEWSLETTER
            </p>
            <div className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 bg-transparent border-b border-white/30 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white transition-colors"
              />
              <button className="px-4 py-2 text-xs font-medium tracking-wider uppercase bg-white text-black hover:bg-white/90 transition-all active:scale-95 rounded-sm whitespace-nowrap">
                JOIN
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-white/50 text-center lg:text-left">
            © 2026 NØVA LAB. Crafted for precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
