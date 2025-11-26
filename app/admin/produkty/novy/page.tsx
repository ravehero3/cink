'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories-admin');
        if (response.ok) {
          const data = await response.json();
          const slugs = data.map((cat: any) => cat.slug);
          setCategories(slugs);
          if (slugs.length > 0) {
            setFormData(prev => ({ ...prev, category: slugs[0] }));
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
          <p className="text-body mt-2 border-t border-black pt-2">
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
