'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Search, Check, Loader2, AlertCircle, ImageIcon, RefreshCw } from 'lucide-react';

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
  /** Already-selected URLs (to pre-highlight in gallery) */
  selectedUrls?: string[];
  /** Max images the user can pick in one session */
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
      // ignore — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Pre-select already-used images
  useEffect(() => {
    if (selectedUrls.length > 0) {
      // We can't match by URL directly (media stores /uploads/… paths)
      // Just start with an empty selection — user will pick fresh ones
    }
  }, [selectedUrls]);

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
        if (!res.ok) {
          const err = await res.json();
          setUploadError(err.error || 'Nahrání selhalo.');
          continue;
        }
        const result = await res.json();
        uploaded.push(result.media);
      } catch {
        setUploadError(`Nahrání souboru "${file.name}" selhalo.`);
      }
    }

    if (uploaded.length > 0) {
      setMedia((prev) => [...uploaded, ...prev]);
      // Auto-pick newly uploaded images
      setPicked((prev) => {
        const next = new Set(prev);
        for (const m of uploaded) {
          if (next.size < maxSelect) next.add(m.url);
        }
        return next;
      });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = search.trim()
    ? media.filter((m) =>
        m.originalName.toLowerCase().includes(search.trim().toLowerCase())
      )
    : media;

  const handleConfirm = () => {
    onConfirm(Array.from(picked));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden border border-gray-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest">Galerie</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Vyberte obrázky nebo nahrajte nové · {picked.size}/{maxSelect} vybráno
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat soubory…"
              className="w-full text-sm pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white placeholder:text-gray-300"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchMedia}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
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
            <div className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              uploading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-700 cursor-pointer'
            }`}>
              {uploading ? (
                <><Loader2 size={13} className="animate-spin" /> Nahrávám…</>
              ) : (
                <><Upload size={13} /> Nahrát soubory</>
              )}
            </div>
          </label>
        </div>

        {/* ── Upload error ── */}
        {uploadError && (
          <div className="mx-6 mt-3 flex items-start gap-2 p-3 border border-red-200 bg-red-50 rounded-lg text-sm text-red-700 shrink-0">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="flex-1">{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="shrink-0 hover:text-red-900">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Grid ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-sm">Načítám galerii…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <ImageIcon size={40} />
              <p className="text-sm font-medium">
                {search ? 'Žádné soubory neodpovídají hledání.' : 'Galerie je prázdná. Nahrajte první obrázky.'}
              </p>
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
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all focus:outline-none ${
                      isPicked
                        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-1'
                        : 'border-gray-100 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.originalName}
                      className="w-full h-full object-cover"
                    />

                    {/* Hover overlay */}
                    <div className={`absolute inset-0 transition-opacity ${
                      isPicked ? 'bg-black/20' : 'bg-black/0 group-hover:bg-black/20'
                    }`} />

                    {/* Checkmark */}
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isPicked
                        ? 'bg-gray-900 text-white opacity-100'
                        : 'bg-white/80 text-transparent opacity-0 group-hover:opacity-100'
                    }`}>
                      <Check size={13} strokeWidth={3} />
                    </div>

                    {/* File name tooltip on hover */}
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/70 text-white text-[10px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.originalName}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0 bg-white">
          <p className="text-xs text-gray-400">
            {filtered.length} {filtered.length === 1 ? 'soubor' : filtered.length < 5 ? 'soubory' : 'souborů'} v galerii
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:border-gray-400 hover:text-gray-900 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={picked.size === 0}
              className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Použít vybrané ({picked.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
