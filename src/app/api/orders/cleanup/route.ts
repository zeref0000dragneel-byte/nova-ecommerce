import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { OrderStatus } from '@prisma/client';

/**
 * Endpoint para limpiar órdenes pendientes antiguas (más de 24 horas)
 * Se puede llamar manualmente o configurar como cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que sea una llamada autorizada (opcional: agregar autenticación)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CLEANUP_SECRET || 'cleanup-secret'}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Fecha de hace 24 horas
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Buscar órdenes PENDING antiguas
    const oldPendingOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
      include: {
        items: true,
      },
    });

    let restoredStock = 0;
    let deletedOrders = 0;

    // Restaurar stock y eliminar órdenes
    for (const order of oldPendingOrders) {
      await prisma.$transaction(async (tx) => {
        // Restaurar stock de cada item
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
          restoredStock += item.quantity;
        }

        // Eliminar la orden (los items se eliminan en cascade)
        await tx.order.delete({
          where: { id: order.id },
        });

        deletedOrders++;
      });
    }

    return NextResponse.json({
      success: true,
      message: `Limpieza completada`,
      deletedOrders,
      restoredStock,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error en limpieza de órdenes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al limpiar órdenes' },
      { status: 500 }
    );
  }
}

// GET para ver estadísticas sin ejecutar limpieza
export async function GET(request: NextRequest) {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const oldPendingOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      pendingOrdersToClean: oldPendingOrders.length,
      oldestOrder: oldPendingOrders.length > 0 
        ? oldPendingOrders[oldPendingOrders.length - 1].createdAt 
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
