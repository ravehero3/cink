'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusMessage from '@/components/admin/StatusMessage';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PRODUCT_TYPES = ['TRIKO', 'MIKINA', 'KRAŤASY', 'KALHOTY', 'CD'] as const;

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<Record<string, number>>(
    SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    color: '',
    videoUrl: '',
    isVisible: true,
    productInfo: '',
    sizeFit: '',
    shippingInfo: '',
    careInfo: '',
    sizeChartImage: '',
    productType: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories-admin');
        if (response.ok) {
          const data = await response.json();
          const names = data.map((cat: any) => cat.name);
          setCategories(names);
          if (names.length > 0) {
            setFormData(prev => ({ ...prev, category: names[0] }));
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images: images.filter((img) => img.trim() !== ''),
          sizes,
          productInfo: formData.productInfo || null,
          sizeFit: formData.sizeFit || null,
          shippingInfo: formData.shippingInfo || null,
          careInfo: formData.careInfo || null,
          sizeChartImage: formData.sizeChartImage || null,
          productType: formData.productType || null,
        }),
      });

      if (response.ok) {
        router.push('/admin/produkty');
      } else {
        const error = await response.json();
        setStatus({ type: 'error', message: error.error || 'Nepodařilo se vytvořit produkt' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      setStatus({ type: 'error', message: 'Došlo k chybě při vytváření produktu. Zkuste to znovu.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const isCD = formData.productType === 'CD';

  const updateSize = (size: string, value: string) => {
    setSizes({ ...sizes, [size]: parseInt(value) || 0 });
  };

  const updateCDStock = (value: string) => {
    setSizes({ ONE_SIZE: parseInt(value) || 0 });
  };

  const totalStock = Object.values(sizes).reduce((sum, val) => sum + val, 0);

  return (
    <div>
      <h1 className="text-title font-bold mb-8">NOVÝ PRODUKT</h1>

      {status && (
        <StatusMessage
          type={status.type}
          message={status.message}
          onDismiss={() => setStatus(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl">

        {/* Basic Info */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-body uppercase mb-2">Název *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-black p-3 text-body"
            />
          </div>

          <div>
            <label className="block text-body uppercase mb-2">Popis *</label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-black p-3 text-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-body uppercase mb-2">Cena (Kč) *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-black p-3 text-body"
              />
            </div>

            <div>
              <label className="block text-body uppercase mb-2">Kategorie *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-black p-3 text-body"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-body uppercase mb-2">Typ produktu</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, productType: '' })}
                className={`px-4 py-2 border text-body uppercase text-sm transition-colors ${
                  formData.productType === ''
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-gray-100'
                }`}
              >
                Neurčeno
              </button>
              {PRODUCT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, productType: type })}
                  className={`px-4 py-2 border text-body uppercase text-sm transition-colors ${
                    formData.productType === type
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-body uppercase mb-2">Barva</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full border border-black p-3 text-body"
              placeholder="např. Černá, Bílá"
            />
          </div>
        </div>

        {/* Images */}
        <div className="mb-8 border border-black p-6">
          <h2 className="text-header font-bold mb-2 uppercase">Obrázky produktu</h2>
          <p className="text-sm text-gray-500 mb-4">
            První obrázek bude zobrazen jako hlavní. Přetáhněte soubory nebo klikněte pro výběr.
          </p>
          <ImageUploader
            images={images}
            onChange={setImages}

            maxImages={10}
          />
        </div>

        {/* Video */}
        <div className="mb-8">
          <label className="block text-body uppercase mb-2">Video URL</label>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            className="w-full border border-black p-3 text-body"
            placeholder="https://res.cloudinary.com/..."
          />
        </div>

        {/* Product Detail Sections */}
        <div className="mb-8 border border-black p-6">
          <h2 className="text-header font-bold mb-6 uppercase">Detailní informace produktu</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-body uppercase mb-2">Informace o produktu</label>
              <textarea
                rows={4}
                value={formData.productInfo}
                onChange={(e) => setFormData({ ...formData, productInfo: e.target.value })}
                className="w-full border border-black p-3 text-body"
                placeholder="Detailní informace o produktu, materiály, vlastnosti..."
              />
            </div>
            {!isCD && (
            <div>
              <label className="block text-body uppercase mb-2">Size & Fit</label>
              <textarea
                rows={4}
                value={formData.sizeFit}
                onChange={(e) => setFormData({ ...formData, sizeFit: e.target.value })}
                className="w-full border border-black p-3 text-body"
                placeholder="Informace o velikostech a střihu produktu..."
              />
            </div>
            )}
            <div>
              <label className="block text-body uppercase mb-2">Doprava a vrácení</label>
              <textarea
                rows={4}
                value={formData.shippingInfo}
                onChange={(e) => setFormData({ ...formData, shippingInfo: e.target.value })}
                className="w-full border border-black p-3 text-body"
                placeholder="Informace o dopravě a vrácení zboží..."
              />
            </div>
            {!isCD && (
            <div>
              <label className="block text-body uppercase mb-2">Péče o produkt</label>
              <textarea
                rows={4}
                value={formData.careInfo}
                onChange={(e) => setFormData({ ...formData, careInfo: e.target.value })}
                className="w-full border border-black p-3 text-body"
                placeholder="Pokyny pro péči o produkt, praní, údržba..."
              />
            </div>
            )}
          </div>
        </div>

        {/* Sizes and Stock */}
        <div className="mb-8 border border-black p-6">
          {isCD ? (
            <>
              <h2 className="text-header font-bold mb-4 uppercase">Sklad</h2>
              <div className="max-w-xs">
                <label className="block text-body mb-1 font-bold">Množství na skladě</label>
                <input
                  type="number"
                  min="0"
                  value={sizes['ONE_SIZE'] || 0}
                  onChange={(e) => updateCDStock(e.target.value)}
                  className="w-full border border-black p-2 text-body text-center"
                />
              </div>
              <p className={`text-body font-medium mt-3 ${(sizes['ONE_SIZE'] || 0) === 0 ? 'text-red-600' : ''}`}>
                Celkem skladem: {sizes['ONE_SIZE'] || 0} ks {(sizes['ONE_SIZE'] || 0) === 0 && '⚠ Produkt bude bez skladu'}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-header font-bold mb-4 uppercase">Velikosti a sklad</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-3">
                {SIZES.map((size) => (
                  <div key={size}>
                    <label className="block text-body mb-1 text-center font-bold">{size}</label>
                    <input
                      type="number"
                      min="0"
                      value={sizes[size]}
                      onChange={(e) => updateSize(size, e.target.value)}
                      className="w-full border border-black p-2 text-body text-center"
                    />
                  </div>
                ))}
              </div>
              <p className={`text-body font-medium ${totalStock === 0 ? 'text-red-600' : ''}`}>
                Celkem skladem: {totalStock} ks {totalStock === 0 && '⚠ Produkt bude bez skladu'}
              </p>
            </>
          )}
        </div>

        {/* Visibility */}
        <div className="mb-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isVisible}
              onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-body uppercase">Produkt je viditelný na e-shopu</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-8 py-3 text-body uppercase hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ukládání…' : 'Vytvořit produkt'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 text-body uppercase border border-black hover:bg-black hover:text-white transition-colors"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
}
