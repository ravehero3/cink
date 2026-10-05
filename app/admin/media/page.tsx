'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/store/toastStore';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Lock, Unlock } from 'lucide-react';

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
  storageType: 'LOCAL' | 'ORACLE_VPS' | 'CLOUDINARY';
  oracleVpsPath: string | null;
  isProtected: boolean;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStorageColor(type: string) {
  switch(type) {
    case 'ORACLE_VPS': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'CLOUDINARY': return 'bg-orange-100 text-orange-700 border-orange-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [copied, setCopied] = useState(false);
  const [storageOption, setStorageOption] = useState<'LOCAL' | 'ORACLE_VPS'>('ORACLE_VPS');
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
    setUploadSuccess(null);

    let successCount = 0;
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        // For videos, use Oracle VPS; for images, use local
        fd.append('storage', file.type.includes('video') ? storageOption : 'LOCAL');
        
        const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const err = await res.json();
          setUploadError(err.error || 'Nahrání selhalo.');
          continue;
        }
        const result = await res.json();
        setMedia((prev) => [result.media, ...prev]);
        successCount++;
      } catch {
        setUploadError(`Nahrání souboru "${file.name}" selhalo.`);
      }
    }

    if (successCount > 0) {
      setUploadSuccess(`✓ ${successCount} soubor(ů) úspěšně nahráno`);
      setTimeout(() => setUploadSuccess(null), 3000);
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
        const err = await res.json();
        toast.error(err.error || 'Nepodařilo se odstranit soubor');
      }
    } catch {
      toast.error('Nepodařilo se odstranit soubor');
    } finally {
      setDeleteModal(null);
    }
  };

  const handleToggleProtection = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/media/${id}/protect`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isProtected: !currentStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMedia((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isProtected: updated.media.isProtected } : m))
        );
        if (selectedMedia?.id === id) {
          setSelectedMedia({ ...selectedMedia, isProtected: updated.media.isProtected });
        }
        toast.success(!currentStatus ? 'Video chráněno' : 'Ochrana odebrána');
      }
    } catch {
      toast.error('Nepodařilo se změnit ochranu');
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
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div>
          <h1 className="admin-title">Galerie médií</h1>
          <p className="admin-sub">{media.length} souborů celkem</p>
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
          <span className={`admin-btn ${uploading ? 'opacity-40 cursor-not-allowed' : ''}`}>
            {uploading ? 'Nahrávám…' : '+ Nahrát soubory'}
          </span>
        </label>
      </div>

      {uploadSuccess && (
        <div className="flex items-start gap-3 p-4 border border-green-600 bg-green-50 text-xs uppercase tracking-wider text-green-700">
          <span className="font-bold shrink-0">[ OK ]</span>
          <p className="flex-1">{uploadSuccess}</p>
          <button onClick={() => setUploadSuccess(null)} className="hover:opacity-60">×</button>
        </div>
      )}

      {uploadError && (
        <div className="flex items-start gap-3 p-4 border border-black bg-white text-xs uppercase tracking-wider">
          <span className="font-bold shrink-0">[ CHYBA ]</span>
          <p className="flex-1">{uploadError}</p>
          <button onClick={() => setUploadError(null)} className="hover:opacity-60">×</button>
        </div>
      )}

      <div className="bg-white border border-black p-4">
        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-600">Možnost úložiště pro videa</p>
        <div className="flex gap-3">
          {([
            { key: 'ORACLE_VPS' as const, label: '🔒 Oracle VPS (Bezpečné, trvalé)', desc: 'Přímé úložiště na vašem serveru' },
            { key: 'LOCAL' as const, label: '💾 Místní úložiště', desc: 'Lokální server' },
          ]).map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="storage"
                value={opt.key}
                checked={storageOption === opt.key}
                onChange={() => setStorageOption(opt.key)}
                className="w-4 h-4"
              />
              <div>
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[10px] text-gray-500">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {([
            { key: 'ALL' as const, label: 'Vše' },
            { key: 'IMAGE' as const, label: 'Obrázky' },
            { key: 'VIDEO' as const, label: 'Videa' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterType(t.key)}
              className={`admin-tab ${filterType === t.key ? 'is-active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat soubory…"
            className="admin-input sm:w-80"
          />
          <button onClick={fetchMedia} disabled={loading} className="admin-btn admin-btn-secondary">
            Obnovit
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-12">
          <div className="admin-spinner" />
          <span className="admin-sub" style={{ margin: 0 }}>Načítám média…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card admin-empty">
          {search ? 'Žádné soubory neodpovídají hledání.' : 'Galerie je prázdná. Nahrajte první soubory tlačítkem výše.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-black border border-black">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white cursor-pointer hover:bg-black hover:text-white transition-colors group relative"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="aspect-square bg-white relative overflow-hidden border-b border-black group-hover:border-white">
                {item.resourceType === 'IMAGE' ? (
                  <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                )}
                <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest px-[6px] py-[2px] border border-black">
                  {item.format?.toUpperCase()}
                </span>
                {item.isProtected && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded">
                    <Lock size={12} />
                  </div>
                )}
              </div>
              <div className="px-3 py-2">
                <p className="text-xs uppercase tracking-wider font-medium truncate">{item.originalName}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-60 mt-[4px]">{formatSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="bg-white border border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-black">
              <h2 className="admin-title" style={{ fontSize: 14 }}>Detail souboru</h2>
              <button onClick={() => setSelectedMedia(null)} className="hover:opacity-60" aria-label="Zavřít">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-[24px] space-y-[16px]">
              <div className="border border-black bg-white">
                {selectedMedia.resourceType === 'IMAGE' ? (
                  <img src={selectedMedia.url} alt={selectedMedia.originalName} className="w-full max-h-72 object-contain" />
                ) : (
                  <video src={selectedMedia.url} controls className="w-full max-h-72" />
                )}
              </div>

              {selectedMedia.storageType && (
                <div>
                  <p className="admin-label">Úložiště</p>
                  <div className={`text-xs font-semibold uppercase tracking-widest px-3 py-2 border rounded inline-block ${getStorageColor(selectedMedia.storageType)}`}>
                    {selectedMedia.storageType === 'ORACLE_VPS' && '🔒 Oracle VPS - Trvalé'}
                    {selectedMedia.storageType === 'LOCAL' && '💾 Místní'}
                    {selectedMedia.storageType === 'CLOUDINARY' && '☁️ Cloudinary'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-[16px]">
                <div>
                  <p className="admin-label">Název souboru</p>
                  <p className="text-xs uppercase tracking-wider font-medium truncate">{selectedMedia.originalName}</p>
                </div>
                <div>
                  <p className="admin-label">Typ</p>
                  <p className="text-xs uppercase tracking-wider">{selectedMedia.format?.toUpperCase() || '—'}</p>
                </div>
                <div>
                  <p className="admin-label">Velikost</p>
                  <p className="text-xs uppercase tracking-wider">{formatSize(selectedMedia.size)}</p>
                </div>
                {selectedMedia.width && selectedMedia.height && (
                  <div>
                    <p className="admin-label">Rozměry</p>
                    <p className="text-xs uppercase tracking-wider">{selectedMedia.width} × {selectedMedia.height} px</p>
                  </div>
                )}
                {selectedMedia.duration && (
                  <div>
                    <p className="admin-label">Délka</p>
                    <p className="text-xs uppercase tracking-wider">{Math.round(selectedMedia.duration)}s</p>
                  </div>
                )}
                <div>
                  <p className="admin-label">Přidáno</p>
                  <p className="text-xs uppercase tracking-wider">
                    {new Date(selectedMedia.createdAt).toLocaleDateString('cs-CZ')}
                  </p>
                </div>
              </div>

              <div>
                <p className="admin-label">URL</p>
                <div className="flex gap-2">
                  <input type="text" value={selectedMedia.url} readOnly className="admin-input" style={{ textTransform: 'none' }} />
                  <button onClick={() => copyUrl(selectedMedia.url)} className="admin-btn">
                    {copied ? 'Zkopírováno' : 'Kopírovat'}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-black space-y-3">
                {selectedMedia.resourceType === 'VIDEO' && (
                  <button
                    onClick={() => handleToggleProtection(selectedMedia.id, selectedMedia.isProtected)}
                    className={`w-full admin-btn ${selectedMedia.isProtected ? 'admin-btn-secondary' : ''}`}
                  >
                    {selectedMedia.isProtected ? (
                      <><Unlock size={14} /> Zrušit ochranu</>
                    ) : (
                      <><Lock size={14} /> Chránit video</>
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMedia.id)}
                  disabled={selectedMedia.isProtected}
                  className={`admin-btn admin-btn-secondary w-full ${selectedMedia.isProtected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={selectedMedia.isProtected ? 'Chráněná videa nelze smazat' : ''}
                >
                  {selectedMedia.isProtected ? '🔒 Nelze smazat - je chráněno' : 'Odstranit soubor'}
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
