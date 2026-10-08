'use client';

import { useState, useRef } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImagesSelected: (urls: string[]) => void;
  maxImages?: number;
  title?: string;
  description?: string;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  onImagesSelected,
  maxImages = 4,
  title = 'Přidání obrázků',
  description = 'Přetáhněte obrázky do pole nebo klikněte na + pro výběr souboru',
}: ImageUploadModalProps) {
  const [uploads, setUploads] = useState<{ id: string; url: string; loading: boolean; error?: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const newUploads: typeof uploads = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'].includes(file.type)) {
        newUploads.push({
          id: `${Date.now()}-${i}`,
          url: '',
          loading: false,
          error: `${file.name}: Neplatný formát. Přijímáme PNG, JPG, WebP, GIF, AVIF.`,
        });
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        newUploads.push({
          id: `${Date.now()}-${i}`,
          url: '',
          loading: false,
          error: `${file.name}: Soubor je příliš velký (max 10MB).`,
        });
        continue;
      }

      const uploadItem = {
        id: `${Date.now()}-${i}`,
        url: '',
        loading: true,
      };
      newUploads.push(uploadItem);

      // Upload file
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/email-media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setUploads((prev) =>
            prev.map((item) =>
              item.id === uploadItem.id
                ? { ...item, loading: false, error: errorData.error || 'Chyba při nahrávání.' }
                : item
            )
          );
        } else {
          const data = await response.json();
          setUploads((prev) =>
            prev.map((item) =>
              item.id === uploadItem.id ? { ...item, url: data.url, loading: false } : item
            )
          );
        }
      } catch (error) {
        setUploads((prev) =>
          prev.map((item) =>
            item.id === uploadItem.id ? { ...item, loading: false, error: 'Chyba připojení.' } : item
          )
        );
      }
    }

    setUploads((prev) => [...prev, ...newUploads]);
  };

  const handleRemoveUpload = (id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirm = () => {
    const urls = uploads.filter((item) => item.url).map((item) => item.url);
    if (urls.length > 0) {
      onImagesSelected(urls);
      setUploads([]);
      onClose();
    }
  };

  const canAddMore = uploads.length < maxImages;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-black rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">{title}</h3>
            <p className="text-xs text-[#666666] uppercase tracking-wider mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-black hover:bg-black hover:text-white transition-colors"
            aria-label="Zavřít"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Drag & Drop Zone */}
          {canAddMore && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-black bg-black/5'
                  : 'border-black/30 bg-white hover:border-black hover:bg-black/2'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Upload size={32} className="text-black" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-black">
                    Přetáhněte obrázky sem
                  </p>
                  <p className="text-xs text-[#666666] uppercase tracking-wider mt-1">
                    nebo
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="admin-btn inline-flex items-center gap-2 text-xs mt-2"
                >
                  <span>+ Vybrat soubor</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <p className="text-[10px] text-[#999999] uppercase tracking-wider mt-4">
                Maximální velikost: 10 MB · Formáty: PNG, JPG, WebP, GIF, AVIF
              </p>
            </div>
          )}

          {/* Uploaded Images Preview */}
          {uploads.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">
                Nahraté obrázky ({uploads.length}/{maxImages})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {uploads.map((item) => (
                  <div
                    key={item.id}
                    className="relative group border border-black rounded-lg overflow-hidden bg-gray-100 aspect-square"
                  >
                    {item.loading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="admin-spinner" />
                      </div>
                    )}

                    {item.error && (
                      <div className="absolute inset-0 bg-red-50 flex items-center justify-center p-2">
                        <p className="text-[10px] text-red-700 text-center font-semibold">
                          {item.error}
                        </p>
                      </div>
                    )}

                    {item.url && !item.loading && (
                      <>
                        <img
                          src={item.url}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveUpload(item.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Smazat obrázek"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-black flex items-center justify-between gap-3 flex-wrap bg-gray-50">
          <p className="text-[11px] uppercase tracking-wider text-[#666666]">
            {uploads.filter((u) => u.url).length} obrázků připraveno k přidání
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="admin-btn admin-btn-secondary"
            >
              Zrušit
            </button>
            <button
              onClick={handleConfirm}
              disabled={uploads.filter((u) => u.url).length === 0}
              className="admin-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Přidat obrázky ({uploads.filter((u) => u.url).length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
