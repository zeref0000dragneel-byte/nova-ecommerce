import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // Obtener la categoría existente
    let category = await prisma.category.findFirst({
      where: { slug: 'electronica' }
    });

    // Si no existe, crearla
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'Electrónica', slug: 'electronica' }
      });
    }

    // Crear productos variados
    const products = await prisma.product.createMany({
      data: [
        {
          name: 'iPhone 15 Pro',
          slug: 'iphone-15-pro',
          description: 'Último modelo de Apple',
          price: 25999.00,
          compareAtPrice: 28999.00,
          stock: 15,
          categoryId: category.id,
          images: ['https://via.placeholder.com/400/0000FF/FFFFFF?text=iPhone'], // <--- ¡CAMBIO!
        },
        {
          name: 'MacBook Air M2',
          slug: 'macbook-air-m2',
          description: 'Laptop ultraligera',
          price: 32999.00,
          stock: 8,
          categoryId: category.id,
          images: ['https://via.placeholder.com/400/FF0000/FFFFFF?text=MacBook'], // <--- ¡CAMBIO!
        },
        {
          name: 'AirPods Pro',
          slug: 'airpods-pro',
          description: 'Audífonos con cancelación de ruido',
          price: 5999.00,
          stock: 25,
          categoryId: category.id,
          images: ['https://via.placeholder.com/400/00FF00/FFFFFF?text=AirPods'], // <--- ¡CAMBIO!
        },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: `${products.count} productos creados`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}