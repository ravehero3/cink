'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SizeChartEditor from '@/components/admin/SizeChartEditor';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusMessage from '@/components/admin/StatusMessage';
import { SizeChartType, SizeChartData } from '@/components/SizeChart';
import CloudinaryUploadButton from '@/components/admin/CloudinaryUploadButton';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PRODUCT_TYPES = ['TRIKO', 'MIKINA', 'KRAŤASY', 'KALHOTY', 'CD'] as const;

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<Record<string, number>>(
    SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );
  const [sizeChartType, setSizeChartType] = useState<SizeChartType>(null);
  const [sizeChartData, setSizeChartData] = useState<SizeChartData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    category: '',
    color: '',
    videoUrl: '',
    isVisible: true,
    productInfo: '',
    sizeFit: '',
    shippingInfo: '',
    careInfo: '',
    productType: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catResponse = await fetch('/api/categories-admin');
        let categoryData: { name: string; slug: string }[] = [];
        if (catResponse.ok) {
          categoryData = await catResponse.json();
          setCategories(categoryData);
        }

        const prodResponse = await fetch(`/api/admin/products/${params.id}`);
        if (prodResponse.ok) {
          const product = await prodResponse.json();

          let categoryName = product.category;
          const matchedCategory = categoryData.find(
            (cat) =>
              cat.slug === product.category ||
              cat.slug.toLowerCase() === product.category.toLowerCase() ||
              cat.name === product.category ||
              cat.name.toLowerCase() === product.category.toLowerCase()
          );
          if (matchedCategory) categoryName = matchedCategory.name;

          setFormData({
            name: product.name,
            description: product.description,
            shortDescription: product.shortDescription || '',
            price: product.price.toString(),
            category: categoryName,
            color: product.color || '',
            videoUrl: product.videoUrl || '',
            isVisible: product.isVisible,
            productInfo: product.productInfo || '',
            sizeFit: product.sizeFit || '',
            shippingInfo: product.shippingInfo || '',
            careInfo: product.careInfo || '',
            productType: product.productType || '',
          });
          setImages(product.images.length > 0 ? product.images : []);
          setSizes(product.sizes || SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
          setSizeChartType(product.sizeChartType || null);
          setSizeChartData(product.sizeChartData || null);
        } else {
          setStatus({ type: 'error', message: 'Produkt nenalezen' });
          router.push('/admin/produkty');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setStatus({ type: 'error', message: 'Došlo k chybě při načítání produktu' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PATCH',
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
          sizeChartType,
          sizeChartData,
          productType: formData.productType || null,
        }),
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Produkt byl úspěšně aktualizován.' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const error = await response.json();
        setStatus({ type: 'error', message: error.error || 'Nepodařilo se aktualizovat produkt' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      setStatus({ type: 'error', message: 'Došlo k chybě při aktualizaci produktu. Zkuste to znovu.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
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

  if (loading) {
    return <div className="text-body">Načítání produktu…</div>;
  }

  return (
    <div>
      <h1 className="text-title font-bold mb-8">UPRAVIT PRODUKT</h1>

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
            <label className="block text-body uppercase mb-2">Krátký popis</label>
            <textarea
              rows={2}
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full border border-black p-3 text-body"
              placeholder="Stručný popis pro seznamy produktů"
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
                  <option key={cat.name} value={cat.name}>
                    {cat.name.toUpperCase()}
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

          <div>
            <label className="block text-body uppercase mb-2">Video URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="flex-1 border border-black p-3 text-body"
                placeholder="https://res.cloudinary.com/..."
              />
              <CloudinaryUploadButton
                onUploadSuccess={(url) => setFormData({ ...formData, videoUrl: url })}
                buttonText="Nahrát video"
                folderPath="ufosport/videos"
                resourceType="video"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="mb-8 border border-black p-6">
          <h2 className="text-header font-bold mb-2 uppercase">Obrázky produktu</h2>
          <p className="text-sm text-gray-500 mb-4">
            První obrázek bude zobrazen jako hlavní. Pomocí šipek lze měnit pořadí.
          </p>
          <ImageUploader
            images={images}
            onChange={setImages}

            maxImages={10}
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

        {/* Size Chart Editor — hidden for CD */}
        {!isCD && (
          <SizeChartEditor
            sizeChartType={sizeChartType}
            sizeChartData={sizeChartData}
            onChange={(type, data) => {
              setSizeChartType(type);
              setSizeChartData(data);
            }}
          />
        )}

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
                      value={sizes[size] || 0}
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
            disabled={saving}
            className="bg-black text-white px-8 py-3 text-body uppercase hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Ukládání…' : 'Uložit změny'}
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
