'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SizeChartEditor from '@/components/admin/SizeChartEditor';
import CloudinaryUploadButton from '@/components/admin/CloudinaryUploadButton';
import { SizeChartType, SizeChartData } from '@/components/SizeChart';

const CATEGORIES = ['voodoo808', 'space-love', 'recreation-wellness', 't-shirt-gallery'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface Media {
  id: string;
  url: string;
  originalName: string;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    category: CATEGORIES[0],
    color: '',
    videoUrl: '',
    isVisible: true,
    productInfo: '',
    sizeFit: '',
    shippingInfo: '',
    careInfo: '',
  });
  const [images, setImages] = useState<string[]>(['']);
  const [sizes, setSizes] = useState<Record<string, number>>(
    SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );
  const [sizeChartType, setSizeChartType] = useState<SizeChartType>(null);
  const [sizeChartData, setSizeChartData] = useState<SizeChartData | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
          shortDescription: product.shortDescription || '',
          price: product.price.toString(),
          category: product.category,
          color: product.color || '',
          videoUrl: product.videoUrl || '',
          isVisible: product.isVisible,
          productInfo: product.productInfo || '',
          sizeFit: product.sizeFit || '',
          shippingInfo: product.shippingInfo || '',
          careInfo: product.careInfo || '',
        });
        setImages(product.images.length > 0 ? product.images : ['']);
        setSizes(product.sizes || SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
        setSizeChartType(product.sizeChartType || null);
        setSizeChartData(product.sizeChartData || null);
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

  const fetchMedia = async () => {
    try {
      setMediaLoading(true);
      const response = await fetch('/api/media?type=IMAGE');
      const data = await response.json();
      setMediaList(data.media || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      alert('Chyba při načítání médií');
    } finally {
      setMediaLoading(false);
    }
  };

  const handleSelectMedia = (media: Media) => {
    if (selectedImageIndex !== null) {
      const newImages = [...images];
      newImages[selectedImageIndex] = media.url;
      setImages(newImages);
      setMediaOpen(false);
      setSelectedImageIndex(null);
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
          shortDescription: formData.shortDescription,
          productInfo: formData.productInfo || null,
          sizeFit: formData.sizeFit || null,
          shippingInfo: formData.shippingInfo || null,
          careInfo: formData.careInfo || null,
          sizeChartType,
          sizeChartData,
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

        {/* Size Chart Editor */}
        <SizeChartEditor
          sizeChartType={sizeChartType}
          sizeChartData={sizeChartData}
          onChange={(type, data) => {
            setSizeChartType(type);
            setSizeChartData(data);
          }}
        />

        {/* Images */}
        <div className="mb-8">
          <label className="block text-body uppercase mb-2">Obrázky</label>
          <div className="space-y-4">
            {images.map((image, index) => (
              <div key={index} className="border border-black p-4">
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => updateImage(index, e.target.value)}
                    className="flex-1 border border-black p-3 text-body"
                    placeholder="URL obrázku"
                  />
                  <CloudinaryUploadButton
                    onUploadSuccess={(url) => updateImage(index, url)}
                    buttonText="Nahrát"
                    folderPath="ufosport/products"
                    resourceType="image"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      fetchMedia();
                      setMediaOpen(true);
                    }}
                    className="px-4 py-2 border border-black text-body uppercase hover:bg-black hover:text-white whitespace-nowrap"
                  >
                    Vybrat z knihovny
                  </button>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-4 py-2 border border-black text-body uppercase hover:bg-black hover:text-white whitespace-nowrap"
                    >
                      Odebrat
                    </button>
                  )}
                </div>
                {image && (
                  <div className="relative w-full h-32 bg-gray-100 border border-black overflow-hidden">
                    <img
                      src={image}
                      alt={`Náhled ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
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
            className="bg-black text-white px-8 py-3 text-body uppercase hover:bg-white hover:text-black border border-black transition-colors disabled:bg-white disabled:text-black"
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

      {/* Media Picker Modal */}
      {mediaOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black p-6 max-w-2xl w-full max-h-96 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-header font-bold uppercase">Vybrat obrázek z knihovny</h2>
              <button
                onClick={() => {
                  setMediaOpen(false);
                  setSelectedImageIndex(null);
                }}
                className="text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {mediaLoading ? (
              <div className="text-body">Načítání obrázků...</div>
            ) : mediaList.length === 0 ? (
              <div className="text-body">Žádné obrázky v knihovně. Nahrajte si nejdříve obrázky v sekci Média.</div>
            ) : (
              <div className="grid grid-cols-4 gap-3 overflow-y-auto flex-1">
                {mediaList.map((media) => (
                  <button
                    key={media.id}
                    onClick={() => handleSelectMedia(media)}
                    className="border-2 border-black p-2 hover:bg-black hover:opacity-80 transition-all"
                  >
                    <img
                      src={media.url}
                      alt={media.originalName}
                      className="w-full h-20 object-cover"
                    />
                    <p className="text-xs text-center mt-1 truncate">{media.originalName}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
