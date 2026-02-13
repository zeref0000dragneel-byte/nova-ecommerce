'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, Loader2, Plus, Trash2 } from 'lucide-react';

interface SpecItem {
  attribute: string;
  value: string;
}

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    comparePrice: '',
    stock: '',
    categoryId: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<SpecItem[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Error al subir');
        const data = await res.json();
        newUrls.push(data.url);
      }
      setImages((prev) => [...prev, ...newUrls]);
      if (newUrls.length > 0) {
        toast.success(`${newUrls.length} imagen(es) subida(s)`);
      }
    } catch {
      toast.error('Error al subir imagen(es)');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => {
    setSpecs((prev) => [...prev, { attribute: '', value: '' }]);
  };

  const updateSpec = (index: number, field: 'attribute' | 'value', value: string) => {
    setSpecs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const removeSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validSpecs = specs.filter((s) => s.attribute.trim() && s.value.trim());
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
          stock: parseInt(formData.stock),
          images: images.length > 0 ? images : undefined,
          imageUrl: images[0] || undefined,
          specs: validSpecs.length > 0 ? validSpecs : undefined,
        }),
      });
      if (!res.ok) throw new Error('Error al crear');
      const result = await res.json();
      if (!result.success || !result.data?.id) throw new Error('Respuesta inválida');
      toast.success('Producto creado');
      router.push(`/admin/products/${result.data.id}/edit`);
    } catch {
      toast.error('Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-[13px] font-medium text-zinc-950 mb-6">Nuevo producto</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-zinc-500 mb-1">Nombre *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-zinc-200 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded-sm px-4 py-2 text-zinc-900 bg-white"
              placeholder="Ej: Vestido de Seda"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-500 mb-1">Slug *</label>
            <input
              type="text"
              name="slug"
              required
              value={formData.slug}
              onChange={handleInputChange}
              className="w-full border border-zinc-200 rounded px-3 py-2 text-[12px] bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              placeholder="Se genera automáticamente"
            />
            <p className="text-xs text-zinc-500 mt-1">
              URL: /shop/{formData.slug || 'slug-del-producto'}
            </p>
          </div>

          <div>
            <label className="block font-medium text-zinc-900 mb-2">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-zinc-200 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded-sm px-4 py-2 text-zinc-900 bg-white"
              placeholder="Descripción detallada del producto..."
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-900 mb-2">Categoría *</label>
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full border border-zinc-200 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded-sm px-4 py-2 bg-white text-zinc-900"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-zinc-900 mb-2">Precio Base *</label>
              <input
                type="number"
                name="price"
                required
                step="0.01"
                min={0}
                value={formData.price}
                onChange={handleInputChange}
                className="w-full border border-zinc-200 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded-sm px-4 py-2 text-zinc-900 bg-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-900 mb-2">Precio Comparativo</label>
              <input
                type="number"
                name="comparePrice"
                step="0.01"
                min={0}
                value={formData.comparePrice}
                onChange={handleInputChange}
                className="w-full border border-zinc-200 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded-sm px-4 py-2 text-zinc-900 bg-white"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-900 mb-2">Stock Base *</label>
            <input
              type="number"
              name="stock"
              required
              min={0}
              value={formData.stock}
              onChange={handleInputChange}
              className="w-full border border-zinc-200 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded-sm px-4 py-2 text-zinc-900 bg-white"
              placeholder="0"
            />
          </div>

          {/* Imágenes múltiples */}
          <div>
            <label className="block font-medium text-zinc-900 mb-2">Imágenes del Producto</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${i + 1}`}
                    className="w-24 h-24 object-cover rounded-sm border border-zinc-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <label
              htmlFor="imageUpload"
              className={`inline-flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-sm cursor-pointer hover:bg-zinc-50 transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {uploadingImage ? 'Subiendo...' : 'Subir imagen(es) a Cloudinary'}
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
            <p className="text-xs text-zinc-500 mt-2">
              JPG, PNG, WebP. Máx. 5MB. Puedes subir varias imágenes.
            </p>
          </div>

          {/* Especificaciones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-zinc-900">Especificaciones</label>
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center gap-1 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Key (ej: Material)"
                    value={spec.attribute}
                    onChange={(e) => updateSpec(i, 'attribute', e.target.value)}
                    className="flex-1 border border-zinc-200 rounded-sm px-3 py-2 text-sm text-zinc-900 bg-white focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                  <input
                    type="text"
                    placeholder="Value (ej: Aluminio)"
                    value={spec.value}
                    onChange={(e) => updateSpec(i, 'value', e.target.value)}
                    className="flex-1 border border-zinc-200 rounded-sm px-3 py-2 text-sm text-zinc-900 bg-white focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {specs.length === 0 && (
                <p className="text-sm text-zinc-500">Agrega especificaciones (Material, Peso, etc.)</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-zinc-100">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-4 py-2 bg-zinc-950 text-white text-[12px] font-medium rounded hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              disabled={loading || uploadingImage}
              className="px-4 py-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-950 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
