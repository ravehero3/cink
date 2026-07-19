'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/store/toastStore';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Upload, X, ImageIcon, Video, Search, RefreshCw, Loader2, AlertCircle, Trash2 } from 'lucide-react';

interface Media {
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
  duration: number | null;
  tags: string[];
  category: string | null;
  description: string | null;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const [deleteModal, setDeleteModal] = useState<{ id: string } | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.set('type', filterType);
      params.set('limit', '100');
      const res = await fetch(`/api/media?${params}`);
      const data = await res.json();
      setMedia(data.media || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
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
        setMedia((prev) => [result.media, ...prev]);
      } catch {
        setUploadError(`Nahrání souboru "${file.name}" selhalo.`);
      }
    }

    setUploading(false);
  };

  const handleDelete = (id: string) => {
    setDeleteModal({ id });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      const res = await fetch(`/api/media?id=${deleteModal.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== deleteModal.id));
        if (selectedMedia?.id === deleteModal.id) setSelectedMedia(null);
        toast.success('Soubor byl odstraněn');
      } else {
        toast.error('Nepodařilo se odstranit soubor');
      }
    } catch {
      toast.error('Nepodařilo se odstranit soubor');
    } finally {
      setDeleteModal(null);
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = search.trim()
    ? media.filter((m) => m.originalName.toLowerCase().includes(search.trim().toLowerCase()))
    : media;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Galerie médií</h1>
          <p className="mt-0.5 text-sm text-gray-400">{media.length} souborů celkem</p>
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          <div className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
            uploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-700 cursor-pointer'
          }`}>
            {uploading ? (
              <><Loader2 size={15} className="animate-spin" /> Nahrávám…</>
            ) : (
              <><Upload size={15} /> Nahrát soubory</>
            )}
          </div>
        </label>
      </div>

      {/* Error */}
      {uploadError && (
        <div className="flex items-start gap-3 p-4 border border-red-200 bg-red-50 rounded-xl text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <p className="flex-1">{uploadError}</p>
          <button onClick={() => setUploadError(null)} className="shrink-0 hover:text-red-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-wrap items-center gap-4">
        {/* Type filter */}
        <div className="flex items-center gap-1.5">
          {(['ALL', 'IMAGE', 'VIDEO'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === t
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {t === 'IMAGE' && <ImageIcon size={12} />}
              {t === 'VIDEO' && <Video size={12} />}
              {t === 'ALL' ? 'Vše' : t === 'IMAGE' ? 'Obrázky' : 'Videa'}
            </button>
          ))}
        </div>

        <div className="flex-1 relative min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat soubory…"
            className="w-full text-sm pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white placeholder:text-gray-300"
          />
        </div>

        <button
          onClick={fetchMedia}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Obnovit
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Načítám médiu…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center gap-4 text-gray-400">
          <Upload size={40} />
          <div className="text-center">
            <p className="text-base font-semibold text-gray-700">
              {search ? 'Žádné soubory neodpovídají hledání.' : 'Galerie je prázdná.'}
            </p>
            {!search && (
              <p className="text-sm mt-1 text-gray-400">Nahrajte první soubory pomocí tlačítka výše.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:border-gray-300 transition-all hover:shadow-sm"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                {item.resourceType === 'IMAGE' ? (
                  <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-black/70 text-white text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    {item.resourceType === 'IMAGE' ? <ImageIcon size={9} /> : <Video size={9} />}
                    {item.format?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs font-medium text-gray-800 truncate">{item.originalName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest">Detail souboru</h2>
              <button
                onClick={() => setSelectedMedia(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Preview */}
              <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                {selectedMedia.resourceType === 'IMAGE' ? (
                  <img src={selectedMedia.url} alt={selectedMedia.originalName} className="w-full max-h-72 object-contain" />
                ) : (
                  <video src={selectedMedia.url} controls className="w-full max-h-72" />
                )}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Název souboru</p>
                  <p className="text-sm text-gray-900 font-medium truncate">{selectedMedia.originalName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Typ</p>
                  <p className="text-sm text-gray-900">{selectedMedia.format?.toUpperCase() || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Velikost</p>
                  <p className="text-sm text-gray-900">{formatSize(selectedMedia.size)}</p>
                </div>
                {selectedMedia.width && selectedMedia.height && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Rozměry</p>
                    <p className="text-sm text-gray-900">{selectedMedia.width} × {selectedMedia.height} px</p>
                  </div>
                )}
                {selectedMedia.duration && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Délka</p>
                    <p className="text-sm text-gray-900">{Math.round(selectedMedia.duration)}s</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Přidáno</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedMedia.createdAt).toLocaleDateString('cs-CZ')}
                  </p>
                </div>
              </div>

              {/* URL */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">URL</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedMedia.url}
                    readOnly
                    className="flex-1 text-xs px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-mono"
                  />
                  <button
                    onClick={() => copyUrl(selectedMedia.url)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                      copied ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'
                    }`}
                  >
                    {copied ? 'Zkopírováno!' : 'Kopírovat'}
                  </button>
                </div>
              </div>

              {/* Delete */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors w-full justify-center"
                >
                  <Trash2 size={14} />
                  Odstranit soubor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={!!deleteModal}
        title="Odstranit soubor"
        message="Opravdu chcete trvale odstranit tento soubor? Tuto akci nelze vrátit zpět."
        confirmLabel="Odstranit"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </div>
  );
}
