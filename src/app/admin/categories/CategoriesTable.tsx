'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
};

type DeleteCategoryAction = (formData: FormData) => Promise<{ ok: boolean; error?: string }>;

export default function CategoriesTable({
  categories,
  deleteCategory,
}: {
  categories: Category[];
  deleteCategory: DeleteCategoryAction;
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
      const result = await deleteCategory(formData);
      if (result.ok) {
        toast.success('Categoría eliminada');
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
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Productos</th>
              <th className="px-4 py-3 text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="group border-b border-zinc-100 hover:bg-zinc-50/30 transition-colors">
                <td className="px-4 py-6">
                  <span className="text-[12px] font-medium text-zinc-950">{category.name}</span>
                </td>
                <td className="px-4 py-6">
                  <span className="text-[12px] font-medium text-zinc-500 font-mono">{category.slug}</span>
                </td>
                <td className="px-4 py-6">
                  <span className="text-[12px] font-medium text-zinc-500">{category._count.products}</span>
                </td>
                <td className="px-4 py-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-30 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded hover:bg-zinc-100"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(category.id)}
                      disabled={category._count.products > 0}
                      className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={category._count.products > 0 ? 'No se puede eliminar: tiene productos' : 'Eliminar'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
