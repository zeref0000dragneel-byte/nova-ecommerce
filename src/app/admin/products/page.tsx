export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import ProductsTable from './ProductsTable';
import ToastFromSearchParams from '../components/ToastFromSearchParams';

async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return products;
}

async function deleteProduct(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  'use server';
  try {
    const id = formData.get('id') as string;
    if (!id) return { ok: false, error: 'ID requerido' };
    await prisma.product.delete({ where: { id } });
    revalidatePath('/admin/products');
    return { ok: true };
  } catch {
    return { ok: false, error: 'No se pudo eliminar' };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const products = await getProducts();
  const params = await searchParams;

  return (
    <div>
      <ToastFromSearchParams
        searchParams={params}
        messages={{ created: 'Producto creado', updated: 'Producto actualizado', deleted: 'Producto eliminado' }}
      />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[13px] font-medium text-zinc-950">Productos</h2>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors rounded"
        >
          + Nuevo
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[12px] font-medium text-zinc-500 mb-3">No hay productos</p>
          <Link
            href="/admin/products/new"
            className="text-[12px] font-medium text-zinc-950 hover:text-zinc-700"
          >
            Crear producto
          </Link>
        </div>
      ) : (
        <ProductsTable products={products} deleteProduct={deleteProduct} />
      )}
    </div>
  );
}