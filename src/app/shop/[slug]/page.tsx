import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import ProductDetailClient from './ProductDetailClient';
import Header from '@/components/Header';

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { 
      slug,
      isActive: true 
    },
    include: {
      category: true,
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!product) {
    notFound();
  }

  return product;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
  const images = product.images || [];

  const rawSpecs = product.specs as { attribute: string; value: string }[] | null;
  const specs =
    Array.isArray(rawSpecs) && rawSpecs.length > 0
      ? rawSpecs.filter((s) => s?.attribute && s?.value)
      : undefined;

  const transformedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    comparePrice: product.compareAtPrice,
    stock: product.stock,
    imageUrl,
    images,
    specs,
    category: {
      id: product.category.id,
      name: product.category.name,
    },
    variants: product.variants.map(variant => ({
      id: variant.id,
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      images: variant.images || [],
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductDetailClient product={transformedProduct} />
      </main>
    </div>
  );
}

// ✅ Generar metadata dinámica
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  try {
    const product = await getProduct(slug);
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;

    return {
      title: `${product.name} - Mi Tienda`,
      description: product.description || `Compra ${product.name} en nuestra tienda`,
      openGraph: imageUrl ? {
        images: [imageUrl],
      } : undefined,
    };
  } catch {
    return {
      title: 'Producto no encontrado - Mi Tienda',
    };
  }
}