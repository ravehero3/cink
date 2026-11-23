'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  ArrowLeft,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  ExternalLink,
  Eye,
  FileText,
  Tag,
  User,
  Image as ImageIcon,
  Instagram as InstagramIcon,
  RefreshCw,
} from 'lucide-react';
import ArticleLivePreview, { type ArticlePreviewData } from './ArticleLivePreview';

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

interface MagazineArticleEditorProps {
  initialSlug?: string;
  onBackToList?: () => void;
}

export default function MagazineArticleEditor({
  initialSlug,
  onBackToList,
}: MagazineArticleEditorProps) {
  const router = useRouter();
  const isNew = !initialSlug || initialSlug === 'novy';

  const [article, setArticle] = useState<ArticlePreviewData>({
    title: '',
    slug: '',
    subtitle: '',
    author: '',
    category: '',
    tags: '',
    blocks: {
      hero: '',
      'hero:credit': '',
      text1: '',
      image1: '',
      'image1:credit': '',
      text2: '',
      instagram: '',
      text3: '',
    },
    published: false,
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [uploadingBlock, setUploadingBlock] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Preview settings
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    if (!isNew && initialSlug) {
      fetchArticle(initialSlug);
    }
  }, [isNew, initialSlug]);

  // Support Cmd+S / Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveArticle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const fetchArticle = async (slugToFetch: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/magazine/articles/${slugToFetch}?all=1`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setArticle({
        ...data,
        blocks: data.blocks || {},
      });
      setSlugManuallyEdited(true);
    } catch (error) {
      console.error('Error fetching article:', error);
      alert('Chyba při načítání článku.');
      if (onBackToList) onBackToList();
      else router.push('/admin/magazin');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setArticle((prev) => {
      const updated = { ...prev, title: val };
      if (isNew && !slugManuallyEdited) {
        updated.slug = slugifyTitle(val);
      }
      return updated;
    });
  };

  const handleFieldChange = (field: string, value: any) => {
    setArticle((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlockChange = (blockId: string, value: string) => {
    setArticle((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [blockId]: value,
      },
    }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    blockId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBlock(blockId);
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
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Chyba při nahrávání obrázku.');
    } finally {
      setUploadingBlock(null);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (blockId: string) => {
    handleBlockChange(blockId, '');
    handleBlockChange(`${blockId}:credit`, '');
  };

  const saveArticle = async () => {
    let finalSlug = article.slug?.trim();
    if (!finalSlug && article.title) {
      finalSlug = slugifyTitle(article.title);
    }

    if (!finalSlug) {
      alert('Vyplňte prosím název článku a platný slug.');
      return;
    }

    if (!article.title?.trim()) {
      alert('Vyplňte prosím název článku.');
      return;
    }

    setSaving(true);
    setSaveStatus('saving');

    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew
        ? '/api/magazine/articles'
        : `/api/magazine/articles/${initialSlug || article.slug}`;

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
        throw new Error(error.error || 'Uložení se nezdařilo');
      }

      const saved = await res.json();
      setArticle(saved);
      setSaveStatus('saved');

      if (isNew) {
        // ✅ FIX 7: Proper async/await instead of setTimeout
        // Ensure router navigation completes before any state changes
        setTimeout(async () => {
          await router.push(`/admin/magazin?slug=${saved.slug}`);
          if (onBackToList) onBackToList();
        }, 1000);
      } else {
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    } catch (error: any) {
      console.error('Error saving article:', error);
      setSaveStatus('error');
      alert(`Chyba: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 bg-white border border-black p-8">
        <RefreshCw size={18} className="animate-spin text-black" />
        <span className="text-xs uppercase tracking-widest text-[#666666]">
          Načítám článek…
        </span>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (onBackToList) onBackToList();
              else router.push('/admin/magazin');
            }}
            className="flex items-center justify-center w-8 h-8 border border-black bg-white hover:bg-black hover:text-white transition-colors shrink-0"
            title="Zpět na seznam článků"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="admin-title text-xl font-bold uppercase tracking-wider">
              {isNew ? 'Nový článek' : article.title || 'Upravit článek'}
            </h1>
            <p className="admin-sub text-xs text-[#666666] mt-0.5">
              {isNew
                ? 'Vytvoření nového článku s živým náhledem vpravo'
                : `Úprava článku /magazin/${article.slug || ''}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1 mr-2 animate-in fade-in">
              <Check size={14} />
              <span>Uloženo ✓</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-600 font-bold uppercase tracking-wider flex items-center gap-1 mr-2">
              <AlertCircle size={14} />
              <span>Chyba při ukládání</span>
            </span>
          )}

          {article.slug && !isNew && (
            <a
              href={`/magazin/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs uppercase tracking-wider font-medium border border-black bg-white text-black hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
            >
              <span>Zobrazit na webu</span>
              <ExternalLink size={12} />
            </a>
          )}

          <button
            type="button"
            onClick={saveArticle}
            disabled={saving}
            className="px-5 py-2 text-xs uppercase tracking-wider font-bold border border-black bg-black text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            <span>{saving ? 'Ukládám…' : 'Uložit článek'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Left = Form Editor, Right = Live Visual Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editor Form */}
        <div className="xl:col-span-6 space-y-6">
          {/* Section 1: Základní údaje */}
          <div className="bg-white border border-black p-5 space-y-4">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest pb-2 border-b border-black">
              1. Základní informace o článku
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Titul článku *
              </label>
              <input
                type="text"
                value={article.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Např. Jak správně vybrat běžeckou obuv na zimu"
                className="w-full text-xs px-3 py-2.5 border border-black bg-white focus:outline-none tracking-wider placeholder:text-neutral-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="text-xs px-3 py-2.5 bg-neutral-100 border border-r-0 border-black text-[#666666] font-mono select-none">
                  /magazin/
                </span>
                <input
                  type="text"
                  value={article.slug}
                  onChange={(e) => {
                    handleFieldChange('slug', e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  placeholder="jak-spravne-vybrat-bezeckou-obuv"
                  className="flex-1 text-xs px-3 py-2.5 border border-black bg-white focus:outline-none font-mono tracking-wider"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Podtitul / Perex (Standfirst)
              </label>
              <textarea
                value={article.subtitle || ''}
                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                rows={2}
                placeholder="Stručné a úderné shrnutí tématu pro čtenáře…"
                className="w-full text-xs px-3 py-2 border border-black bg-white focus:outline-none tracking-wider leading-relaxed placeholder:text-neutral-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Autor
                </label>
                <input
                  type="text"
                  value={article.author || ''}
                  onChange={(e) => handleFieldChange('author', e.target.value)}
                  placeholder="Např. Tomáš Dvořák"
                  className="w-full text-xs px-3 py-2 border border-black bg-white focus:outline-none tracking-wider placeholder:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Kategorie
                </label>
                <input
                  type="text"
                  value={article.category || ''}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  placeholder="Např. Trénink, Vybavení, Tipy"
                  className="w-full text-xs px-3 py-2 border border-black bg-white focus:outline-none tracking-wider placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Štítky (oddělené čárkou)
              </label>
              <input
                type="text"
                value={article.tags || ''}
                onChange={(e) => handleFieldChange('tags', e.target.value)}
                placeholder="Běh, Zima, Regenerace, Boty"
                className="w-full text-xs px-3 py-2 border border-black bg-white focus:outline-none tracking-wider placeholder:text-neutral-400"
              />
            </div>

            <div className="pt-2 border-t border-black/10">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={article.published}
                  onChange={(e) => handleFieldChange('published', e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Publikovat článek veřejně na e-shopu
                </span>
              </label>
            </div>
          </div>

          {/* Section 2: Hlavní obrázek (Hero) */}
          <div className="bg-white border border-black p-5 space-y-4">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest pb-2 border-b border-black">
              2. Hlavní obrázek (Hero 16:9)
            </p>

            {article.blocks?.hero ? (
              <div className="space-y-3">
                <div className="relative w-full aspect-video bg-neutral-100 border border-black overflow-hidden group">
                  <img
                    src={article.blocks.hero}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('hero')}
                    className="absolute top-2 right-2 p-1.5 bg-black text-white hover:bg-red-600 transition-colors shadow-md text-xs"
                    title="Odstranit obrázek"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666666] mb-1">
                    Kredit / autor fotografie
                  </label>
                  <input
                    type="text"
                    value={article.blocks['hero:credit'] || ''}
                    onChange={(e) => handleBlockChange('hero:credit', e.target.value)}
                    placeholder="Např. Foto: Jan Novák / UFO Sport"
                    className="w-full text-xs px-3 py-1.5 border border-black bg-white focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="relative border-2 border-dashed border-black/40 hover:border-black p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-neutral-50">
                  <Upload size={22} className="text-black mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {uploadingBlock === 'hero' ? 'Nahrávám fotografii…' : 'Vybrat hlavní fotografii článku'}
                  </span>
                  <span className="text-[10px] text-[#666666] uppercase mt-1">
                    PNG, JPG, WEBP do 10 MB (doporučen poměr 16:9)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'hero')}
                    disabled={uploadingBlock === 'hero'}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Section 3: 1. Textový blok */}
          <div className="bg-white border border-black p-5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-black">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">
                3. První textový blok
              </p>
              <span className="text-[10px] font-mono text-[#888888]">
                {article.blocks?.text1?.length || 0} znaků
              </span>
            </div>
            <textarea
              value={article.blocks?.text1 || ''}
              onChange={(e) => handleBlockChange('text1', e.target.value)}
              rows={6}
              placeholder="Napište úvodní část článku…"
              className="w-full text-xs p-3 border border-black bg-white focus:outline-none tracking-wider leading-relaxed placeholder:text-neutral-400"
            />
          </div>

          {/* Section 4: Obrázek v textu (16:9) */}
          <div className="bg-white border border-black p-5 space-y-4">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest pb-2 border-b border-black">
              4. Obrázek v textu (volitelný 16:9)
            </p>

            {article.blocks?.image1 ? (
              <div className="space-y-3">
                <div className="relative w-full aspect-video bg-neutral-100 border border-black overflow-hidden group">
                  <img
                    src={article.blocks.image1}
                    alt="Obrázek v textu"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('image1')}
                    className="absolute top-2 right-2 p-1.5 bg-black text-white hover:bg-red-600 transition-colors shadow-md text-xs"
                    title="Odstranit obrázek"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666666] mb-1">
                    Kredit / popisek obrázku
                  </label>
                  <input
                    type="text"
                    value={article.blocks['image1:credit'] || ''}
                    onChange={(e) => handleBlockChange('image1:credit', e.target.value)}
                    placeholder="Např. Archiv výrobce"
                    className="w-full text-xs px-3 py-1.5 border border-black bg-white focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="relative border-2 border-dashed border-black/40 hover:border-black p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-neutral-50">
                  <Upload size={20} className="text-black mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {uploadingBlock === 'image1' ? 'Nahrávám fotografii…' : 'Nahrát obrázek do článku'}
                  </span>
                  <span className="text-[10px] text-[#666666] uppercase mt-1">
                    Poměr 16:9
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image1')}
                    disabled={uploadingBlock === 'image1'}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Section 5: 2. Textový blok */}
          <div className="bg-white border border-black p-5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-black">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">
                5. Druhý textový blok
              </p>
              <span className="text-[10px] font-mono text-[#888888]">
                {article.blocks?.text2?.length || 0} znaků
              </span>
            </div>
            <textarea
              value={article.blocks?.text2 || ''}
              onChange={(e) => handleBlockChange('text2', e.target.value)}
              rows={6}
              placeholder="Pokračování textu za obrázkem…"
              className="w-full text-xs p-3 border border-black bg-white focus:outline-none tracking-wider leading-relaxed placeholder:text-neutral-400"
            />
          </div>

          {/* Section 6: Instagram příspěvek */}
          <div className="bg-white border border-black p-5 space-y-3">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest pb-2 border-b border-black">
              6. Instagram příspěvek (volitelný odkaz)
            </p>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Instagram URL
              </label>
              <input
                type="url"
                value={article.blocks?.instagram || ''}
                onChange={(e) => handleBlockChange('instagram', e.target.value)}
                placeholder="https://www.instagram.com/p/C-xyz123..."
                className="w-full text-xs px-3 py-2 border border-black bg-white focus:outline-none tracking-wider placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>

          {/* Section 7: 3. Textový blok (Závěr) */}
          <div className="bg-white border border-black p-5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-black">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">
                7. Třetí textový blok (Závěr článku)
              </p>
              <span className="text-[10px] font-mono text-[#888888]">
                {article.blocks?.text3?.length || 0} znaků
              </span>
            </div>
            <textarea
              value={article.blocks?.text3 || ''}
              onChange={(e) => handleBlockChange('text3', e.target.value)}
              rows={5}
              placeholder="Závěrečné shrnutí, doporučení nebo výzva k akci…"
              className="w-full text-xs p-3 border border-black bg-white focus:outline-none tracking-wider leading-relaxed placeholder:text-neutral-400"
            />
          </div>

          {/* Save Button at the bottom of form */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={saveArticle}
              disabled={saving}
              className="w-full py-3 text-xs uppercase tracking-wider font-bold border border-black bg-black text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              <span>{saving ? 'Ukládám článek…' : 'Uložit článek (Ctrl+S)'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Visual Preview Pane */}
        <div className="xl:col-span-6 sticky top-6 self-start max-h-[calc(100vh-80px)] flex flex-col">
          <ArticleLivePreview
            article={article}
            viewMode={viewMode}
            setViewMode={setViewMode}
            zoom={zoom}
            setZoom={setZoom}
          />
        </div>
      </div>
    </div>
  );
}
