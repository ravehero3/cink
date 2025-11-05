'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['voodoo808', 'space-love', 'recreation-wellness', 't-shirt-gallery'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0],
    color: '',
    videoUrl: '',
    isVisible: true,
  });
  const [images, setImages] = useState<string[]>(['']);
  const [sizes, setSizes] = useState<Record<string, number>>(
    SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`);
      if (response.ok) {
        const product = await response.json();
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          color: product.color || '',
          videoUrl: product.videoUrl || '',
          isVisible: product.isVisible,
        });
        setImages(product.images.length > 0 ? product.images : ['']);
        setSizes(product.sizes || SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
      } else {
        alert('Produkt nenalezen');
        router.push('/admin/produkty');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('Došlo k chybě při načítání produktu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images: images.filter((img) => img.trim() !== ''),
          sizes,
        }),
      });

      if (response.ok) {
        alert('Produkt byl úspěšně aktualizován');
        router.push('/admin/produkty');
      } else {
        const error = await response.json();
        alert(`Chyba: ${error.error || 'Nepodařilo se aktualizovat produkt'}`);
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Došlo k chybě při aktualizaci produktu');
    } finally {
      setSaving(false);
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

  const updateSize = (size: string, value: string) => {
    setSizes({ ...sizes, [size]: parseInt(value) || 0 });
  };

  if (loading) {
    return <div className="text-body">Načítání produktu...</div>;
  }

  return (
    <div>
      <h1 className="text-title font-bold mb-8">UPRAVIT PRODUKT</h1>

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
                {CATEGORIES.map((cat) => (
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
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full border border-black p-3 text-body"
              placeholder="https://..."
            />
          </div>
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
                  placeholder="URL obrázku"
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
          <p className="text-body mt-2 opacity-60">
            Tip: Nahrajte obrázky na Cloudinary a vložte zde URL
          </p>
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
                  value={sizes[size] || 0}
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
            disabled={saving}
            className="bg-black text-white px-8 py-3 text-body uppercase hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50"
          >
            {saving ? 'Ukládání...' : 'Uložit změny'}
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
