import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // ✅ En Next.js 16, experimental se usa para configuraciones experimentales
  experimental: {
    // Aquí van features experimentales si las necesitas
  },

  // ✅ typescript e ignoreBuildErrors ahora están en el nivel raíz
  typescript: {
    ignoreBuildErrors: false,
  },

  // ❌ ELIMINAR: eslint ya no es una propiedad válida en Next.js 16
  // La configuración de ESLint ahora se hace en .eslintrc.json

  compress: true,
  
  poweredByHeader: false,

  // ✅ Encabezados de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
};

export default nextConfig;