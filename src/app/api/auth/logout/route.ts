import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Eliminar cookie de sesión - Next.js 16 requiere await
    const cookieStore = await cookies();
    cookieStore.delete('admin-session');

    return NextResponse.json({ 
      success: true, 
      message: 'Sesión cerrada' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}