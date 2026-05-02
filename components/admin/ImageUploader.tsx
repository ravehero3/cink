'use client';

import { useCallback, useRef, useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, ImageIcon } from 'lucide-react';

const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dq0qvtbst';
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ufosport_unsigned';

interface UploadItem {
  id: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  maxImages?: number;
}

async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<{ url: string } | { error: string }> {
  const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!ALLOWED.includes(file.type)) {
    return { error: `Nepodporovaný formát "${file.type}". Použijte JPG, PNG nebo WebP.` };
  }
  if (file.size > 15 * 1024 * 1024) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return { error: `Soubor je příliš velký (${mb} MB). Maximum je 15 MB.` };
  }

  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  fd.append('folder', folder);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: fd }
    );
    const data = await res.json();

    if (!res.ok || data.error) {
      return { error: data.error?.message || `Upload selhal (HTTP ${res.status})` };
    }
    return { url: data.secure_url as string };
  } catch (err: any) {
    return { error: err?.message || 'Síťová chyba při uploadu.' };
  }
}

export default function ImageUploader({
  images,
  onChange,
  folder = 'ufosport/products',
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      const remaining = maxImages - images.length;
      const toUpload = arr.slice(0, remaining);

      if (arr.length > remaining) {
        const skipped = arr.length - remaining;
        alert(`Maximálně ${maxImages} obrázků. ${skipped} soubor${skipped > 1 ? 'ů' : ''} bylo přeskočeno.`);
      }
      if (toUpload.length === 0) return;

      const batch: UploadItem[] = toUpload.map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        status: 'uploading',
      }));

      setUploadItems((prev) => [...prev, ...batch]);

      const results = await Promise.all(
        toUpload.map(async (file, i) => {
          const result = await uploadToCloudinary(file, folder);
          return { id: batch[i].id, result };
        })
      );

      setUploadItems((prev) =>
        prev.map((item) => {
          const found = results.find((r) => r.id === item.id);
          if (!found) return item;
          if ('error' in found.result) {
            return { ...item, status: 'error', error: found.result.error };
          }
          return { ...item, status: 'done' };
        })
      );

      const newUrls = results
        .filter((r): r is { id: string; result: { url: string } } => 'url' in r.result)
        .map((r) => r.result.url);

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }

      setTimeout(() => {
        setUploadItems((prev) => prev.filter((u) => u.status === 'error'));
      }, 3000);
    },
    [images, onChange, folder, maxImages]
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
  const dismissError = (id: string) => setUploadItems((prev) => prev.filter((u) => u.id !== id));

  const moveImage = (from: number, to: number) => {
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const isAtMax = images.length >= maxImages;

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div key={url + idx} className="relative group border border-black bg-gray-50 aspect-square overflow-hidden">
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
                  : 'border-gray-300 bg-gray-50 text-black'
              }`}
            >
              {u.status === 'uploading' && <Loader2 size={16} className="animate-spin shrink-0 text-black" />}
              {u.status === 'done' && <CheckCircle size={16} className="text-green-600 shrink-0" />}
              {u.status === 'error' && <AlertCircle size={16} className="text-red-600 shrink-0" />}

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{u.name}</p>
                {u.status === 'uploading' && <p className="text-xs text-gray-500">Nahrávám na Cloudinary…</p>}
                {u.status === 'done' && <p className="text-xs text-green-600">Nahráno úspěšně</p>}
                {u.status === 'error' && <p className="text-xs text-red-600 mt-0.5">{u.error}</p>}
              </div>

              {u.status === 'error' && (
                <button type="button" onClick={() => dismissError(u.id)} className="shrink-0 hover:text-black">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isAtMax && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors select-none ${
            isDragging
              ? 'border-black bg-gray-100'
              : 'border-gray-400 hover:border-black hover:bg-gray-50'
          }`}
        >
          <ImageIcon size={36} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium uppercase mb-1">
            Přetáhněte sem nebo klikněte pro výběr
          </p>
          <p className="text-xs text-gray-500 mb-0.5">JPG, PNG, WebP · max 15 MB na soubor</p>
          <p className="text-xs text-gray-400">
            {images.length}/{maxImages} obrázků · Lze vybrat více najednou
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
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
