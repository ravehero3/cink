'use client';

import { useCallback, useRef, useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, ImageIcon } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing-client';

interface UploadItem {
  id: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

function extractErrorMessage(error: unknown): string {
  if (!error) return 'Neznámá chyba.';
  if (typeof error === 'string') return error;
  if (error instanceof Error) {
    const msg = error.message || '';
    if (msg.toLowerCase().includes('unauthorized') || msg.includes('401')) {
      return 'Přístup odepřen — ujistěte se, že jste přihlášeni jako admin.';
    }
    if (msg.toLowerCase().includes('file size') || msg.includes('too large')) {
      return 'Soubor je příliš velký. Maximum je 16 MB.';
    }
    if (msg.toLowerCase().includes('file type') || msg.includes('not allowed')) {
      return 'Nepodporovaný formát souboru. Použijte JPG, PNG nebo WebP.';
    }
    if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
      return 'Chyba sítě — zkontrolujte připojení a zkuste znovu.';
    }
    return msg || 'Upload selhal.';
  }
  try {
    const obj = error as any;
    return obj?.message || obj?.error || JSON.stringify(error);
  } catch {
    return 'Upload selhal.';
  }
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing('productImageUploader', {
    onUploadBegin(fileName) {
      setUploadItems((prev) =>
        prev.map((item) =>
          item.name === fileName && item.status === 'uploading'
            ? item
            : item
        )
      );
    },
    onClientUploadComplete(res) {
      if (!res) return;
      const newUrls = res.map((f) => f.ufsUrl);
      onChange([...images, ...newUrls]);

      const completedNames = new Set(res.map((f) => f.name));
      setUploadItems((prev) =>
        prev.map((item) =>
          completedNames.has(item.name)
            ? { ...item, status: 'done' }
            : item
        )
      );

      setTimeout(() => {
        setUploadItems((prev) => prev.filter((u) => u.status === 'error'));
      }, 3000);
    },
    onUploadError(error) {
      const msg = extractErrorMessage(error);
      console.error('[ImageUploader] Upload error:', error);

      setUploadItems((prev) =>
        prev.map((item) =>
          item.status === 'uploading'
            ? { ...item, status: 'error', error: msg }
            : item
        )
      );

      const hasUploadingItems = uploadItems.some((u) => u.status === 'uploading');
      if (!hasUploadingItems) {
        setGlobalError(msg);
      }
    },
  });

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setGlobalError(null);
      const arr = Array.from(files);
      const remaining = maxImages - images.length;

      if (remaining <= 0) {
        setGlobalError(`Dosažen maximální počet obrázků (${maxImages}).`);
        return;
      }

      const toUpload = arr.slice(0, remaining);
      const skipped = arr.length - toUpload.length;
      if (skipped > 0) {
        setGlobalError(
          `Lze nahrát maximálně ${maxImages} obrázků. ${skipped} soubor${skipped > 1 ? 'y' : ''} byl${skipped > 1 ? 'y' : ''} přeskočen${skipped > 1 ? 'y' : ''}.`
        );
      }

      const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const invalid = toUpload.filter((f) => !ALLOWED.includes(f.type));
      const valid = toUpload.filter((f) => ALLOWED.includes(f.type));

      const now = Date.now();
      const newItems: UploadItem[] = [
        ...invalid.map((f, i) => ({
          id: `${now}-inv-${i}`,
          name: f.name,
          status: 'error' as const,
          error: `Nepodporovaný formát "${f.type || 'neznámý'}". Použijte JPG, PNG nebo WebP.`,
        })),
        ...valid.map((f, i) => ({
          id: `${now}-${i}`,
          name: f.name,
          status: 'uploading' as const,
        })),
      ];

      setUploadItems((prev) => [...prev, ...newItems]);

      if (valid.length === 0) return;

