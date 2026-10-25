'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusMessage from '@/components/admin/StatusMessage';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PRODUCT_TYPES = ['TRIKO', 'MIKINA', 'KRAŤASY', 'KALHOTY', 'CD', 'TAŠKA', 'PLAKÁT'] as const;
const POSTER_SIZES = ['A3+ (Na fotografickém papíře)'] as const;

const inputCls = "admin-input";
const labelCls = "admin-label";
const textareaCls = "admin-textarea";

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
    dimensionsAndMaintenance: '', // For TAŠKA
    sizeChartImage: '',
    productType: '',
    posterSize: '', // For PLAKÁT
    tubeInfo: 'Baleno v tubusu', // For PLAKÁT
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
          sizes: formData.productType === 'TAŠKA' ? { ONE_SIZE: 0 } : formData.productType === 'PLAKÁT' ? { [formData.posterSize]: 0 } : sizes,
          productInfo: formData.productInfo || null,
          sizeFit: formData.sizeFit || null,
          shippingInfo: formData.shippingInfo || null,
          careInfo: formData.careInfo || null,
          dimensionsAndMaintenance: formData.dimensionsAndMaintenance || null,
          sizeChartImage: formData.sizeChartImage || null,
          productType: formData.productType || null,
          posterSize: formData.posterSize || null,
          tubeInfo: formData.tubeInfo || null,
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

  const isBag = formData.productType === 'TAŠKA';
  const isPoster = formData.productType === 'PLAKÁT';
  const isCD = formData.productType === 'CD';
  const showSizeSelection = !isBag && !isPoster && !isCD;
  
  const updateSize = (size: string, value: string) => setSizes({ ...sizes, [size]: parseInt(value) || 0 });
  const updateCDStock = (value: string) => setSizes({ ONE_SIZE: parseInt(value) || 0 });
  const totalStock = Object.values(sizes).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-black pb-4">
        <Link
          href="/admin/produkty"
          className="flex items-center justify-center w-8 h-8 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </Link>
        <div>
          <h1 className="admin-title">
            Nový produkt
          </h1>
          <p className="admin-sub">Vyplňte základní informace a uložte produkt</p>
        </div>
      </div>

      {status && (
        <StatusMessage type={status.type} message={status.message} onDismiss={() => setStatus(null)} />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic info */}
            <div className="bg-white border border-black p-6 space-y-4">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest pb-2 border-b border-black">
                Základní informace
              </p>

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
                <label className={labelCls}>Typ produktu *</label>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, productType: type, posterSize: type === 'PLAKÁT' ? 'A3+ (Na fotografickém papíře)' : '' });
                        if (type !== 'TAŠKA' && type !== 'PLAKÁT') {
                          setSizes(SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
                        }
                      }}
                      className={`px-3 py-1.5 text-xs uppercase font-medium tracking-wider border border-black transition-colors ${
                        formData.productType === type
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-black hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white border border-black p-6">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-1">Obrázky produktu</p>
              <p className="text-xs uppercase tracking-wider text-[#666666] mb-4">První obrázek bude zobrazen jako hlavní.</p>
              <ImageUploader images={images} onChange={setImages} maxImages={10} />
            </div>

            {/* Video */}
            <div className="bg-white border border-black p-6">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-4">Video</p>
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
            <div className="bg-white border border-black p-6 space-y-4">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest pb-2 border-b border-black">
                Detailní informace
              </p>

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

              {/* TAŠKA specific fields */}
              {isBag && (
                <div>
                  <label className={labelCls}>Rozměr a způsob údržby *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.dimensionsAndMaintenance}
                    onChange={(e) => setFormData({ ...formData, dimensionsAndMaintenance: e.target.value })}
                    className={textareaCls}
                    placeholder="Uvedte rozměry tašky (šířka, výška, hloubka) a pokyny pro údržbu…"
                  />
                </div>
              )}

              {/* PLAKÁT specific info */}
              {isPoster && (
                <div>
                  <label className={labelCls}>Informace o fotografickém papíru a tubusu</label>
                  <textarea
                    rows={3}
                    value={formData.tubeInfo}
                    onChange={(e) => setFormData({ ...formData, tubeInfo: e.target.value })}
                    className={textareaCls}
                    placeholder="Typ papíru, rozlišení, informace o tubusu…"
                  />
                </div>
              )}

              {!isBag && (
                <div>
                  <label className={labelCls}>{isBag ? 'Údržba' : 'Střih a velikost'}</label>
                  <textarea
                    rows={3}
                    value={formData.sizeFit}
                    onChange={(e) => setFormData({ ...formData, sizeFit: e.target.value })}
                    className={textareaCls}
                    placeholder={isBag ? 'Pokyny pro péči o produkt…' : 'Informace o velikostech a střihu…'}
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

              {!isBag && !isPoster && (
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
          <div className="space-y-6">

            {/* Stock */}
            <div className="bg-white border border-black p-6">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-4 pb-2 border-b border-black">
                {isBag ? 'Sklad' : isPoster ? 'Velikost a sklad' : isCD ? 'Sklad' : 'Velikosti a sklad'}
              </p>

              {isBag ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#666666] mb-3">Taška nemá výběr velikostí. Zadejte pouze informace výše.</p>
                  <input
                    type="number"
                    min="0"
                    value={sizes['ONE_SIZE'] || 0}
                    onChange={(e) => setSizes({ ONE_SIZE: parseInt(e.target.value) || 0 })}
                    className={inputCls + " text-center"}
                    placeholder="Množství na skladě"
                  />
                </div>
              ) : isPoster ? (
                <div>
                  <label className="text-[10px] font-bold text-black mb-2 block uppercase">Velikost *</label>
                  <select
                    value={formData.posterSize}
                    onChange={(e) => setFormData({ ...formData, posterSize: e.target.value })}
                    className={inputCls + " mb-3"}
                    required
                  >
                    {POSTER_SIZES.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <div className="bg-[#f5f5f5] border border-[#ddd] p-2 text-[11px] text-[#666] mb-3 rounded">
                    ℹ️ Rozměr: {formData.posterSize} | Baleno v tubusu
                  </div>
                  <label className="text-[10px] font-bold text-black mb-2 block uppercase">Množství na skladě</label>
                  <input
                    type="number"
                    min="0"
                    value={sizes[formData.posterSize] || 0}
                    onChange={(e) => setSizes({ [formData.posterSize]: parseInt(e.target.value) || 0 })}
                    className={inputCls + " text-center"}
                  />
                </div>
              ) : isCD ? (
                <div>
                  <label className={labelCls}>Množství na skladě</label>
                  <input
                    type="number"
                    min="0"
                    value={sizes['ONE_SIZE'] || 0}
                    onChange={(e) => updateCDStock(e.target.value)}
                    className={inputCls + " text-center"}
                  />
                  <p className={`text-xs uppercase tracking-wider font-medium mt-2 ${(sizes['ONE_SIZE'] || 0) === 0 ? 'text-black font-bold' : 'text-[#666666]'}`}>
                    {(sizes['ONE_SIZE'] || 0) === 0 ? '[!] Produkt bude bez skladu' : `${sizes['ONE_SIZE'] || 0} ks celkem`}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {SIZES.map((size) => (
                      <div key={size}>
                        <label className="block text-[10px] font-bold text-black text-center mb-1 uppercase">{size}</label>
                        <input
                          type="number"
                          min="0"
                          value={sizes[size]}
                          onChange={(e) => updateSize(size, e.target.value)}
                          className="w-full text-xs uppercase bg-white border border-black py-2 text-center focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div className={`text-xs uppercase tracking-wider font-medium p-2 border border-black ${
                    totalStock === 0 ? 'bg-black text-white' : 'bg-white text-black'
                  }`}>
                    {totalStock === 0 ? '[!] Produkt bude bez skladu' : `Celkem: ${totalStock} ks`}
                  </div>
                </div>
              )}
            </div>

            {/* Visibility */}
            <div className="bg-white border border-black p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black">Viditelný na e-shopu</p>
                  <p className="text-[10px] uppercase text-[#666666] mt-0.5">Zákazníci uvidí tento produkt</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                  className={`px-3 py-1.5 text-xs uppercase font-bold tracking-wider border border-black transition-colors ${
                    formData.isVisible ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {formData.isVisible ? 'ANO' : 'NE'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white text-xs uppercase tracking-wider font-medium py-3 border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border border-white border-t-transparent animate-spin" />
                    Ukládám…
                  </span>
                ) : 'Vytvořit produkt'}
              </button>
              <Link
                href="/admin/produkty"
                className="block text-center w-full text-xs uppercase tracking-wider font-medium py-3 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
              >
                Zrušit
              </Link>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
