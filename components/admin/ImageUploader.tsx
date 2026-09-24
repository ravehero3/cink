'use client';

import { useCallback, useRef, useState } from 'react';
import { X, ImageIcon, GalleryHorizontalEnd } from 'lucide-react';
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
    <div
      className="space-y-4"
      style={{
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Error */}
      {globalError && (
        <div className="flex items-start gap-2 p-3 border border-black bg-white text-xs uppercase tracking-wider text-black">
          <span className="font-bold">[ CHYBA ]</span>
          <p className="flex-1">{globalError}</p>
          <button type="button" onClick={() => setGlobalError(null)} className="shrink-0 hover:opacity-60">
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
              className="relative group border border-black bg-white aspect-square overflow-hidden"
            >
              <img src={url} alt={`Obrázek ${idx + 1}`} className="w-full h-full object-cover" />

              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1.5 right-1.5 bg-black text-white w-6 h-6 border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black z-10"
                title="Odebrat obrázek"
              >
                <X size={12} />
              </button>

              <div className="absolute top-1.5 left-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, idx - 1)}
                    className="bg-black text-white text-[10px] w-6 h-6 border border-black flex items-center justify-center hover:bg-white hover:text-black font-bold"
                    title="Posunout vlevo"
                  >
                    ←
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, idx + 1)}
                    className="bg-black text-white text-[10px] w-6 h-6 border border-black flex items-center justify-center hover:bg-white hover:text-black font-bold"
                    title="Posunout vpravo"
                  >
                    →
                  </button>
                )}
              </div>

              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-[9px] text-center py-1 uppercase tracking-widest font-bold border-t border-black">
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
              className="flex items-center gap-3 px-3 py-2 border border-black bg-white text-xs uppercase tracking-wider"
            >
              {!u.done && <div className="w-3 h-3 border border-black border-t-transparent animate-spin shrink-0" />}
              {u.done && !u.error && <span className="font-bold text-black shrink-0">[ OK ]</span>}
              {u.error && <span className="font-bold text-black shrink-0">[ CHYBA ]</span>}
              <span className="truncate flex-1">{u.name}</span>
              {u.error && <span className="text-[10px] truncate text-[#666666]">{u.error}</span>}
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
            className="flex flex-col items-center justify-center gap-2 border border-black bg-white p-5 text-center hover:bg-black hover:text-white transition-colors group cursor-pointer"
          >
            <GalleryHorizontalEnd size={24} className="text-black group-hover:text-white transition-colors" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Otevřít galerii</p>
              <p className="text-[10px] uppercase tracking-wide opacity-60 mt-0.5">Vybrat z nahraných souborů</p>
            </div>
          </button>

          {/* Upload drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border border-black p-5 text-center transition-colors select-none ${
              uploading
                ? 'bg-black/10 cursor-not-allowed opacity-60'
                : isDragging
                ? 'bg-black text-white cursor-pointer'
                : 'bg-white hover:bg-black hover:text-white cursor-pointer'
            } group`}
          >
            {uploading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin" />
            ) : (
              <ImageIcon size={24} className="text-black group-hover:text-white transition-colors" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {uploading ? 'Nahrávám…' : 'Nahrát soubory'}
              </p>
              <p className="text-[10px] uppercase tracking-wide opacity-60 mt-0.5">JPG, PNG, WebP · max 100 MB</p>
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
        <p className="text-xs uppercase tracking-wider text-black border border-black px-4 py-3 text-center bg-white">
          Dosažen maximální počet obrázků ({maxImages}). Odeberte obrázek pro přidání dalšího.
        </p>
      )}

      <p className="text-[11px] uppercase tracking-wider text-[#666666]">
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
