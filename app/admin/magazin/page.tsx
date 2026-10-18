'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Trash2, Edit3, ExternalLink, RefreshCw } from 'lucide-react';
import MagazineArticleEditor from '@/components/admin/MagazineArticleEditor';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  category?: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export default function AdminMagazinePage() {
  const [activeTab, setActiveTab] = useState<'editor' | 'list'>('editor');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/magazine/articles?all=1');
      if (res.ok) {
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
        // If there are existing articles and no query param, list can be shown,
        // but default tab stays 'editor' if articles are 0 or user wants to write
        if (Array.isArray(data) && data.length > 0 && typeof window !== 'undefined') {
          const tabParam = new URLSearchParams(window.location.search).get('tab');
          if (tabParam === 'list') {
            setActiveTab('list');
          }
        }
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (slug: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/magazine/articles/${slug}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.slug !== slug));
        setDeleteConfirmSlug(null);
        if (editingSlug === slug) {
          setEditingSlug(null);
        }
      } else {
        alert('Chyba při mazání článku');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Chyba při mazání článku');
    } finally {
      setDeleting(false);
    }
  };

  const handleStartNew = () => {
    setEditingSlug(null);
    setActiveTab('editor');
  };

  const handleEditArticle = (slug: string) => {
    setEditingSlug(slug);
    setActiveTab('editor');
  };

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black">
        <div>
          <h1 className="admin-title text-xl font-bold uppercase tracking-wider">Magazín</h1>
          <p className="admin-sub text-xs text-[#666666] mt-0.5">
            Správa redakčních článků s živým vizuálním náhledem
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartNew}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border border-black transition-colors flex items-center gap-1.5 ${
              activeTab === 'editor' && !editingSlug
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <Plus size={13} />
            <span>Nový článek</span>
          </button>

          {editingSlug && (
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border border-black transition-colors flex items-center gap-1.5 ${
                activeTab === 'editor' && editingSlug
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <Edit3 size={13} />
              <span>Upravit ({editingSlug})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border border-black transition-colors flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <FileText size={13} />
            <span>Seznam článků ({articles.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Editor with Live Preview */}
      {activeTab === 'editor' && (
        <MagazineArticleEditor
          key={editingSlug || 'new'}
          initialSlug={editingSlug || undefined}
          onBackToList={() => {
            fetchArticles();
            setActiveTab('list');
          }}
        />
      )}

      {/* Tab 2: Articles List */}
      {activeTab === 'list' && (
        <div className="bg-white border border-black overflow-hidden shadow-sm">
          <div className="p-4 border-b border-black flex items-center justify-between bg-neutral-50 text-xs font-bold uppercase tracking-wider">
            <span>Přehled všech článků v magazínu</span>
            <button
              type="button"
              onClick={handleStartNew}
              className="px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              <Plus size={12} />
              <span>Přidat článek</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[#888888] uppercase tracking-wider">
              <RefreshCw size={16} className="animate-spin mx-auto mb-2 text-black" />
              Načítám články…
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-xs uppercase text-[#666666] tracking-wider">
                V magazínu zatím nejsou vytvořeny žádné články.
              </p>
              <button
                type="button"
                onClick={handleStartNew}
                className="px-4 py-2 bg-black text-white text-xs uppercase font-bold tracking-wider hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>Napsat první článek</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-black bg-neutral-100 text-[10px] uppercase tracking-widest text-[#666666]">
                    <th className="px-5 py-3">Název článku</th>
                    <th className="px-5 py-3">Kategorie</th>
                    <th className="px-5 py-3">Stav</th>
                    <th className="px-5 py-3">Datum aktualizace</th>
                    <th className="px-5 py-3 text-right">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {articles.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold uppercase tracking-wider text-black text-xs">
                          {item.title}
                        </p>
                        <p className="text-[11px] font-mono text-[#888888] mt-0.5">
                          /magazin/{item.slug}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-black/20 bg-neutral-100">
                          {item.category || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                            item.published
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                          }`}
                        >
                          {item.published ? 'Zveřejněno' : 'Koncept'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#666666] font-mono text-[11px]">
                        {new Date(item.updatedAt).toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditArticle(item.slug)}
                          className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-black bg-white hover:bg-black hover:text-white transition-colors"
                        >
                          Upravit
                        </button>
                        <Link
                          href={`/magazin/${item.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-black bg-white hover:bg-black hover:text-white transition-colors inline-block"
                        >
                          Zobrazit ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmSlug(item.slug)}
                          className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          Smazat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmSlug)}
        title="Smazat článek"
        message={`Opravdu si přejete smazat článek „${deleteConfirmSlug}“? Tuto akci nelze vzít zpět.`}
        confirmLabel="Smazat"
        isDestructive={true}
        loading={deleting}
        onConfirm={() => deleteConfirmSlug && deleteArticle(deleteConfirmSlug)}
        onCancel={() => setDeleteConfirmSlug(null)}
      />
    </div>
  );
}
