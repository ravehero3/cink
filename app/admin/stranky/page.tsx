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

const inputCls = "w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

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
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám stránky…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stránky</h1>
          <p className="mt-1 text-sm text-gray-400">Správa kategorií a navigačních stránek e-shopu</p>
        </div>
        {!isCreating && !editingId && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nová stránka
          </button>
        )}
      </div>

      {/* Edit / Create form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">
              {editingId ? 'Upravit stránku' : 'Nová stránka'}
            </h2>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Název *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputCls}
                placeholder="např. VOODOO808"
              />
            </div>
            <div>
              <label className={labelCls}>Slug URL *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-300 select-none">/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className={inputCls + " pl-6"}
                  placeholder="voodoo808"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className={labelCls}>Video URL (volitelné)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className={inputCls}
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
              <label className={labelCls}>Pořadí</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Ukládám…' : 'Uložit'}
            </button>
            <button
              onClick={handleCancel}
              className="text-sm font-semibold text-gray-500 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-colors"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {/* Categories list */}
      <div className="space-y-2">
        {categories.map((category, idx) => (
          <div
            key={category.id}
            className={`bg-white rounded-2xl border transition-all ${
              editingId === category.id ? 'border-gray-900 shadow-md' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Order badge */}
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-gray-400">{category.sortOrder}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{category.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 font-mono">/{category.slug}</span>
                  {category.videoUrl && (
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full">
                      VIDEO
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href={`/${category.slug}`}
                  target="_blank"
                  className="text-xs font-medium text-gray-400 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-1"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Náhled
                </Link>
                <button
                  onClick={() => handleEdit(category)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Upravit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-xs font-medium text-red-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Smazat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !isCreating && (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">Žádné stránky</p>
          <p className="text-xs text-gray-400 mt-1">Vytvořte první stránku pomocí tlačítka výše.</p>
        </div>
      )}
    </div>
  );
}
