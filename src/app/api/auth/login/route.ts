import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Credenciales desde variables de entorno
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'mi-secret-super-seguro-123';

    // Verificar credenciales
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Crear sesión (cookie segura) - Next.js 16 requiere await
      const cookieStore = await cookies();
      cookieStore.set('admin-session', SESSION_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/',
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Inicio de sesión exitoso' 
      });
    }

    return NextResponse.json(
      { success: false, error: 'Credenciales incorrectas' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}