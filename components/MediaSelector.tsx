'use client';

import { useState, useEffect } from 'react';
import { X, ImageIcon, Video, Check, Loader2, Search, Upload } from 'lucide-react';

interface Media {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  resourceType: 'IMAGE' | 'VIDEO';
  format: string | null;
  size: number;
  width: number | null;
  height: number | null;
}

interface MediaSelectorProps {
  type?: 'IMAGE' | 'VIDEO' | 'ALL';
  multiple?: boolean;
  onSelect: (selected: Media | Media[]) => void;
  onClose: () => void;
}

export default function MediaSelector({
  type = 'ALL',
  multiple = false,
  onSelect,
  onClose,
}: MediaSelectorProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMedia();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (type !== 'ALL') params.set('type', type);
      params.set('limit', '100');
      const res = await fetch(`/api/media?${params}`);
      const data = await res.json();
      setMedia(data.media || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const picked = media.filter((m) => selected.has(m.id));
    if (multiple) {
      onSelect(picked);
    } else {
      onSelect(picked[0]);
    }
    onClose();
  };

  const filtered = search.trim()
    ? media.filter((m) => m.originalName.toLowerCase().includes(search.trim().toLowerCase()))
    : media;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest">
              {type === 'IMAGE' ? 'Vybrat obrázek' : type === 'VIDEO' ? 'Vybrat video' : 'Vybrat médium'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {multiple ? 'Vyberte jeden nebo více souborů' : 'Vyberte jeden soubor'} · {selected.size} vybráno
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat soubory…"
              className="w-full text-sm pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">Načítám médiu…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 text-center">
              <Upload size={36} />
              <p className="text-sm font-medium text-gray-600">
                {search ? 'Žádné soubory neodpovídají hledání.' : 'Galerie je prázdná.'}
              </p>
              {!search && (
                <p className="text-xs text-gray-400">Nejprve nahrajte soubory v sekci Galerie médií.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((item) => {
                const isSel = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all focus:outline-none ${
                      isSel
                        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-1'
                        : 'border-gray-100 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-full h-full bg-gray-50">
                      {item.resourceType === 'IMAGE' ? (
                        <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" />
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover" muted />
                      )}
                    </div>
                    <div className={`absolute inset-0 transition-opacity ${
                      isSel ? 'bg-black/20' : 'bg-black/0 group-hover:bg-black/20'
                    }`} />
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSel
                        ? 'bg-gray-900 text-white opacity-100'
                        : 'bg-white/80 text-transparent opacity-0 group-hover:opacity-100'
                    }`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/70 text-white text-[10px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.originalName}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
          <p className="text-xs text-gray-400">
            {filtered.length} {filtered.length === 1 ? 'soubor' : filtered.length < 5 ? 'soubory' : 'souborů'}
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
              disabled={selected.size === 0}
              className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Potvrdit výběr ({selected.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
