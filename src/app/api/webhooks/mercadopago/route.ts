import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
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
    
    console.log('Webhook recibido:', body);

    // MercadoPago envía notificaciones de tipo "payment"
    if (body.type === 'payment') {
      const paymentId = body.data.id;

      // Obtener información del pago desde MercadoPago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        console.error('Error al obtener datos del pago');
        return NextResponse.json({ error: 'Error al obtener pago' }, { status: 400 });
      }

      const payment = await paymentResponse.json();
      
      console.log('Datos del pago:', payment);

      // Parsear external_reference que contiene los datos del checkout
      let checkoutData;
      try {
        checkoutData = JSON.parse(payment.external_reference || '{}');
      } catch (e) {
        console.error('Error al parsear external_reference:', e);
        // Si no se puede parsear, buscar orden existente (compatibilidad con órdenes antiguas)
        const existingOrder = await prisma.order.findFirst({
          where: { orderNumber: payment.external_reference },
        });

        if (existingOrder && payment.status === 'approved') {
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              status: OrderStatus.PAID,
              paymentMethod: payment.payment_method_id,
              paymentId: payment.id.toString(),
            },
          });
        }
        return NextResponse.json({ success: true });
      }

      // Solo procesar si el pago fue aprobado
      if (payment.status === 'approved') {
        const { customer, items, total, shippingAddress } = checkoutData;

        // Verificar que no exista ya una orden para este pago
        const existingOrder = await prisma.order.findFirst({
          where: { paymentId: payment.id.toString() },
        });

        if (existingOrder) {
          console.log('Orden ya existe para este pago:', payment.id);
          return NextResponse.json({ success: true, message: 'Orden ya procesada' });
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
              city: customer.city,
              state: customer.state,
              zipCode: customer.zipCode,
              latitude: customer.latitude || null,
              longitude: customer.longitude || null,
            },
          });
        } else {
          existingCustomer = await prisma.customer.update({
            where: { email: customer.email },
            data: {
              name: customer.name,
              phone: customer.phone,
              address: customer.address,
              city: customer.city,
              state: customer.state,
              zipCode: customer.zipCode,
              latitude: customer.latitude !== undefined ? customer.latitude : existingCustomer.latitude,
              longitude: customer.longitude !== undefined ? customer.longitude : existingCustomer.longitude,
            },
          });
        }

        const orderNumber = await generateOrderNumber();

        // Crear la orden SOLO cuando el pago sea aprobado
        const order = await prisma.$transaction(async (tx) => {
          // Crear la orden
          const newOrder = await tx.order.create({
            data: {
              orderNumber: orderNumber,
              customerId: existingCustomer.id,
              total: total,
              status: OrderStatus.PAID, // Directamente PAID porque el pago ya fue aprobado
              shippingAddress: shippingAddress || `${customer.address}, ${customer.city}, ${customer.state}, CP: ${customer.zipCode}`,
              paymentMethod: payment.payment_method_id,
              paymentId: payment.id.toString(),
              items: {
                create: items.map((item: any) => ({
                  productId: item.productId,
                  variantId: item.variantId || null,
                  quantity: item.quantity,
                  price: item.price,
                })),
              },
            },
            include: {
              items: {
                include: {
                  product: true,
                  variant: true,
                },
              },
              customer: true,
            },
          });

          // AHORA SÍ descontar el stock (porque el pago fue aprobado)
          for (const item of items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              });
            } else {
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

        console.log(`✅ Orden ${order.orderNumber} creada exitosamente después del pago aprobado`);
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        console.log(`❌ Pago ${payment.id} rechazado o cancelado`);
        // No hacemos nada, simplemente no creamos la orden
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json(
      { error: 'Error al procesar webhook' },
      { status: 500 }
    );
  }
}