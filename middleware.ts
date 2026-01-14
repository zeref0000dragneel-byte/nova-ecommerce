import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'mi-secret-super-seguro-123';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas de admin que necesitan protección
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';

  if (isAdminRoute) {
    // Verificar si hay sesión de admin
    const adminToken = request.cookies.get('admin-session')?.value;

    if (!adminToken || adminToken !== ADMIN_SESSION_SECRET) {
      // Redirigir a login si no está autenticado
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configurar qué rutas debe interceptar el middleware
export const config = {
  matcher: '/admin/:path*',
};

