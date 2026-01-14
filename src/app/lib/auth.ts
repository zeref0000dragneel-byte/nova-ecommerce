import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'mi-secret-super-seguro-123';

/**
 * Verifica si el usuario está autenticado como admin
 * @returns true si está autenticado, false en caso contrario
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin-session')?.value;
  return adminToken === ADMIN_SESSION_SECRET;
}

/**
 * Verifica la autenticación y redirige a login si no está autenticado
 * @param pathname Ruta actual para redirección después del login
 */
export async function requireAuth(pathname?: string): Promise<void> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin-session')?.value;
  
  if (!adminToken || adminToken !== ADMIN_SESSION_SECRET) {
    const loginUrl = `/admin/login${pathname ? `?redirect=${pathname}` : ''}`;
    redirect(loginUrl);
  }
}

/**
 * Obtiene el token de sesión de admin
 */
export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('admin-session')?.value;
}

/**
 * Elimina la sesión de admin (logout)
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-session');
}
