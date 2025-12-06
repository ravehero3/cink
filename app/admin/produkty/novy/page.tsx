'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloudinaryUploadButton from '@/components/admin/CloudinaryUploadButton';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
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
  const [images, setImages] = useState<string[]>(['']);
  const [sizes, setSizes] = useState<Record<string, number>>(
    SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        }),
      });

      if (response.ok) {
        alert('Produkt byl úspěšně vytvořen');
        router.push('/admin/produkty');
      } else {
        const error = await response.json();
        alert(`Chyba: ${error.error || 'Nepodařilo se vytvořit produkt'}`);
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Došlo k chybě při vytváření produktu');
    } finally {
      setLoading(false);
    }
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const newImages = [...images];
    let uploadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setLoading(true);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          newImages.push(data.url);
          uploadedCount++;
        } else {
          alert(`Chyba při nahrávání ${file.name}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Chyba při nahrávání ${file.name}`);
      }
    }

    setLoading(false);
    setImages(newImages);
    if (uploadedCount > 0) {
      alert(`${uploadedCount} obrázků bylo úspěšně nahráno`);
    }
    
    // Clear file input
    e.currentTarget.value = '';
  };

  const updateSize = (size: string, value: string) => {
    setSizes({ ...sizes, [size]: parseInt(value) || 0 });
  };

  return (
    <div>
      <h1 className="text-title font-bold mb-8">NOVÝ PRODUKT</h1>

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
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="flex-1 border border-black p-3 text-body"
                placeholder="https://..."
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

            <div>
              <label className="block text-body uppercase mb-2">Doprava zdarma, vrácení zdarma</label>
              <textarea
                rows={4}
                value={formData.shippingInfo}
                onChange={(e) => setFormData({ ...formData, shippingInfo: e.target.value })}
                className="w-full border border-black p-3 text-body"
                placeholder="Informace o dopravě a vrácení zboží..."
              />
            </div>

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
          </div>
        </div>

        {/* Size Chart Image */}
        <div className="mb-8">
          <label className="block text-body uppercase mb-2">Tabulka velikostí - Obrázek</label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={formData.sizeChartImage}
              onChange={(e) => setFormData({ ...formData, sizeChartImage: e.target.value })}
              className="flex-1 border border-black p-3 text-body"
              placeholder="URL obrázku tabulky velikostí (16:9 aspect ratio doporučeno)"
            />
            <CloudinaryUploadButton
              onUploadSuccess={(url) => setFormData({ ...formData, sizeChartImage: url })}
              buttonText="Nahrát"
              folderPath="ufosport/sizecharts"
              resourceType="image"
            />
          </div>
          {formData.sizeChartImage && (
            <div className="border border-black p-3 bg-gray-50">
              <img 
                src={formData.sizeChartImage} 
                alt="Preview" 
                style={{ maxHeight: '300px', maxWidth: '100%' }}
                onError={() => alert('Nepodařilo se načíst obrázek')}
              />
            </div>
          )}
        </div>

        {/* Images */}
        <div className="mb-8">
          <label className="block text-body uppercase mb-2">Obrázky</label>
          <div className="space-y-3">
            {images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  className="flex-1 border border-black p-3 text-body"
                  placeholder="URL obrázku (nebo klikněte pro nahrání)"
                />
                <CloudinaryUploadButton
                  onUploadSuccess={(url) => updateImage(index, url)}
                  buttonText="Nahrát"
                  folderPath="ufosport/products"
                  resourceType="image"
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="px-4 py-2 border border-black text-body uppercase hover:bg-black hover:text-white"
                  >
                    Odebrat
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="px-4 py-2 border border-black text-body uppercase hover:bg-black hover:text-white"
            >
              + Přidat obrázek
            </button>
          </div>
          
          {/* File Upload */}
          <div className="mt-4 p-4 border border-dashed border-black bg-gray-50">
            <label className="block text-body uppercase mb-2">Nebo nahrajte obrázky přímo ze svého počítače:</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e)}
              disabled={loading}
              className="w-full p-2 text-body cursor-pointer"
            />
            <p className="text-xs text-gray-600 mt-2">Obrázky se uloží přímo na náš server (podporuje PNG, JPG, WebP)</p>
          </div>
        </div>

        {/* Sizes and Stock */}
        <div className="mb-8">
          <label className="block text-body uppercase mb-2">Velikosti a sklad</label>
          <div className="grid grid-cols-3 gap-4">
            {SIZES.map((size) => (
              <div key={size}>
                <label className="block text-body mb-1">{size}</label>
                <input
                  type="number"
                  min="0"
                  value={sizes[size]}
                  onChange={(e) => updateSize(size, e.target.value)}
                  className="w-full border border-black p-2 text-body"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <p className="text-body mt-2">
            Celkem skladem: {Object.values(sizes).reduce((sum, val) => sum + val, 0)} ks
          </p>
        </div>

        {/* Visibility */}
        <div className="mb-8">
          <label className="flex items-center gap-2">
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
            className="bg-black text-white px-8 py-3 text-body uppercase hover:bg-white hover:text-black border border-black transition-colors disabled:bg-white disabled:text-black"
          >
            {loading ? 'Ukládání...' : 'Vytvořit produkt'}
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
