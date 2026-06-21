'use client';

import { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import MediaSelector from './MediaSelector';

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: 'video' | 'product' | 'quad';
  currentData: any;
  onSave: (data: any) => void;
  onTypeChange?: (newType: 'VIDEO' | 'IMAGE' | 'QUAD_IMAGE') => void;
}

interface QuadSlot {
  image: string;
  hoverImage: string;
  text: string;
  link: string;
}

function MediaPickerField({
  label,
  value,
  onChange,
  placeholder,
  type = 'IMAGE',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'IMAGE' | 'VIDEO';
}) {
  const [showSelector, setShowSelector] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
          placeholder={placeholder || 'URL nebo vyberte ze složky'}
        />
        <button
          type="button"
          onClick={() => setShowSelector(true)}
          className="px-3 py-2 bg-black text-white hover:bg-gray-800 flex items-center gap-1.5 whitespace-nowrap text-xs transition-colors"
        >
          <ImageIcon size={14} />
          Složka
        </button>
      </div>
      {showSelector && (
        <MediaSelector
          type={type}
          onSelect={(media: any) => {
            onChange(media.url);
            setShowSelector(false);
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}

export default function EditSectionModal({
  isOpen,
  onClose,
  sectionType,
  currentData,
  onSave,
  onTypeChange,
}: EditSectionModalProps) {
  const [formData, setFormData] = useState(currentData);
  const [localSectionType, setLocalSectionType] = useState<'video' | 'product' | 'quad'>(sectionType);

  const [quadSlots, setQuadSlots] = useState<QuadSlot[]>([
    { image: '', hoverImage: '', text: '', link: '' },
    { image: '', hoverImage: '', text: '', link: '' },
    { image: '', hoverImage: '', text: '', link: '' },
    { image: '', hoverImage: '', text: '', link: '' },
  ]);

  useEffect(() => {
    setFormData(currentData);
    setLocalSectionType(sectionType);
    if (sectionType === 'quad' || currentData?.sectionType === 'QUAD_IMAGE') {
      setQuadSlots([
        { image: currentData?.quadImage1 || '', hoverImage: currentData?.quadImage1Hover || '', text: currentData?.quadImage1Text || '', link: currentData?.quadImage1Link || '' },
        { image: currentData?.quadImage2 || '', hoverImage: currentData?.quadImage2Hover || '', text: currentData?.quadImage2Text || '', link: currentData?.quadImage2Link || '' },
        { image: currentData?.quadImage3 || '', hoverImage: currentData?.quadImage3Hover || '', text: currentData?.quadImage3Text || '', link: currentData?.quadImage3Link || '' },
        { image: currentData?.quadImage4 || '', hoverImage: currentData?.quadImage4Hover || '', text: currentData?.quadImage4Text || '', link: currentData?.quadImage4Link || '' },
      ]);
    }
  }, [currentData, sectionType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSectionType === 'quad') {
      onSave({
        quadImage1: quadSlots[0].image,
        quadImage1Hover: quadSlots[0].hoverImage,
        quadImage1Text: quadSlots[0].text,
        quadImage1Link: quadSlots[0].link,
        quadImage2: quadSlots[1].image,
        quadImage2Hover: quadSlots[1].hoverImage,
        quadImage2Text: quadSlots[1].text,
        quadImage2Link: quadSlots[1].link,
        quadImage3: quadSlots[2].image,
        quadImage3Hover: quadSlots[2].hoverImage,
        quadImage3Text: quadSlots[2].text,
        quadImage3Link: quadSlots[2].link,
        quadImage4: quadSlots[3].image,
        quadImage4Hover: quadSlots[3].hoverImage,
        quadImage4Text: quadSlots[3].text,
        quadImage4Link: quadSlots[3].link,
      });
    } else {
      onSave(formData);
    }
    onClose();
  };

  const handleTypeToggle = (newType: 'video' | 'product' | 'quad') => {
    setLocalSectionType(newType);
    if (onTypeChange) {
      const typeMap = { video: 'VIDEO', product: 'IMAGE', quad: 'QUAD_IMAGE' } as const;
      onTypeChange(typeMap[newType]);
    }
  };

  const updateSlot = (i: number, field: keyof QuadSlot, value: string) => {
    setQuadSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const typeButtons = [
    { key: 'video', label: 'Video' },
    { key: 'product', label: 'Obrázek' },
    { key: 'quad', label: '4 Obrázky' },
  ] as const;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Upravit sekci
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-all duration-200"
            aria-label="Zavřít"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {onTypeChange && (
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-600">Typ sekce</label>
              <div className="flex gap-2">
                {typeButtons.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTypeToggle(key)}
                    className={`flex-1 px-3 py-2 text-xs uppercase tracking-wide font-semibold border transition-all duration-200 ${
                      localSectionType === key
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {localSectionType === 'video' && (
            <>
              <MediaPickerField
                label="Video URL"
                value={formData.videoUrl || ''}
                onChange={(v) => setFormData({ ...formData, videoUrl: v })}
                placeholder="https://example.com/video.mp4"
                type="VIDEO"
              />
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Mobilní Video URL (volitelné)</label>
                <input
                  type="text"
                  value={formData.mobileVideoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, mobileVideoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="https://example.com/video-mobile.mp4"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Nadpis (volitelné)</label>
                <input
                  type="text"
                  value={formData.headerText || ''}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="NOVÝ MERCH"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Tlačítko 1 text</label>
                  <input type="text" value={formData.button1Text || ''} onChange={(e) => setFormData({ ...formData, button1Text: e.target.value })} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" placeholder="Shop Now" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Tlačítko 1 odkaz</label>
                  <input type="text" value={formData.button1Link || ''} onChange={(e) => setFormData({ ...formData, button1Link: e.target.value })} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" placeholder="/voodoo808" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Tlačítko 2 text</label>
                  <input type="text" value={formData.button2Text || ''} onChange={(e) => setFormData({ ...formData, button2Text: e.target.value })} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" placeholder="Learn More" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Tlačítko 2 odkaz</label>
                  <input type="text" value={formData.button2Link || ''} onChange={(e) => setFormData({ ...formData, button2Link: e.target.value })} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" placeholder="/space-love" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-600">Barva textu</label>
                <div className="flex gap-4">
                  {(['black', 'white'] as const).map((color) => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="textColor" value={color} checked={color === 'white' ? formData.textColor === 'white' : formData.textColor !== 'white'} onChange={() => setFormData({ ...formData, textColor: color })} className="w-4 h-4" />
                      <span className={`w-5 h-5 border border-black ${color === 'black' ? 'bg-black' : 'bg-white'}`} />
                      <span className="text-sm">{color === 'black' ? 'Černá' : 'Bílá'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {localSectionType === 'product' && (
            <>
              <MediaPickerField
                label="Obrázek URL"
                value={formData.imageUrl || ''}
                onChange={(v) => setFormData({ ...formData, imageUrl: v })}
                placeholder="https://example.com/image.jpg"
                type="IMAGE"
              />
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Mobilní Obrázek URL (volitelné)</label>
                <input
                  type="text"
                  value={formData.mobileImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, mobileImageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="https://example.com/image-mobile.jpg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Nadpis</label>
                <input
                  type="text"
                  value={formData.headerText || ''}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="NOVÝ MERCH"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Tlačítko 1 text</label>
                  <input type="text" value={formData.button1Text || ''} onChange={(e) => setFormData({ ...formData, button1Text: e.target.value })} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" placeholder="Shop Now" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Tlačítko 1 odkaz</label>
                  <input type="text" value={formData.button1Link || ''} onChange={(e) => setFormData({ ...formData, button1Link: e.target.value })} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" placeholder="/voodoo808" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Tlačítko 2 text</label>
                  <input type="text" value={formData.button2Text || ''} onChange={(e) => setFormData({ ...formData, button2Text: e.target.value })} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" placeholder="Learn More" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Tlačítko 2 odkaz</label>
                  <input type="text" value={formData.button2Link || ''} onChange={(e) => setFormData({ ...formData, button2Link: e.target.value })} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" placeholder="/space-love" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-600">Barva textu</label>
                <div className="flex gap-4">
                  {(['black', 'white'] as const).map((color) => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="textColor" value={color} checked={color === 'white' ? formData.textColor === 'white' : formData.textColor !== 'white'} onChange={() => setFormData({ ...formData, textColor: color })} className="w-4 h-4" />
                      <span className={`w-5 h-5 border border-black ${color === 'black' ? 'bg-black' : 'bg-white'}`} />
                      <span className="text-sm">{color === 'black' ? 'Černá' : 'Bílá'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {localSectionType === 'quad' && (
            <div className="space-y-8">
              <p className="text-xs text-gray-500 leading-relaxed">
                Nastavte 4 obrázky. Každý obrázek má hlavní zobrazení, hover variantu, text a odkaz.
              </p>
              {quadSlots.map((slot, i) => (
                <div key={i} className="border border-gray-200 p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-100 pb-2">
                    Obrázek {i + 1}
                  </h3>
                  <MediaPickerField
                    label="Hlavní obrázek"
                    value={slot.image}
                    onChange={(v) => updateSlot(i, 'image', v)}
                    placeholder="URL hlavního obrázku"
                    type="IMAGE"
                  />
                  <MediaPickerField
                    label="Hover obrázek (detail)"
                    value={slot.hoverImage}
                    onChange={(v) => updateSlot(i, 'hoverImage', v)}
                    placeholder="URL obrázku při najetí myší"
                    type="IMAGE"
                  />
                  <div>
                    <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Text pod obrázkem</label>
                    <input
                      type="text"
                      value={slot.text}
                      onChange={(e) => updateSlot(i, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                      placeholder="Popis obrázku"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-600">Odkaz (URL)</label>
                    <input
                      type="text"
                      value={slot.link}
                      onChange={(e) => updateSlot(i, 'link', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                      placeholder="/voodoo808"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 border border-black text-sm uppercase tracking-wide hover:bg-gray-50 transition-colors font-medium"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-black text-white text-sm uppercase tracking-wide hover:bg-gray-900 transition-colors font-medium"
            >
              Uložit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
