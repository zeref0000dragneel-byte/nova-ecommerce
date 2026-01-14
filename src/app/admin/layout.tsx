import Link from 'next/link';
import { isAuthenticated, clearAdminSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

async function handleLogout() {
  'use server';
  await clearAdminSession();
  redirect('/admin/login');
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔒 Verificar autenticación (el middleware también protege las rutas)
  const authenticated = await isAuthenticated();

  // Si es la página de login, mostrar solo el children
  // (esto se puede mejorar verificando la ruta actual)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      {authenticated && (
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Panel Admin</h1>
          </div>

          <nav className="mt-6">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Productos
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Categorías
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Pedidos
            </Link>

            <Link
              href="/admin/customers"
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Clientes
            </Link>
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
            <form action={handleLogout}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </form>

            <Link
              href="/"
              className="mt-2 block text-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={authenticated ? 'ml-64' : ''}>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}