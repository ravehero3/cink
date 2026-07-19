'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusMessage from '@/components/admin/StatusMessage';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PRODUCT_TYPES = ['TRIKO', 'MIKINA', 'KRAŤASY', 'KALHOTY', 'CD'] as const;

const inputCls = "w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";
const textareaCls = "w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300 resize-none";

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
          if (names.length > 0) setFormData(prev => ({ ...prev, category: names[0] }));
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
  const updateSize = (size: string, value: string) => setSizes({ ...sizes, [size]: parseInt(value) || 0 });
  const updateCDStock = (value: string) => setSizes({ ONE_SIZE: parseInt(value) || 0 });
  const totalStock = Object.values(sizes).reduce((sum, val) => sum + val, 0);

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nový produkt</h1>
          <p className="mt-0.5 text-sm text-gray-400">Vyplňte základní informace a uložte produkt</p>
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
                  placeholder="Název produktu"
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
                  placeholder="Popis produktu zobrazený na e-shopu…"
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
                    placeholder="0"
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
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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

              {/* Product type */}
              <div>
                <label className={labelCls}>Typ produktu</label>
                <div className="flex flex-wrap gap-2">
                  {['', ...PRODUCT_TYPES].map((type) => (
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
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Obrázky produktu</p>
              <p className="text-xs text-gray-400 mb-4">První obrázek bude zobrazen jako hlavní. Přetáhněte soubory nebo klikněte pro výběr.</p>
              <ImageUploader images={images} onChange={setImages} maxImages={10} />
            </div>

            {/* Video */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Video</p>
              <label className={labelCls}>Video URL (volitelné)</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className={inputCls}
                placeholder="https://res.cloudinary.com/…"
              />
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
                  <label className={labelCls}>Střih a velikost</label>
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
                          value={sizes[size]}
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
                disabled={loading}
                className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ukládám…
                  </span>
                ) : 'Vytvořit produkt'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full text-sm font-semibold text-gray-500 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-colors"
              >
                Zrušit
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
