'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/lib/toast-store';

interface CarouselSlide {
  id: string;
  image: string;
  link: string;
  order: number;
  isProtected: boolean;
}

export default function HomepageAdminPage() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const { showToast } = useToast();

  // Fetch carousel slides
  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/carousel?_t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        setSlides(data.slides || []);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      showToast('Chyba při načítání snímků', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await fetch('/api/carousel/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Obrázek "${file.name}" byl nahrán`, 'success');
        await fetchSlides();
      } else {
        showToast(`Chyba: ${data.error || 'Nahrávání selhalo'}`, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Chyba při nahrávání obrázku', 'error');
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  const handleRemoveSlide = async (slideId: string) => {
    if (slides.length <= 1) {
      showToast('Musí zůstat alespoň jeden snímek', 'error');
      return;
    }

    if (!confirm('Opravdu chcete odstranit tento snímek?')) return;

    try {
      const res = await fetch(`/api/carousel/${slideId}`, { method: 'DELETE' });

      if (res.ok) {
        showToast('Snímek byl odstraněn', 'success');
        setSlides(slides.filter(s => s.id !== slideId));
      } else {
        const data = await res.json();
        showToast(`Chyba: ${data.error || 'Smazání selhalo'}`, 'error');
      }
    } catch (error) {
      console.error('Error removing slide:', error);
      showToast('Chyba při odstraňování snímku', 'error');
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length) return;

    const newSlides = [...slides];
    [newSlides[fromIndex], newSlides[toIndex]] = [newSlides[toIndex], newSlides[fromIndex]];

    newSlides.forEach((s, i) => {
      s.order = i;
    });

    setSlides(newSlides);
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      const res = await fetch('/api/carousel/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: slides.map((s, i) => ({ id: s.id, order: i })),
        }),
      });

      if (res.ok) {
        setSaved(true);
        showToast('Zmeny byly uloženy', 'success');
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        showToast(`Chyba: ${data.error || 'Ukládání selhalo'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Chyba při ukládání', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm uppercase tracking-widest">Načítání…</span>
        </div>
      </div>
    );
  }

  const isEmpty = slides.length === 0 || !slides.some(s => s.image);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">Domovská stránka</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Hero Carousel / Karusel na domovské stránce</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-black p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Nahrát nový obrázek</h2>
          <span className="text-xs text-gray-500 uppercase tracking-widest">{slides.length} snímků</span>
        </div>

        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded hover:border-black hover:bg-gray-50 transition-all disabled:opacity-50">
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm uppercase tracking-widest">Nahrávání…</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span className="text-sm uppercase tracking-widest">Klikněte pro nahrání nebo přetáhněte obrázek</span>
              </>
            )}
          </div>
        </label>

        <p className="text-xs text-gray-500 mt-3 uppercase tracking-widest">
          Doporučená velikost: 2576 × 584 px (desktop) nebo 4:5 (mobil) · Max 10MB
        </p>
      </div>

      {/* Preview Section */}
      <div className="bg-white border border-black p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Náhled karuselu</h2>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
            <AlertCircle size={32} />
            <p className="text-sm font-medium text-gray-600">Žádné obrázky v karuselu</p>
            <p className="text-xs text-gray-500">Nahrajte svůj první obrázek výše</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded hover:border-black transition-colors group"
              >
                {/* Drag handles */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleReorder(index, index - 1)}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Posunout nahoru"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleReorder(index, index + 1)}
                    disabled={index === slides.length - 1}
                    className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Posunout dolů"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>

                {/* Slide index */}
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 min-w-max">
                  #{index + 1}
                </div>

                {/* Image preview */}
                {slide.image && (
                  <div className="flex-shrink-0 w-24 h-16 border border-gray-200 rounded overflow-hidden bg-gray-50">
                    <img
                      src={slide.image}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {slide.image ? 'Obrázek nahrán' : 'Prázdný snímek'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {slide.link ? `Odkaz: ${slide.link}` : 'Bez odkazu'}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleRemoveSlide(slide.id)}
                  disabled={slides.length === 1}
                  className="p-2 text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title={slides.length === 1 ? 'Musí zůstat alespoň jeden snímek' : 'Odstranit snímek'}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={uploading || isEmpty}
          className="px-6 py-3 bg-black text-white font-bold uppercase tracking-widest text-xs rounded hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : '✓'}
          Uložit
        </button>
        {saved && (
          <span className="text-xs text-green-600 font-medium uppercase tracking-widest">
            ✓ Uloženo
          </span>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <p className="text-xs text-blue-900 uppercase tracking-widest leading-relaxed">
          💡 Tipy: Obrázky jsou automaticky chráněny a nikdy se nebudou smazat, pokud je sami neodstraníte. 
          Pořadí lze změnit pomocí šipek a poté klikněte "Uložit". Všechny změny se zobrazí veřejně na domovské stránce.
        </p>
      </div>
    </div>
  );
}
