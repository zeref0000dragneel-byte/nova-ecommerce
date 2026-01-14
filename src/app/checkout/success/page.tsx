'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const paymentId = searchParams.get('payment_id');
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    
    if (!paymentId) {
      router.push('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        // Buscar la orden por paymentId
        const response = await fetch(`/api/orders?paymentId=${paymentId}`);
        if (response.ok) {
          const orders = await response.json();
          if (orders.length > 0) {
            setOrder(orders[0]);
            
            // Limpiar carrito solo si la orden fue encontrada y pagada
            clearCart();
            
            // Limpiar datos de checkout
            const checkoutData = localStorage.getItem('checkout_data');
            if (checkoutData) {
              localStorage.removeItem('checkout_data');
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar pedido:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [paymentId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Tu pago ha sido procesado correctamente
          </p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Pedido #{order.orderNumber}
                </h2>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-gray-900">
                    ${order.total.toFixed(2)} MXN
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estado:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Método de pago:</span>
                  <span className="font-medium text-gray-900">
                    {order.paymentMethod || 'MercadoPago'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 mb-6">
            <p>Recibirás un email de confirmación en breve.</p>
            <p>Tu pedido será procesado y enviado pronto.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/shop')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Seguir Comprando
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}