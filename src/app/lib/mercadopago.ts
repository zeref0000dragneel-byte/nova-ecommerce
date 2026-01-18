// src/app/lib/mercadopago.ts
import { MercadoPagoConfig, Preference } from 'mercadopago';

// ✅ VERIFICACIÓN: Asegurarse de que las variables existen
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// 🚨 LOG DE DEBUGGING (temporal - remover después)
console.log('🔍 MercadoPago Config Check:');
console.log('- Access Token exists:', !!accessToken);
console.log('- Public Key exists:', !!publicKey);
console.log('- Base URL:', baseUrl);
console.log('- Access Token starts with:', accessToken?.substring(0, 15));

if (!accessToken) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado');
}

if (!publicKey) {
  throw new Error('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no está configurado');
}

if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_BASE_URL no está configurado');
}

// Configuración del cliente de MercadoPago
const client = new MercadoPagoConfig({
  accessToken: accessToken,
  options: {
    timeout: 10000, // Aumentado a 10 segundos
  },
});

// Instancia de Preference
export const preferenceClient = new Preference(client);

// Configuración base
export const MP_CONFIG = {
  publicKey: publicKey,
  backUrls: {
    success: `${baseUrl}/checkout/success`,
    failure: `${baseUrl}/checkout/failure`,
    pending: `${baseUrl}/checkout/pending`,
  },
  notificationUrl: `${baseUrl}/api/webhooks/mercadopago`,
};

// 🚨 LOG DE DEBUGGING (temporal - remover después)
console.log('✅ MercadoPago Config Loaded:');
console.log('- Back URLs:', MP_CONFIG.backUrls);