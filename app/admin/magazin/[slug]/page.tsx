'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author?: string;
  category?: string;
  tags?: string;
  blocks: any;
  published: boolean;
  publishedAt?: string;
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminArticleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isNew = slug === 'novy';

  const [article, setArticle] = useState<Article>({
    id: '',
    slug: '',
    title: '',
    subtitle: '',
    author: '',
    category: '',
    tags: '',
    blocks: {
      hero: '',
      text1: '',
      image1: '',
      text2: '',
      instagram: '',
      text3: '',
    },
    published: false,
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchArticle();
    }
  }, [isNew, slug]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/magazine/articles/${slug}?all=1`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setArticle(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Chyba při načítání článku');
      router.push('/admin/magazin');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setArticle((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleBlockChange = (blockId: string, value: string) => {
    setArticle((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [blockId]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    blockId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setSaveStatus('saving');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/magazine/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      handleBlockChange(blockId, url);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error:', error);
      setSaveStatus('error');
      alert('Chyba při nahrání obrázku');
    } finally {
      setSaving(false);
    }
  };

  const saveArticle = async () => {
    // Auto-generate slug if new
    let finalSlug = article.slug;
    if (isNew && !article.slug && article.title) {
      finalSlug = slugifyTitle(article.title);
    }

    if (!finalSlug || !article.title) {
      alert('Vyplňte titul a slug');
      return;
    }

    setSaving(true);
    setSaveStatus('saving');

    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew
        ? '/api/magazine/articles'
        : `/api/magazine/articles/${article.slug}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: finalSlug,
          title: article.title,
          subtitle: article.subtitle,
          author: article.author,
          category: article.category,
          tags: article.tags,
          blocks: article.blocks,
          published: article.published,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      const saved = await res.json();
      setArticle(saved);
      setHasChanges(false);
      setSaveStatus('saved');

      if (isNew) {
        setTimeout(() => router.push(`/admin/magazin/${saved.slug}`), 500);
      } else {
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setSaveStatus('error');
      alert(`Chyba: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Načítání...</p>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isNew ? 'Nový článek' : article.title}
        </h1>
        <button
          onClick={() => router.push('/admin/magazin')}
          className="text-gray-600 hover:text-black"
        >
          ← Zpět na články
        </button>
      </div>

      {/* Save status */}
      {saveStatus === 'saving' && (
        <p className="mb-4 text-yellow-600">Ukládám…</p>
      )}
      {saveStatus === 'saved' && (
        <p className="mb-4 text-green-600">Uloženo ✓</p>
      )}
      {saveStatus === 'error' && (
        <p className="mb-4 text-red-600">Chyba při ukládání</p>
      )}

      {/* Basic fields */}
      <div className="space-y-4 mb-8 p-4 border border-gray-200 rounded">
        <div>
          <label className="block text-sm font-semibold mb-2">Titul *</label>
          <input
            type="text"
            value={article.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Nadpis článku"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Slug *</label>
          <input
            type="text"
            value={article.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
            placeholder="auto-generated-from-title"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL: /magazin/{article.slug || 'auto'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Podtitul</label>
          <input
            type="text"
            value={article.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Standfirst / podtitul"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Autor</label>
            <input
              type="text"
              value={article.author}
              onChange={(e) => handleChange('author', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Jméno autora"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Kategorie</label>
            <input
              type="text"
              value={article.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Kategorie"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Tagy</label>
          <input
            type="text"
            value={article.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={article.published}
            onChange={(e) => handleChange('published', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-semibold">Zveřejněno</span>
        </label>
      </div>

      {/* Hero image */}
      <div className="mb-8 p-4 border border-gray-200 rounded">
        <h2 className="font-semibold mb-4">Hlavní obrázek (hero)</h2>
        {article.blocks.hero && (
          <div className="relative w-full h-48 bg-gray-100 mb-4 overflow-hidden">
            <Image
              src={article.blocks.hero}
              alt="Hero"
              fill
              className="object-cover"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'hero')}
          className="block"
        />
      </div>

      {/* Text and image blocks */}
      {['text1', 'image1', 'text2', 'instagram', 'text3'].map((blockId) => (
        <div key={blockId} className="mb-8 p-4 border border-gray-200 rounded">
          {blockId.startsWith('text') && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Text blok
              </label>
              <textarea
                value={article.blocks[blockId] || ''}
                onChange={(e) => handleBlockChange(blockId, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                rows={6}
                placeholder="Napište text…"
              />
            </div>
          )}

          {blockId === 'image1' && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Obrázek v textu
              </label>
              {article.blocks[blockId] && (
                <div className="relative w-full h-48 bg-gray-100 mb-4 overflow-hidden">
                  <Image
                    src={article.blocks[blockId]}
                    alt="Block"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, blockId)}
                className="block mb-4"
              />
              <input
                type="text"
                placeholder="Kredit / autora obrázku"
                value={article.blocks[blockId + ':credit'] || ''}
                onChange={(e) =>
                  handleBlockChange(blockId + ':credit', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          )}

          {blockId === 'instagram' && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                value={article.blocks[blockId] || ''}
                onChange={(e) => handleBlockChange(blockId, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://www.instagram.com/p/..."
              />
            </div>
          )}
        </div>
      ))}

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={saveArticle}
          disabled={saving}
          className="px-6 py-2 bg-black text-white font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Ukládám…' : 'Uložit'}
        </button>
        <a
          href={`/magazin/${article.slug}`}
          target="_blank"
          rel="noopener"
          className="px-6 py-2 border border-black font-semibold hover:bg-gray-50"
        >
          Náhled
        </a>
        <button
          onClick={() => router.push('/admin/magazin')}
          className="px-6 py-2 text-gray-600 font-semibold hover:text-black"
        >
          Zpět na články
        </button>
      </div>
    </div>
  );
}
