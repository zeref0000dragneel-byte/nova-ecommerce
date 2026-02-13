'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Upload, Loader2, Plus, Trash2 } from 'lucide-react';

interface SpecItem {
  attribute: string;
  value: string;
}

interface EditProductFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    images: string[];
    specs: unknown;
    categoryId: string;
    category: { id: string; name: string };
  };
  categories: { id: string; name: string }[];
}

export default function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    price: product.price,
    comparePrice: product.compareAtPrice || '',
    stock: product.stock,
    categoryId: product.categoryId,
  });
  const [images, setImages] = useState<string[]>(product.images || []);
  const rawSpecs = product.specs as SpecItem[] | null;
  const initialSpecs: SpecItem[] =
    Array.isArray(rawSpecs) && rawSpecs.length > 0
      ? rawSpecs.map((s) => ({
          attribute: typeof s?.attribute === 'string' ? s.attribute : '',
          value: typeof s?.value === 'string' ? s.value : '',
        }))
      : [];
  const [specs, setSpecs] = useState<SpecItem[]>(initialSpecs);

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
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(String(formData.price)),
          comparePrice: formData.comparePrice ? parseFloat(String(formData.comparePrice)) : null,
          stock: parseInt(String(formData.stock)),
          images,
          specs: validSpecs.length > 0 ? validSpecs : null,
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      toast.success('Producto actualizado');
      router.push('/admin/products?toast=updated');
      router.refresh();
    } catch {
      toast.error('Error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full max-w-md border border-zinc-200 rounded px-3 py-2 text-[12px] font-medium text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400';
  const labelClass = 'text-[12px] font-medium text-zinc-500 w-32 shrink-0 pt-2';

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        {/* General */}
        <div className="border-b border-zinc-100 pb-6 mb-6">
          <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-4">General</h3>
          <div className="space-y-4">
            <div className="flex gap-6">
              <label className={labelClass}>Nombre</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Nombre del producto"
              />
            </div>
            <div className="flex gap-6">
              <label className={labelClass}>Descripción</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Descripción breve"
              />
            </div>
            <div className="flex gap-6">
              <label className={labelClass}>Categoría</label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="">Seleccionar</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Precio & Stock */}
        <div className="border-b border-zinc-100 pb-6 mb-6">
          <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-4">Precio & Stock</h3>
          <div className="space-y-4">
            <div className="flex gap-6">
              <label className={labelClass}>Precio (MXN)</label>
              <div className="flex gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-[12px] text-zinc-500">$</span>
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    min={0}
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-7`}
                  />
                </div>
                <input
                  type="number"
                  name="comparePrice"
                  step="0.01"
                  min={0}
                  value={formData.comparePrice}
                  onChange={handleInputChange}
                  className={`${inputClass} flex-1`}
                  placeholder="Comparativo"
                />
              </div>
            </div>
            <div className="flex gap-6">
              <label className={labelClass}>Stock</label>
              <input
                type="number"
                name="stock"
                required
                min={0}
                value={formData.stock}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="border-b border-zinc-100 pb-6 mb-6">
          <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-4">Imágenes</h3>
          <div className="flex gap-6">
            <label className={labelClass}>Fotos</label>
            <div className="flex-1 max-w-md">
              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-14 h-14 rounded object-cover border border-zinc-200" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-900 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label
                htmlFor="imageUpload"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded text-[12px] font-medium text-zinc-500 hover:text-zinc-950 hover:border-zinc-300 cursor-pointer transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingImage ? 'Subiendo...' : 'Subir'}
              </label>
              <input id="imageUpload" type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
            </div>
          </div>
        </div>

        {/* Especificaciones */}
        <div className="border-b border-zinc-100 pb-6 mb-6">
          <div className="flex gap-6 mb-4">
            <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider w-32 shrink-0">Specs</h3>
            <button
              type="button"
              onClick={addSpec}
              className="text-[12px] font-medium text-zinc-500 hover:text-zinc-950 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </button>
          </div>
          <div className="space-y-2 pl-[9.5rem] max-w-md">
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Atributo"
                  value={spec.attribute}
                  onChange={(e) => updateSpec(i, 'attribute', e.target.value)}
                  className="flex-1 border border-zinc-200 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
                <input
                  type="text"
                  placeholder="Valor"
                  value={spec.value}
                  onChange={(e) => updateSpec(i, 'value', e.target.value)}
                  className="flex-1 border border-zinc-200 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
                <button type="button" onClick={() => removeSpec(i)} className="p-1.5 text-zinc-400 hover:text-zinc-950">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-zinc-950 text-white text-[12px] font-medium rounded hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <Link
            href="/admin/products"
            className="px-4 py-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
