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
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    videoUrl: '',
    sortOrder: 0,
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories-admin');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.slug) {
        alert('Název a slug jsou povinné');
        return;
      }

      const url = editingId ? '/api/categories-admin' : '/api/categories-admin';
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
        setEditingId(null);
        setFormData({ name: '', slug: '', videoUrl: '', sortOrder: 0 });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto stránku?')) return;

    try {
      const response = await fetch(`/api/categories-admin?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      videoUrl: category.videoUrl || '',
      sortOrder: category.sortOrder,
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', slug: '', videoUrl: '', sortOrder: 0 });
  };

  if (loading) {
    return <div className="text-body">Načítání...</div>;
  }

  return (
    <div>
      <h1 className="text-header font-bold mb-8">SPRÁVA STRÁNEK</h1>

      {/* Add New Button */}
      {!isCreating && !editingId && (
        <button
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 bg-black text-white uppercase text-sm font-medium hover:opacity-80 transition-opacity mb-8"
          style={{ borderRadius: '0' }}
        >
          + Nová stránka
        </button>
      )}

      {/* Edit/Create Form */}
      {(isCreating || editingId) && (
        <div
          className="mb-8 p-6 border-l-4"
          style={{ borderLeftColor: '#000000', backgroundColor: '#f9f9f9' }}
        >
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm uppercase font-medium mb-2">Název</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-black text-sm"
                placeholder="např. VOODOO808"
              />
            </div>
            <div>
              <label className="block text-sm uppercase font-medium mb-2">Slug URL</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-black text-sm"
                placeholder="např. voodoo808"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm uppercase font-medium mb-2">Video URL (volitelné)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="flex-1 px-3 py-2 border border-black text-sm"
                  placeholder="https://..."
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
              <label className="block text-sm uppercase font-medium mb-2">Pořadí</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-black text-sm"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-black text-white uppercase text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Uložit
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-black text-black uppercase text-sm font-medium hover:opacity-70 transition-opacity"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-4 border border-black flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <h3 className="font-bold text-body uppercase">{category.name}</h3>
              <p className="text-sm text-gray-700 mt-1">/{category.slug}</p>
              {category.videoUrl && (
                <p className="text-xs text-gray-600 mt-1">Video: {category.videoUrl.substring(0, 40)}...</p>
              )}
            </div>

            <div className="flex gap-3 ml-4">
              <button
                onClick={() => handleEdit(category)}
                className="px-4 py-2 border border-black uppercase text-xs font-medium hover:opacity-70 transition-opacity"
              >
                Upravit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="px-4 py-2 border border-red-600 text-red-600 uppercase text-xs font-medium hover:opacity-70 transition-opacity"
              >
                Smazat
              </button>
              <Link
                href={`/${category.slug}`}
                className="px-4 py-2 border border-black text-black uppercase text-xs font-medium hover:opacity-70 transition-opacity inline-block"
              >
                Náhled
              </Link>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !isCreating && (
        <div className="text-center py-12 text-gray-600">
          Zatím nejsou žádné stránky. Vytvořte novou stránku pomocí tlačítka výše.
        </div>
      )}
    </div>
  );
}
