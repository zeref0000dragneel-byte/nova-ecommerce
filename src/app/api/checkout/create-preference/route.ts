import { NextRequest, NextResponse } from 'next/server';
import { preferenceClient, MP_CONFIG } from '@/app/lib/mercadopago';
import { prisma } from '@/app/lib/prisma';

/**
 * Este endpoint crea una preferencia de pago SIN crear la orden todavía
 * La orden se creará SOLO cuando el pago sea aprobado en el webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, total, shippingAddress } = body;

    // Validaciones básicas
    if (!customer || !items || !total) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      );
    }

    // Verificar stock ANTES de crear la preferencia (pero NO descontarlo)
    for (const item of items) {
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (!variant || variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Stock insuficiente para la variante seleccionada` },
            { status: 400 }
          );
        }
      } else {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product || product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Stock insuficiente para ${product?.name || 'el producto'}` },
            { status: 400 }
          );
        }
      }
    }

    // Obtener información completa de productos para MercadoPago
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Crear items para MercadoPago
    const mpItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        id: item.productId,
        title: product?.name || 'Producto',
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'MXN',
      };
    });

    // Crear preferencia de pago
    const preference = await preferenceClient.create({
      body: {
        items: mpItems,
        payer: {
          name: customer.name,
          email: customer.email,
          phone: {
            number: customer.phone || '',
          },
          address: {
            street_name: customer.address || '',
            zip_code: customer.zipCode || '',
          },
        },
        back_urls: {
          success: `${MP_CONFIG.backUrls.success}`,
          failure: `${MP_CONFIG.backUrls.failure}`,
          pending: `${MP_CONFIG.backUrls.pending}`,
        },
        auto_return: 'approved',
        notification_url: MP_CONFIG.notificationUrl,
        // Guardar datos del checkout en external_reference para el webhook
        external_reference: JSON.stringify({
          customer,
          items,
          total,
          shippingAddress,
          timestamp: Date.now(),
        }),
        statement_descriptor: 'MI E-COMMERCE',
      },
    });

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
    });
  } catch (error: any) {
    console.error('Error al crear preferencia:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear preferencia de pago' },
      { status: 500 }
    );
  }
}
