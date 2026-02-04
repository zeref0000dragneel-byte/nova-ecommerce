export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

async function deleteProduct(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  
  await prisma.product.delete({
    where: { id },
  });
  
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Productos</h2>
          <p className="font-medium text-gray-600 mt-2">Gestiona tu catálogo de productos</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </Link>
      </div>

      {/* Stats - Premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg hover:shadow-2xl p-8 border border-slate-200 border-t-4 border-t-blue-500 transition-all duration-300 hover:-translate-y-1">
          <p className="font-medium text-gray-600">Total Productos</p>
          <p className="text-4xl font-bold tracking-tighter text-gray-900 mt-2">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg hover:shadow-2xl p-8 border border-slate-200 border-t-4 border-t-green-500 transition-all duration-300 hover:-translate-y-1">
          <p className="font-medium text-gray-600">En Stock</p>
          <p className="text-4xl font-bold tracking-tighter text-green-600 mt-2">
            {products.filter(p => p.stock > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg hover:shadow-2xl p-8 border border-slate-200 border-t-4 border-t-red-500 transition-all duration-300 hover:-translate-y-1">
          <p className="font-medium text-gray-600">Sin Stock</p>
          <p className="text-4xl font-bold tracking-tighter text-red-600 mt-2">
            {products.filter(p => p.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Products Table - Premium */}
      <div className="bg-white rounded-lg shadow-xl p-8 m-6 border border-slate-200 overflow-hidden transition-all duration-300">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600 mb-6">Comienza creando tu primer producto</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Producto
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 font-semibold text-gray-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  // ✅ Obtener la primera imagen del array
                  const productImage = product.images && product.images.length > 0 ? product.images[0] : null;
                  
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 hover:shadow-md"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={product.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border border-purple-200/50">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-semibold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {product.stock} unidades
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {product.stock > 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Agotado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:brightness-110 text-white px-3 py-1.5 rounded-md text-sm inline-flex items-center transition-all duration-200 shadow-md hover:scale-105 hover:shadow-lg"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <form action={deleteProduct} className="inline">
                            <input type="hidden" name="id" value={product.id} />
                            <button
                              type="submit"
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:brightness-110 text-white px-3 py-1.5 rounded-md text-sm inline-flex items-center transition-all duration-200 shadow-md hover:scale-105 hover:shadow-lg"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}