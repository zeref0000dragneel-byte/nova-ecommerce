import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/products - Listar todos los productos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId } : {},
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products - Crear producto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      stock,
      imageUrl,
      images,
      specs,
      categoryId,
    } = body;

    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const imageList = Array.isArray(images) && images.length > 0
      ? images.filter((u: string) => typeof u === 'string')
      : imageUrl ? [imageUrl] : [];

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        compareAtPrice: comparePrice ? parseFloat(comparePrice) : null,
        images: imageList,
        specs: Array.isArray(specs) && specs.length > 0 ? specs : undefined,
        stock: parseInt(stock) || 0,
        categoryId,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}