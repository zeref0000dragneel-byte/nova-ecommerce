import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET: Obtener variantes de un producto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error('Error al obtener variantes:', error);
    return NextResponse.json(
      { error: 'Error al obtener variantes' },
      { status: 500 }
    );
  }
}

// POST: Crear nueva variante
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { color, size, sku, price, stock, images } = body;

    // Validaciones
    if (!color && !size) {
      return NextResponse.json(
        { error: 'Debe especificar al menos color o talla' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Crear la variante
    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        color: color || null,
        size: size || null,
        sku: sku || null,
        price: price ? parseFloat(price) : null,
        stock: stock ? parseInt(stock) : 0,
        images: Array.isArray(images) ? images.filter((u: string) => typeof u === 'string') : [],
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error('Error al crear variante:', error);
    return NextResponse.json(
      { error: 'Error al crear variante' },
      { status: 500 }
    );
  }
}