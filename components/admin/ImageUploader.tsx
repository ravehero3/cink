'use client';

import { useCallback, useRef, useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, ImageIcon, GalleryHorizontalEnd } from 'lucide-react';
import GalerieModal from '@/components/admin/GalerieModal';

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; done: boolean; error?: string }[]>([]);
  const [galerieOpen, setGalerieOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setGlobalError(null);
      const arr = Array.from(files);
      const remaining = maxImages - images.length;

      if (remaining <= 0) {
        setGlobalError(`Dosažen maximální počet obrázků (${maxImages}).`);
        return;
      }

      const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const valid = arr.filter((f) => ALLOWED.includes(f.type)).slice(0, remaining);
      const invalid = arr.filter((f) => !ALLOWED.includes(f.type));

      if (invalid.length > 0) {
        setGlobalError(`${invalid.length} soubor${invalid.length > 1 ? 'y' : ''} přeskočen${invalid.length > 1 ? 'y' : ''} — nepodporovaný formát.`);
      }

      if (valid.length === 0) return;

      setUploading(true);
      setUploadProgress(valid.map((f) => ({ name: f.name, done: false })));

      const newUrls: string[] = [];

      for (let i = 0; i < valid.length; i++) {
        const file = valid[i];
        try {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
          if (!res.ok) {
            const err = await res.json();
            setUploadProgress((prev) =>
              prev.map((p, j) => (j === i ? { ...p, done: true, error: err.error || 'Selhalo' } : p))
            );
            continue;
          }
          const result = await res.json();
          newUrls.push(result.media.url);
          setUploadProgress((prev) =>
            prev.map((p, j) => (j === i ? { ...p, done: true } : p))
          );
        } catch {
          setUploadProgress((prev) =>
            prev.map((p, j) => (j === i ? { ...p, done: true, error: 'Chyba sítě' } : p))
          );
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }

      setUploading(false);
      setTimeout(() => setUploadProgress([]), 3000);
    },
    [images, onChange, maxImages]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const removeImage = (url: string) => onChange(images.filter((img) => img !== url));

  const moveImage = (from: number, to: number) => {
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const handleGalerieConfirm = (urls: string[]) => {
    const newUrls = urls.filter((u) => !images.includes(u));
    const remaining = maxImages - images.length;
    const toAdd = newUrls.slice(0, remaining);
    onChange([...images, ...toAdd]);
  };

  const isAtMax = images.length >= maxImages;

  return (
    <div className="space-y-4">
      {/* Error */}
      {globalError && (
        <div className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 text-red-700 text-sm rounded-xl">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <p className="flex-1">{globalError}</p>
          <button type="button" onClick={() => setGlobalError(null)} className="shrink-0 hover:text-red-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div
              key={url + idx}
              className="relative group border border-gray-200 rounded-xl bg-gray-50 aspect-square overflow-hidden"
            >
              <img src={url} alt={`Obrázek ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-xl" />

              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1.5 right-1.5 bg-black text-white w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                title="Odebrat obrázek"
              >
                <X size={11} />
              </button>

              <div className="absolute top-1.5 left-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, idx - 1)}
                    className="bg-black/80 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full hover:bg-black"
                    title="Posunout vlevo"
                  >
                    ←
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, idx + 1)}
                    className="bg-black/80 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full hover:bg-black"
                    title="Posunout vpravo"
                  >
                    →
                  </button>
                )}
              </div>

              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[10px] text-center py-1 uppercase tracking-widest font-semibold">
                  Hlavní foto
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-1.5">
          {uploadProgress.map((u, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm ${
                u.error
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : u.done
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              {!u.done && <Loader2 size={14} className="animate-spin shrink-0" />}
              {u.done && !u.error && <CheckCircle size={14} className="text-green-600 shrink-0" />}
              {u.error && <AlertCircle size={14} className="text-red-600 shrink-0" />}
              <span className="truncate flex-1">{u.name}</span>
              {u.error && <span className="text-xs truncate">{u.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Add buttons */}
      {!isAtMax && (
        <div className="grid grid-cols-2 gap-3">
          {/* Open gallery */}
          <button
            type="button"
            onClick={() => setGalerieOpen(true)}
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-gray-900 hover:bg-gray-50 transition-colors group"
          >
            <GalleryHorizontalEnd size={28} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
            <div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Otevřít galerii</p>
              <p className="text-xs text-gray-400 mt-0.5">Vybrat z nahraných souborů</p>
            </div>
          </button>

          {/* Upload drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 text-center transition-colors select-none ${
              uploading
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                : isDragging
                ? 'border-gray-900 bg-gray-100 cursor-pointer'
                : 'border-gray-300 hover:border-gray-900 hover:bg-gray-50 cursor-pointer'
            } group`}
          >
            {uploading ? (
              <Loader2 size={28} className="text-gray-400 animate-spin" />
            ) : (
              <ImageIcon size={28} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {uploading ? 'Nahrávám…' : 'Nahrát soubory'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · max 100 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files) uploadFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      )}

      {isAtMax && (
        <p className="text-xs text-gray-500 border border-gray-200 px-4 py-3 rounded-xl text-center bg-gray-50">
          Dosažen maximální počet obrázků ({maxImages}). Odeberte obrázek pro přidání dalšího.
        </p>
      )}

      <p className="text-xs text-gray-400">
        {images.length}/{maxImages} obrázků · První obrázek je zobrazen jako hlavní
      </p>

      {/* Gallery modal */}
      {galerieOpen && (
        <GalerieModal
          selectedUrls={images}
          maxSelect={maxImages - images.length}
          onConfirm={handleGalerieConfirm}
          onClose={() => setGalerieOpen(false)}
        />
      )}
    </div>
  );
}
