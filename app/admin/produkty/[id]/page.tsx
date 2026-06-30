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

const inputCls = "w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";
const textareaCls = "w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300 resize-none";

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
  const updateSize = (size: string, value: string) => setSizes({ ...sizes, [size]: parseInt(value) || 0 });
  const updateCDStock = (value: string) => setSizes({ ONE_SIZE: parseInt(value) || 0 });
  const totalStock = Object.values(sizes).reduce((sum, val) => sum + val, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám produkt…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Upravit produkt</h1>
          <p className="mt-0.5 text-sm text-gray-400 truncate max-w-md">{formData.name}</p>
        </div>
      </div>

      {status && (
        <StatusMessage type={status.type} message={status.message} onDismiss={() => setStatus(null)} />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Základní informace</p>

              <div>
                <label className={labelCls}>Název *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Krátký popis</label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className={textareaCls}
                  placeholder="Stručný popis pro seznamy produktů"
                />
              </div>

              <div>
                <label className={labelCls}>Popis *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={textareaCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Cena (Kč) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Kategorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputCls}
                  >
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product type */}
              <div>
                <label className={labelCls}>Typ produktu</label>
                <div className="flex flex-wrap gap-2">
                  {(['', ...PRODUCT_TYPES] as string[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, productType: type })}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        formData.productType === type
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {type === '' ? 'Neurčeno' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Barva</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={inputCls}
                  placeholder="např. Černá, Bílá"
                />
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Obrázky produktu</p>
              <p className="text-xs text-gray-400 mb-4">První obrázek bude zobrazen jako hlavní. Pomocí šipek lze měnit pořadí.</p>
              <ImageUploader images={images} onChange={setImages} maxImages={10} />
            </div>

            {/* Video */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Video</p>
              <label className={labelCls}>Video URL (volitelné)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className={inputCls}
                  placeholder="https://res.cloudinary.com/…"
                />
                <CloudinaryUploadButton
                  onUploadSuccess={(url) => setFormData({ ...formData, videoUrl: url })}
                  buttonText="Nahrát"
                  folderPath="ufosport/videos"
                  resourceType="video"
                />
              </div>
            </div>

            {/* Product detail sections */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Detailní informace</p>

              <div>
                <label className={labelCls}>Informace o produktu</label>
                <textarea
                  rows={3}
                  value={formData.productInfo}
                  onChange={(e) => setFormData({ ...formData, productInfo: e.target.value })}
                  className={textareaCls}
                  placeholder="Materiály, vlastnosti, certifikace…"
                />
              </div>

              {!isCD && (
                <div>
                  <label className={labelCls}>Size & Fit</label>
                  <textarea
                    rows={3}
                    value={formData.sizeFit}
                    onChange={(e) => setFormData({ ...formData, sizeFit: e.target.value })}
                    className={textareaCls}
                    placeholder="Informace o velikostech a střihu…"
                  />
                </div>
              )}

              <div>
                <label className={labelCls}>Doprava a vrácení</label>
                <textarea
                  rows={3}
                  value={formData.shippingInfo}
                  onChange={(e) => setFormData({ ...formData, shippingInfo: e.target.value })}
                  className={textareaCls}
                  placeholder="Informace o dopravě a vrácení zboží…"
                />
              </div>

              {!isCD && (
                <div>
                  <label className={labelCls}>Péče o produkt</label>
                  <textarea
                    rows={3}
                    value={formData.careInfo}
                    onChange={(e) => setFormData({ ...formData, careInfo: e.target.value })}
                    className={textareaCls}
                    placeholder="Pokyny pro praní a údržbu…"
                  />
                </div>
              )}
            </div>

            {/* Size Chart Editor */}
            {!isCD && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Tabulka velikostí</p>
                <SizeChartEditor
                  sizeChartType={sizeChartType}
                  sizeChartData={sizeChartData}
                  onChange={(type, data) => {
                    setSizeChartType(type);
                    setSizeChartData(data);
                  }}
                />
              </div>
            )}
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-5">

            {/* Stock */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                {isCD ? 'Sklad' : 'Velikosti a sklad'}
              </p>

              {isCD ? (
                <div>
                  <label className={labelCls}>Množství na skladě</label>
                  <input
                    type="number"
                    min="0"
                    value={sizes['ONE_SIZE'] || 0}
                    onChange={(e) => updateCDStock(e.target.value)}
                    className={inputCls + " text-center"}
                  />
                  <p className={`text-xs font-medium mt-2 ${(sizes['ONE_SIZE'] || 0) === 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {(sizes['ONE_SIZE'] || 0) === 0 ? '⚠ Produkt bude bez skladu' : `${sizes['ONE_SIZE'] || 0} ks celkem`}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {SIZES.map((size) => (
                      <div key={size}>
                        <label className="block text-[10px] font-bold text-gray-500 text-center mb-1 uppercase">{size}</label>
                        <input
                          type="number"
                          min="0"
                          value={sizes[size] || 0}
                          onChange={(e) => updateSize(size, e.target.value)}
                          className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg py-2 text-center focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                        />
                      </div>
                    ))}
                  </div>
                  <div className={`text-xs font-medium px-3 py-2 rounded-lg border ${
                    totalStock === 0
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-gray-50 border-gray-100 text-gray-500'
                  }`}>
                    {totalStock === 0 ? '⚠ Produkt bude bez skladu' : `Celkem: ${totalStock} ks`}
                  </div>
                </div>
              )}
            </div>

            {/* Visibility */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Viditelný na e-shopu</p>
                  <p className="text-xs text-gray-400 mt-0.5">Zákazníci uvidí tento produkt</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                  className={`relative w-10 h-6 rounded-full transition-all duration-200 ${formData.isVisible ? 'bg-gray-900' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${formData.isVisible ? 'left-5' : 'left-1'}`} />
                </button>
              </label>
            </div>

            {/* Submit */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ukládám…
                  </span>
                ) : 'Uložit změny'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full text-sm font-semibold text-gray-500 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-colors"
              >
                Zpět
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
