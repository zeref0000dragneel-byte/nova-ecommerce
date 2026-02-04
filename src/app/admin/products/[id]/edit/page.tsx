import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import VariantsManager from './VariantsManager';

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  });
  
  if (!product) {
    notFound();
  }
  
  return product;
}

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
}

async function updateProduct(formData: FormData) {
  'use server';
  
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string);
  const categoryId = formData.get('categoryId') as string;
  const imageUrl = formData.get('imageUrl') as string | null;

  // Generar slug automáticamente desde el nombre
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // ✅ CORRECTO: Usar relación anidada y array de images
  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      price,
      stock,
      category: {
        connect: { id: categoryId }
      },
      // ✅ Usar images (array) en vez de imageUrl (string)
      images: imageUrl && imageUrl.trim() !== '' ? [imageUrl] : [],
    }
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const product = await getProduct(id);
  const categories = await getCategories();

  // ✅ Obtener la primera imagen del array (o null si está vacío)
  const currentImage = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Editar Producto</h2>
            <p className="text-gray-600 mt-1">Actualiza la información de "{product.name}"</p>
          </div>
        </div>
      </div>

      {/* Current Product Preview */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          {/* ✅ CORREGIDO: Usar currentImage en vez de product.imageUrl */}
          {currentImage ? (
            <img
              src={currentImage}
              alt={product.name}
              className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-white border-2 border-purple-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
            <p className="text-gray-600 text-sm">{product.category.name}</p>
            <p className="text-purple-700 font-semibold mt-1">
              ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Stock actual</p>
            <p className="text-2xl font-bold text-purple-700">{product.stock}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form action={updateProduct} className="bg-white rounded-lg shadow border border-gray-200 p-8 mb-8">
        <input type="hidden" name="id" value={product.id} />
        
        <div className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={product.name}
              className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 text-gray-900"
              placeholder="Ej: iPhone 15 Pro"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={product.description || ''}
              className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 resize-none text-gray-900"
              placeholder="Describe las características principales del producto..."
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block font-medium text-gray-700 mb-2">
                Precio Base (MXN) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={product.price}
                  className="w-full pl-8 pr-4 py-2 border-2 border-gray-300 focus:border-blue-500 rounded-lg text-gray-900"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Las variantes pueden tener precios diferentes
              </p>
            </div>

            <div>
              <label htmlFor="stock" className="block font-medium text-gray-700 mb-2">
                Stock Base (unidades) *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                required
                min="0"
                defaultValue={product.stock}
                className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 text-gray-900"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                El stock de variantes es independiente
              </p>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={product.categoryId}
              className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 bg-white text-gray-900"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block font-medium text-gray-700 mb-2">
              URL de la Imagen Principal (opcional)
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              defaultValue={currentImage ?? ''}
              className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 text-gray-900"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="text-sm text-gray-500 mt-2">
              Las variantes pueden tener sus propias imágenes
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md"
            >
              Guardar Cambios
            </button>
            <Link
              href="/admin/products"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>

      {/* ✅ Gestor de Variantes */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <VariantsManager productId={product.id} basePrice={product.price} />
      </div>

      {/* Warning Card */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm text-yellow-900">
            <p className="font-semibold mb-1">Importante:</p>
            <p className="text-yellow-800">
              Los cambios afectarán la información visible en la tienda inmediatamente. Verifica que toda la información sea correcta antes de guardar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}