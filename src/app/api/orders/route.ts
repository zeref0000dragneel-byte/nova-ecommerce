import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { OrderStatus } from '@prisma/client';

async function generateOrderNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const ordersThisMonth = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfMonth,
      },
    },
  });
  
  const sequence = (ordersThisMonth + 1).toString().padStart(4, '0');
  return `ORD-${year}${month}-${sequence}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, total } = body;

    if (!customer || !items || !total) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
      return NextResponse.json(
        { error: 'Información del cliente incompleta' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      );
    }

    // Crear o encontrar cliente
    let existingCustomer = await prisma.customer.findUnique({
      where: { email: customer.email },
    });

    if (!existingCustomer) {
      existingCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        },
      });
    } else {
      existingCustomer = await prisma.customer.update({
        where: { email: customer.email },
        data: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
        },
      });
    }

    // ✅ NUEVO: Verificar stock de productos Y variantes
    for (const item of items) {
      if (item.variantId) {
        // Verificar stock de variante
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant) {
          return NextResponse.json(
            { error: `Variante no encontrada` },
            { status: 404 }
          );
        }

        if (variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Stock insuficiente para la variante seleccionada` },
            { status: 400 }
          );
        }
      } else {
        // Verificar stock de producto base
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return NextResponse.json(
            { error: `Producto ${item.productId} no encontrado` },
            { status: 404 }
          );
        }

        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Stock insuficiente para ${product.name}` },
            { status: 400 }
          );
        }
      }
    }

    const orderNumber = await generateOrderNumber();

    // ✅ NUEVO: Crear orden con variantes
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: orderNumber,
          customerId: existingCustomer.id,
          total: total,
          status: OrderStatus.PENDING,
          shippingAddress: customer.address,
          items: {
            create: items.map((item: { 
              productId: string; 
              variantId?: string | null; 
              quantity: number; 
              price: number 
            }) => ({
              productId: item.productId,
              variantId: item.variantId || null, // ✅ NUEVO: Guardar variantId
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
              variant: true, // ✅ NUEVO: Incluir variante
            },
          },
          customer: true,
        },
      });

      // ✅ NUEVO: Actualizar stock de productos o variantes
      for (const item of items) {
        if (item.variantId) {
          // Actualizar stock de variante
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        } else {
          // Actualizar stock de producto base
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json(
      {
        message: 'Pedido creado exitosamente',
        order: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const paymentId = searchParams.get('paymentId');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status as OrderStatus;
    }
    
    if (paymentId) {
      where.paymentId = paymentId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}