      try {
        const result = await startUpload(valid);
        if (!result || result.length === 0) {
          setUploadItems((prev) =>
            prev.map((item) =>
              item.status === 'uploading'
                ? {
                    ...item,
                    status: 'error',
                    error: 'Upload se nepodařil — server nevrátil žádný výsledek. Zkuste to znovu.',
                  }
                : item
            )
          );
        }
      } catch (err) {
        const msg = extractErrorMessage(err);
        console.error('[ImageUploader] startUpload threw:', err);
        setUploadItems((prev) =>
          prev.map((item) =>
            item.status === 'uploading'
              ? { ...item, status: 'error', error: msg }
              : item
          )
        );
        setGlobalError(msg);
      }
    },
    [images, onChange, maxImages, startUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = (url: string) => onChange(images.filter((img) => img !== url));
  const dismissItem = (id: string) =>
    setUploadItems((prev) => prev.filter((u) => u.id !== id));

  const moveImage = (from: number, to: number) => {
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const isAtMax = images.length >= maxImages;

  return (
    <div className="space-y-4">
      {globalError && (
        <div className="flex items-start gap-3 p-3 border border-red-500 bg-red-50 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Chyba uploadu</p>
            <p className="mt-0.5">{globalError}</p>
          </div>
          <button
            type="button"
            onClick={() => setGlobalError(null)}
            className="shrink-0 hover:text-red-900"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div
              key={url + idx}
              className="relative group border border-black bg-gray-50 aspect-square overflow-hidden"
            >
              <img
                src={url}
                alt={`Obrázek ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all" />

              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-black text-white w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                title="Odebrat obrázek"
              >
                <X size={12} />
              </button>

              <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, idx - 1)}
                    className="bg-black text-white text-xs px-1.5 py-0.5 hover:bg-gray-700"
                    title="Posunout vlevo"
                  >
                    ←
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, idx + 1)}
                    className="bg-black text-white text-xs px-1.5 py-0.5 hover:bg-gray-700"
                    title="Posunout vpravo"
                  >
                    →
                  </button>
                )}
              </div>

              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-xs text-center py-0.5 uppercase tracking-wider">
                  Hlavní foto
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadItems.length > 0 && (
        <div className="space-y-2">
          {uploadItems.map((u) => (
            <div
              key={u.id}
              className={`flex items-center gap-3 p-3 border text-sm ${
                u.status === 'error'
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : u.status === 'done'
                  ? 'border-green-400 bg-green-50 text-green-800'
                  : 'border-gray-300 bg-gray-50 text-black'
              }`}
            >
              {u.status === 'uploading' && (
                <Loader2 size={16} className="animate-spin shrink-0 text-black" />
              )}
              {u.status === 'done' && (
                <CheckCircle size={16} className="text-green-600 shrink-0" />
              )}
              {u.status === 'error' && (
                <AlertCircle size={16} className="text-red-600 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{u.name}</p>
                {u.status === 'uploading' && (
                  <p className="text-xs text-gray-500">Nahrávám na server…</p>
                )}
                {u.status === 'done' && (
                  <p className="text-xs text-green-700">Nahráno úspěšně</p>
                )}
                {u.status === 'error' && u.error && (
                  <p className="text-xs text-red-600 mt-0.5 break-words">{u.error}</p>
                )}
              </div>

              {(u.status === 'error' || u.status === 'done') && (
                <button
                  type="button"
                  onClick={() => dismissItem(u.id)}
                  className="shrink-0 hover:opacity-70"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isAtMax && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed p-8 text-center transition-colors select-none ${
            isUploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
              : isDragging
              ? 'border-black bg-gray-100 cursor-pointer'
              : 'border-gray-400 hover:border-black hover:bg-gray-50 cursor-pointer'
          }`}
        >
          {isUploading ? (
            <Loader2 size={36} className="mx-auto mb-3 text-gray-400 animate-spin" />
          ) : (
            <ImageIcon size={36} className="mx-auto mb-3 text-gray-400" />
          )}
          <p className="text-sm font-medium uppercase mb-1">
            {isUploading ? 'Nahrávám…' : 'Přetáhněte sem nebo klikněte pro výběr'}
          </p>
          <p className="text-xs text-gray-500 mb-0.5">JPG, PNG, WebP · max 16 MB na soubor</p>
          <p className="text-xs text-gray-400">
            {images.length}/{maxImages} obrázků · Lze vybrat více najednou
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {isAtMax && (
        <p className="text-xs text-gray-500 border border-gray-300 p-3 text-center bg-gray-50">
          Dosažen maximální počet obrázků ({maxImages}). Odeberte obrázek pro přidání dalšího.
        </p>
      )}
    </div>
  );
}
