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
  const { items, getTotal } = useCart();
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
            productId: item.productId,
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-8 py-16">
          <ShoppingCart className="w-16 h-16 text-zinc-300 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">
            Tu carrito está vacío
          </h2>
          <p className="text-zinc-500 text-sm mb-8">
            Agrega productos antes de proceder al checkout
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-black text-white px-8 py-5 text-[11px] uppercase tracking-[0.3em] font-medium hover:opacity-90 transition"
          >
            Ir a la Tienda
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = getTotal();
  const shipping = totalPrice >= 500 ? 0 : 99;
  const finalTotal = totalPrice + shipping;

  const ghostInputClass = (error: string | undefined) =>
    `w-full border-b bg-transparent px-1 py-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-black ${
      error ? 'border-red-500' : 'border-zinc-200'
    }`;

  const ghostTextareaClass =
    'w-full border-b border-zinc-200 bg-transparent px-1 py-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-black resize-none';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[calc(100vh-4rem)]">
        {/* Formulario - 2/3 */}
        <div className="lg:col-span-2 bg-white overflow-y-auto">
          <div className="max-w-xl mx-auto px-8 py-16 lg:py-24">
            <h1 className="text-2xl font-bold text-zinc-900 mb-1 tracking-tight">Checkout</h1>
            <p className="text-zinc-500 text-sm mb-12">Completa tu información para finalizar la compra</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900 mb-8">Envío</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Juan Pérez"
                      className={ghostInputClass(errors.name)}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="correo@ejemplo.com"
                        className={ghostInputClass(errors.email)}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-1">Teléfono *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="5512345678"
                        className={ghostInputClass(errors.phone)}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <LocationPicker
                    onLocationSelect={(loc) => {
                      setLocation(loc);
                      if (loc.address) {
                        setFormData((prev) => ({ ...prev, address: loc.address }));
                      }
                    }}
                    initialAddress={formData.address}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}

                  <div>
                    <label className="block text-sm font-medium text-zinc-600 mb-1">Dirección Manual (si no usaste el selector)</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Calle Example #123, Col. Centro"
                      className={ghostInputClass(errors.address)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-1">Ciudad *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Ciudad de México"
                        className={ghostInputClass(errors.city)}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-1">Estado *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="CDMX"
                        className={ghostInputClass(errors.state)}
                      />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-1">C.P. *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        maxLength={5}
                        placeholder="06000"
                        className={ghostInputClass(errors.zipCode)}
                      />
                      {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-600 mb-1">Notas del Pedido (Opcional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Instrucciones especiales de entrega..."
                      className={ghostTextareaClass}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900 mb-8">Pago</h2>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-5 text-[11px] uppercase tracking-[0.3em] font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              </section>
            </form>
          </div>
        </div>

        {/* Resumen del Pedido - 1/3 sticky */}
        <div className="lg:col-span-1 bg-zinc-50">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <div className="p-8 lg:p-12">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900 mb-8">Resumen del Pedido</h2>

              <div className="space-y-0">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId || 'base'}`}
                    className="flex gap-4 py-4 border-b border-[0.5px] border-zinc-100 first:pt-0 last:border-b-0"
                  >
                    {item.image && (
                      <div className="relative w-16 h-16 flex-shrink-0 bg-zinc-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                      {(item.color || item.size) && (
                        <p className="text-xs text-zinc-500 mt-0.5">{[item.color, item.size].filter(Boolean).join(' · ')}</p>
                      )}
                      <p className="text-xs text-zinc-500 mt-0.5">Cantidad: {item.quantity}</p>
                      <p className="text-sm font-semibold text-zinc-900 mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 mt-6 border-t border-[0.5px] border-zinc-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-medium text-zinc-900">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Envío</span>
                  <span className="font-medium text-zinc-900">
                    {shipping === 0 ? (
                      <span className="text-zinc-500">Gratis</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {totalPrice < 500 && (
                  <p className="text-xs text-zinc-400">Envío gratis en compras mayores a $500.00</p>
                )}
                <div className="flex justify-between pt-4 mt-2">
                  <span className="text-sm font-bold text-zinc-900">Total</span>
                  <span className="text-sm font-bold text-zinc-900">${finalTotal.toFixed(2)} MXN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}