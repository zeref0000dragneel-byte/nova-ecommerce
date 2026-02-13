'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  category: { name: string };
};

type DeleteProductAction = (formData: FormData) => Promise<{ ok: boolean; error?: string }>;

export default function ProductsTable({
  products,
  deleteProduct,
}: {
  products: Product[];
  deleteProduct: DeleteProductAction;
}) {
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!confirmingId) return;
    setDeleting(true);
    try {
      const formData = new FormData();
      formData.set('id', confirmingId);
      const result = await deleteProduct(formData);
      if (result.ok) {
        toast.success('Producto eliminado');
        setConfirmingId(null);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Error al eliminar');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg border border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50/80">
            <tr className="border-b border-zinc-100">
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-24">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const productImage = product.images?.length ? product.images[0] : null;
              return (
                <tr
                  key={product.id}
                  className="group border-b border-zinc-100 transition-colors hover:bg-zinc-50/30"
                >
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      {productImage ? (
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-100 shrink-0">
                          <img
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-zinc-100 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-[12px] font-medium text-zinc-950">{product.name}</p>
                        <p className="text-[11px] text-zinc-500 line-clamp-1">{product.description ?? ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <span className="text-[12px] font-medium text-zinc-500">{product.category.name}</span>
                  </td>
                  <td className="px-4 py-6">
                    <span className="text-[12px] font-medium text-zinc-950">
                      ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    <span className="text-[12px] font-medium text-zinc-500">{product.stock}</span>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-30 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded hover:bg-zinc-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(product.id)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded hover:bg-zinc-100 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!confirmingId}
        onClose={() => setConfirmingId(null)}
        onConfirm={handleConfirmDelete}
        title="¿Estás seguro?"
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </>
  );
}
