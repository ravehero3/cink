'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Article {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export default function AdminMagazineListPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/magazine/articles?all=1');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (slug: string) => {
    try {
      const res = await fetch(`/api/magazine/articles/${slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      setArticles(articles.filter((a) => a.slug !== slug));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Chyba při mazání článku');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Magazín</h1>
        <button
          onClick={() => router.push('/admin/magazin/novy')}
          className="px-4 py-2 bg-black text-white font-semibold hover:bg-gray-800"
        >
          Nový článek
        </button>
      </div>

      {loading ? (
        <p>Načítání...</p>
      ) : articles.length === 0 ? (
        <p className="text-gray-500">Zatím zde nejsou žádné články.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Titul</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Poslední úprava</th>
                <th className="px-6 py-3 text-right font-semibold">Akce</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{article.title}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        article.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {article.published ? 'Zveřejněno' : 'Koncept'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600 text-xs">
                    {new Date(article.updatedAt).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <button
                      onClick={() => router.push(`/admin/magazin/${article.slug}`)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Upravit
                    </button>
                    <Link
                      href={`/magazin/${article.slug}`}
                      target="_blank"
                      className="text-gray-600 hover:underline text-xs"
                    >
                      Zobrazit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(article.slug)}
                      className="text-red-600 hover:underline text-xs"
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

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm">
            <h2 className="text-lg font-bold mb-4">Smazat článek?</h2>
            <p className="text-gray-600 mb-6">
              Tato akce je nevratná.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Zrušit
              </button>
              <button
                onClick={() => deleteArticle(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Smazat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
