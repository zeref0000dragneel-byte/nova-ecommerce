export const dynamic = 'force-dynamic';

import prisma from "@/app/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import CategoriesTable from "./CategoriesTable";
import ToastFromSearchParams from "../components/ToastFromSearchParams";

async function deleteCategory(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  "use server";
  try {
    const id = formData.get("id") as string;
    if (!id) return { ok: false, error: "ID requerido" };

    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });
    if (productsCount > 0) {
      return { ok: false, error: "No se puede eliminar: tiene productos asociados" };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo eliminar" };
  }
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
  const params = await searchParams;

  return (
    <div>
      <ToastFromSearchParams
        searchParams={params}
        messages={{ created: 'Categoría creada', updated: 'Categoría actualizada', deleted: 'Categoría eliminada' }}
      />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[13px] font-medium text-zinc-950">Categorías</h2>
        <Link
          href="/admin/categories/new"
          className="bg-black text-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors rounded"
        >
          + Nueva
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[12px] font-medium text-zinc-500 mb-3">No hay categorías</p>
          <Link href="/admin/categories/new" className="text-[12px] font-medium text-zinc-950">
            Crear categoría
          </Link>
        </div>
      ) : (
        <CategoriesTable categories={categories} deleteCategory={deleteCategory} />
      )}
    </div>
  );
}