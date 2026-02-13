import { prisma } from '@/app/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EditProductForm from './EditProductForm';
import VariantsManager from './VariantsManager';

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  return product;
}

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  const categories = await getCategories();

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/admin/products"
          className="p-1 -ml-1 text-zinc-500 hover:text-zinc-950"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h2 className="text-[13px] font-medium text-zinc-950">{product.name}</h2>
      </div>

      <EditProductForm product={product} categories={categories} />

      <div className="mt-8 pt-8 border-t border-zinc-100">
        <VariantsManager productId={product.id} basePrice={product.price} />
      </div>
    </div>
  );
}
