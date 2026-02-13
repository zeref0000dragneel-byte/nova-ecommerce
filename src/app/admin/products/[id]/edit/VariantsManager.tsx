'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Loader2, Upload } from 'lucide-react';

interface Variant {
  id: string;
  color: string | null;
  size: string | null;
  sku: string | null;
  price: number | null;
  stock: number;
  images: string[];
  isActive: boolean;
}

interface Props {
  productId: string;
  basePrice: number;
}

export default function VariantsManager({ productId, basePrice }: Props) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    color: '',
    size: '',
    sku: '',
    price: '',
    stock: '0',
    images: [] as string[],
    isActive: true,
  });

  // Cargar variantes
  useEffect(() => {
    loadVariants();
  }, [productId]);

  const loadVariants = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/variants`);
      const data = await response.json();
      setVariants(data);
    } catch (error) {
      console.error('Error al cargar variantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
      if (newUrls.length > 0) {
        alert(`✅ ${newUrls.length} imagen(es) subida(s) correctamente`);
      }
    } catch {
      alert('❌ Error al subir imagen(es)');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.color && !formData.size) {
      alert('Debes especificar al menos color o talla');
      return;
    }

    try {
      const url = editingId
        ? `/api/products/${productId}/variants/${editingId}`
        : `/api/products/${productId}/variants`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar variante');

      alert(`✅ Variante ${editingId ? 'actualizada' : 'creada'} correctamente`);
      resetForm();
      loadVariants();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar variante');
    }
  };

  const handleEdit = (variant: Variant) => {
    const variantImages = Array.isArray(variant.images) ? variant.images : [];
    setFormData({
      color: variant.color || '',
      size: variant.size || '',
      sku: variant.sku || '',
      price: variant.price?.toString() || '',
      stock: variant.stock.toString(),
      images: [...variantImages],
      isActive: variant.isActive,
    });
    setEditingId(variant.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta variante?')) return;

    try {
      const response = await fetch(`/api/products/${productId}/variants/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar');

      alert('✅ Variante eliminada');
      loadVariants();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al eliminar variante');
    }
  };

  const resetForm = () => {
    setFormData({
      color: '',
      size: '',
      sku: '',
      price: '',
      stock: '0',
      images: [],
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Variantes</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[12px] font-medium text-zinc-500 hover:text-zinc-950"
        >
          {showForm ? '− Cerrar' : '+ Nueva variante'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-zinc-50/50 rounded border border-zinc-100">
          <h4 className="text-[12px] font-medium text-zinc-950 mb-4">
            {editingId ? 'Editar variante' : 'Nueva variante'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 text-zinc-900"
                placeholder="Ej: Rojo, Azul, Negro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Talla
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 text-zinc-900"
                placeholder="Ej: S, M, L, XL"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                SKU (Código único)
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 text-zinc-900"
                placeholder="PROD-COLOR-TALLA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Precio (opcional)
              </label>
              <input
                type="number"
                name="price"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 text-zinc-900"
                placeholder={`Base: $${basePrice}`}
              />
              <p className="text-xs text-zinc-500 mt-1">
                Si no especificas, usa ${basePrice}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                required
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 text-zinc-900"
              />
            </div>
          </div>

          {/* Imágenes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Imágenes de la variante
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.images.map((url, i) => (
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
              htmlFor={`variantImage-${editingId || 'new'}`}
              className={`inline-flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-sm cursor-pointer hover:bg-zinc-100 transition-colors ${
                uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploadingImage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              {uploadingImage ? 'Subiendo...' : 'Subir imagen(es)'}
            </label>
            <input
              id={`variantImage-${editingId || 'new'}`}
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

          {/* Activo */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-400"
              />
              <span className="text-sm font-medium text-zinc-700">
                Variante activa (visible en tienda)
              </span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploadingImage}
              className="bg-black text-white px-6 py-2 rounded-sm hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? 'Actualizar' : 'Crear'} Variante
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border border-zinc-200 bg-transparent text-zinc-700 px-6 py-2 rounded-sm hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de Variantes */}
      {variants.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[12px] font-medium text-zinc-500">No hay variantes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className={`border rounded-sm p-4 ${
                variant.isActive ? 'bg-white border-zinc-200' : 'bg-zinc-50 border-zinc-300 opacity-60'
              }`}
            >
              {variant.images?.length > 0 && (
                <img
                  src={variant.images[0]}
                  alt={`${variant.color} ${variant.size}`}
                  className="w-full h-32 object-cover rounded-sm border border-zinc-200 mb-3"
                />
              )}

              <div className="space-y-2">
                {variant.color && (
                  <p className="text-sm text-zinc-900">
                    <span className="font-semibold">Color:</span> {variant.color}
                  </p>
                )}
                {variant.size && (
                  <p className="text-sm text-zinc-900">
                    <span className="font-semibold">Talla:</span> {variant.size}
                  </p>
                )}
                {variant.sku && (
                  <p className="text-xs text-zinc-600">SKU: {variant.sku}</p>
                )}
                <p className="text-sm text-zinc-900">
                  <span className="font-semibold">Precio:</span> $
                  {(variant.price || basePrice).toFixed(2)}
                </p>
                <p className="text-sm text-zinc-900">
                  <span className="font-semibold">Stock:</span> {variant.stock} unidades
                </p>
                {!variant.isActive && (
                  <p className="text-xs text-zinc-500 font-semibold">INACTIVA</p>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(variant)}
                  className="flex-1 bg-black text-white px-3 py-2 rounded-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(variant.id)}
                  className="border border-zinc-200 bg-transparent text-zinc-700 px-3 py-2 rounded-sm hover:bg-zinc-50 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}