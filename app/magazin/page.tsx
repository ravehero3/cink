'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header1 from '@/components/Header1';
import Footer from '@/components/Footer';

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category?: string;
  author?: string;
  blocks: any;
  publishedAt: string;
}

export default function MagazinePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/magazine/articles');
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header1 />
      
      <main className="flex-1">
        {/* Hero section */}
        <section className="magazin-hero border-b border-black py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h1 className="magazin-title text-4xl md:text-5xl font-bold mb-4">
              Magazín
            </h1>
            <p className="magazin-subtitle text-lg text-gray-600">
              Inspirace a tipy ze světa UFO SPORT
            </p>
          </div>
        </section>

        {/* Articles grid */}
        <section className="magazin-grid py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            {loading ? (
              <p className="text-center text-gray-500">Načítání...</p>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Zatím zde nejsou žádné články.</p>
                <p className="text-sm text-gray-400">Vraťte se brzy!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/magazin/${article.slug}`}
                    className="magazin-card group hover:opacity-80 transition-opacity"
                  >
                    {/* Hero image */}
                    {article.blocks.hero && (
                      <div className="magazin-card-image relative w-full h-48 md:h-56 bg-gray-100 mb-4 overflow-hidden">
                        <Image
                          src={article.blocks.hero}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Card content */}
                    <div className="magazin-card-content">
                      {/* Meta */}
                      <div className="magazin-card-meta flex items-center gap-2 text-xs uppercase text-gray-500 mb-2">
                        {article.category && <span>{article.category}</span>}
                        {article.category && article.author && <span>•</span>}
                        {article.author && <span>{article.author}</span>}
                      </div>

                      {/* Title */}
                      <h2 className="magazin-card-title text-xl font-bold mb-3 line-clamp-2">
                        {article.title}
                      </h2>

                      {/* Subtitle/Standfirst */}
                      {article.subtitle && (
                        <p className="magazin-card-subtitle text-sm text-gray-600 line-clamp-2">
                          {article.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
