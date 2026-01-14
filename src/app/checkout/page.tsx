'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, CreditCard, Loader2 } from 'lucide-react';
import Image from 'next/image';
import LocationPicker from '@/components/LocationPicker';
import Header from '@/components/Header';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [location, setLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Teléfono inválido (10 dígitos)';
    }
    // Validar dirección (puede venir del LocationPicker o manual)
    if (!location && !formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }
    if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';
    if (!formData.state.trim()) newErrors.state = 'El estado es requerido';
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'El código postal es requerido';
    } else if (!/^\d{5}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Código postal inválido (5 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;
    
    if (!items || items.length === 0) {
      alert('El carrito está vacío');
      router.push('/cart');
      return;
    }

    setLoading(true);

    try {
      // Usar dirección del LocationPicker si está disponible, sino usar la manual
      const finalAddress = location?.address || formData.address;
      const shippingAddress = location
        ? `${finalAddress}, ${formData.city}, ${formData.state}, CP: ${formData.zipCode}`
        : `${formData.address}, ${formData.city}, ${formData.state}, CP: ${formData.zipCode}`;

      // Crear preferencia de pago SIN crear la orden todavía
      const preferenceResponse = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            ...formData,
            address: finalAddress,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            latitude: location?.lat || undefined,
            longitude: location?.lng || undefined,
          },
          items: items.map((item) => ({
            productId: item.id,
            variantId: item.variantId || null,
            quantity: item.quantity,
            price: item.price,
          })),
          total: finalTotal,
          shippingAddress: shippingAddress,
          notes: formData.notes,
        }),
      });

      if (!preferenceResponse.ok) {
        const errorData = await preferenceResponse.json();
        throw new Error(errorData.error || 'Error al crear preferencia de pago');
      }

      const { initPoint } = await preferenceResponse.json();

      // Guardar datos del checkout en localStorage por si el usuario regresa
      localStorage.setItem('checkout_data', JSON.stringify({
        customer: formData,
        items: items,
        timestamp: Date.now(),
      }));

      // Redirigir directamente a MercadoPago
      window.location.href = initPoint;
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Hubo un error al procesar tu pedido. Intenta de nuevo.');
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            Agrega productos antes de proceder al checkout
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Ir a la Tienda
          </button>
        </div>
      </div>
    );
  }

  const shipping = totalPrice >= 500 ? 0 : 99;
  const finalTotal = totalPrice + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Completa tu información para finalizar la compra</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-600" />
                Información de Envío
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="5512345678"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Selector de Ubicación con Google Maps */}
                <LocationPicker
                  onLocationSelect={(loc) => {
                    setLocation(loc);
                    // Extraer ciudad y estado de la dirección si es posible
                    if (loc.address) {
                      setFormData((prev) => ({
                        ...prev,
                        address: loc.address,
                      }));
                    }
                  }}
                  initialAddress={formData.address}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}

                {/* Campo de dirección manual (fallback) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección Manual (si no usaste el selector)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Calle Example #123, Col. Centro"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all ${
                      errors.address ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ciudad de México"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="CDMX"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      C.P. *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      maxLength={5}
                      placeholder="06000"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas del Pedido (Opcional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Instrucciones especiales de entrega..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Continuar al Pago
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 sticky top-24 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                Resumen del Pedido
              </h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variantId || 'base'}`} className="flex gap-3">
                    {/* ✅ NUEVO: Imagen */}
                    {item.imageUrl && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      {/* ✅ NUEVO: Mostrar variante */}
                      {item.variantDetails && (
                        <p className="text-xs text-gray-600">{item.variantDetails}</p>
                      )}
                      <p className="text-xs text-gray-600">Cantidad: {item.quantity}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600 font-semibold">GRATIS</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {totalPrice < 500 && (
                  <p className="text-xs text-gray-500">
                    Envío gratis en compras mayores a $500.00
                  </p>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${finalTotal.toFixed(2)} MXN
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}