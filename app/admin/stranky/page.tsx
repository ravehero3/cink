'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CloudinaryUploadButton from '@/components/admin/CloudinaryUploadButton';

interface Category {
  id: string;
  name: string;
  slug: string;
  videoUrl: string | null;
  sortOrder: number;
}

export default function StrankyPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', videoUrl: '', sortOrder: 0 });
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories-admin');
      if (response.ok) setCategories(await response.json());
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      alert('Název a slug jsou povinné');
      return;
    }
    setSaving(true);
    try {
      const url = '/api/categories-admin';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { id: editingId, ...formData, sortOrder: parseInt(String(formData.sortOrder)) }
        : { ...formData, sortOrder: parseInt(String(formData.sortOrder)) };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchCategories();
        handleCancel();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto stránku?')) return;
    try {
      const response = await fetch(`/api/categories-admin?id=${id}`, { method: 'DELETE' });
      if (response.ok) fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, slug: category.slug, videoUrl: category.videoUrl || '', sortOrder: category.sortOrder });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', slug: '', videoUrl: '', sortOrder: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <div className="admin-spinner" />
        <span className="admin-sub" style={{ margin: 0 }}>Načítám stránky…</span>
      </div>
    );
  }

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div>
          <h1 className="admin-title">Stránky</h1>
          <p className="admin-sub">Správa kategorií a navigačních stránek e-shopu</p>
        </div>
        {!isCreating && !editingId && (
          <button onClick={() => setIsCreating(true)} className="admin-btn">
            + Nová stránka
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <div className="admin-card p-[24px]">
          <div className="flex items-center justify-between mb-[24px] border-b border-black pb-4">
            <h2 className="admin-title" style={{ fontSize: 14 }}>
              {editingId ? 'Upravit stránku' : 'Nová stránka'}
            </h2>
            <button onClick={handleCancel} className="hover:opacity-60 transition-opacity" aria-label="Zavřít">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[16px]">
            <div>
              <label className="admin-label">Název *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="admin-input"
                placeholder="např. VOODOO808"
              />
            </div>
            <div>
              <label className="admin-label">Slug URL *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#666666] select-none">/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="admin-input"
                  style={{ paddingLeft: 24 }}
                  placeholder="voodoo808"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[24px]">
            <div>
              <label className="admin-label">Video URL (volitelné)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="admin-input"
                  placeholder="https://…"
                />
                <CloudinaryUploadButton
                  onUploadSuccess={(url) => setFormData({ ...formData, videoUrl: url })}
                  buttonText="Nahrát"
                  folderPath="ufosport/videos"
                  resourceType="video"
                />
              </div>
            </div>
            <div>
              <label className="admin-label">Pořadí</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="admin-input"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="admin-btn">
              {saving ? 'Ukládám…' : 'Uložit'}
            </button>
            <button onClick={handleCancel} className="admin-btn admin-btn-secondary">
              Zrušit
            </button>
          </div>
        </div>
      )}

      <div className="border border-black">
        {categories.map((category, idx) => (
          <div
            key={category.id}
            className={`flex items-center gap-4 px-[16px] py-[16px] bg-white ${
              idx !== categories.length - 1 ? 'border-b border-black' : ''
            } ${editingId === category.id ? 'bg-black/5' : 'hover:bg-black/5'} transition-colors`}
          >
            <div className="w-8 h-8 border border-black flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">{category.sortOrder}</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider">{category.name}</p>
              <div className="flex items-center gap-2 mt-[4px]">
                <span className="text-[10px] uppercase tracking-wider text-[#666666]">/{category.slug}</span>
                {category.videoUrl && (
                  <span className="text-[10px] font-bold uppercase tracking-wider border border-black px-[6px] py-[2px]">
                    Video
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/${category.slug}`} target="_blank" className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', fontSize: 10 }}>
                Náhled
              </Link>
              <button onClick={() => handleEdit(category)} className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', fontSize: 10 }}>
                Upravit
              </button>
              <button onClick={() => handleDelete(category.id)} className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', fontSize: 10 }}>
                Smazat
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !isCreating && (
        <div className="admin-card admin-empty">Žádné stránky. Vytvořte první stránku tlačítkem výše.</div>
      )}
    </div>
  );
}
