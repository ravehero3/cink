'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, Check, RefreshCw } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  publicId: string;
  resourceType: 'IMAGE' | 'VIDEO';
  format: string | null;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
}

interface GalerieModalProps {
  selectedUrls?: string[];
  maxSelect?: number;
  onConfirm: (urls: string[]) => void;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function GalerieModal({
  selectedUrls = [],
  maxSelect = 10,
  onConfirm,
  onClose,
}: GalerieModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media?type=IMAGE&limit=100');
      const data = await res.json();
      setMedia(data.media || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const togglePick = (url: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        if (next.size >= maxSelect) return prev;
        next.add(url);
      }
      return next;
    });
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const uploaded: MediaItem[] = [];

    for (const file of Array.from(files)) {
      if (!ALLOWED.includes(file.type)) {
        setUploadError(`Soubor "${file.name}" není podporovaný formát (JPG, PNG, WebP).`);
        continue;
      }
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
        if (res.ok) {
          const result = await res.json();
          uploaded.push(result.media);
        } else {
          const err = await res.json();
          setUploadError(err.error || 'Nahrávání selhalo');
        }
      } catch {
        setUploadError('Chyba sítě při nahrávání');
      }
    }

    if (uploaded.length > 0) {
      setMedia((prev) => [...uploaded, ...prev]);
      uploaded.forEach((item) => {
        setPicked((prev) => {
          if (prev.size < maxSelect) {
            const next = new Set(prev);
            next.add(item.url);
            return next;
          }
          return prev;
        });
      });
    }

    setUploading(false);
  };

  const filtered = media.filter((item) =>
    (item.originalName || item.filename).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4"
      style={{
        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal dialog */}
      <div
        className="relative bg-white border border-black w-full max-w-4xl max-h-[88vh] flex flex-col shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black shrink-0">
          <div>
            <h2
              className="text-sm font-bold uppercase tracking-wider text-black"
              style={{
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              Galerie médií
            </h2>
            <p className="text-[11px] uppercase tracking-wide text-[#666666] mt-0.5">
              Vyberte obrázky nebo nahrajte nové · {picked.size}/{maxSelect} vybráno
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:opacity-60 transition-opacity"
            aria-label="Zavřít"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-black flex items-center gap-3 shrink-0 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat soubory…"
              className="w-full text-xs uppercase pl-8 pr-3 py-2 border border-black bg-white focus:outline-none placeholder:text-black/30 tracking-wider"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchMedia}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-medium border border-black bg-white hover:bg-black hover:text-white transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Obnovit
          </button>

          {/* Upload */}
          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files)}
            />
            <div
              className={`flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-medium border border-black transition-colors ${
                uploading
                  ? 'bg-black/10 text-black/50 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-white hover:text-black cursor-pointer'
              }`}
            >
              {uploading ? (
                <>
                  <span className="w-3 h-3 border border-white border-t-transparent animate-spin" />
                  Nahrávám…
                </>
              ) : (
                <>+ Nahrát soubory</>
              )}
            </div>
          </label>
        </div>

        {/* Upload error */}
        {uploadError && (
          <div className="mx-6 mt-3 flex items-start gap-2 p-3 border border-black bg-white text-xs uppercase tracking-wider text-black shrink-0">
            <span className="font-bold">[ CHYBA ]</span>
            <span className="flex-1">{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="shrink-0 hover:opacity-60">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <div className="w-5 h-5 border border-black border-t-transparent animate-spin" />
              <span className="text-xs uppercase tracking-widest text-[#666666]">Načítám galerii…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-xs uppercase tracking-widest text-[#666666]">
              {search ? 'Žádné soubory neodpovídají hledání.' : 'Galerie je prázdná. Nahrajte první obrázky.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((item) => {
                const isPicked = picked.has(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePick(item.url)}
                    className={`relative aspect-square border text-left group overflow-hidden transition-all ${
                      isPicked
                        ? 'border-2 border-black outline outline-2 outline-black'
                        : 'border-black hover:border-black'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.originalName}
                      className="w-full h-full object-cover"
                    />

                    {/* Check indicator */}
                    <div
                      className={`absolute top-1.5 right-1.5 w-5 h-5 border border-black flex items-center justify-center text-xs font-bold transition-all ${
                        isPicked
                          ? 'bg-black text-white opacity-100'
                          : 'bg-white text-black opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isPicked ? <Check size={12} strokeWidth={3} /> : null}
                    </div>

                    {/* Info bar on hover */}
                    <div className="absolute bottom-0 inset-x-0 bg-black text-white px-1.5 py-1 text-[9px] uppercase tracking-wider truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.originalName || item.filename} · {formatSize(item.size)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black flex items-center justify-between shrink-0 bg-white">
          <p className="text-xs uppercase tracking-wider text-[#666666]">
            Vybráno <span className="font-bold text-black">{picked.size}</span> z maximálně{' '}
            <span className="font-bold text-black">{maxSelect}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs uppercase tracking-wider font-medium border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
            >
              Zrušit
            </button>
            <button
              type="button"
              disabled={picked.size === 0}
              onClick={() => {
                onConfirm(Array.from(picked));
                onClose();
              }}
              className="px-5 py-2 text-xs uppercase tracking-wider font-medium border border-black bg-black text-white hover:bg-white hover:text-black transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Použít vybrané ({picked.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
